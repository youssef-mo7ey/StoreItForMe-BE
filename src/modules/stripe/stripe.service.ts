import Stripe from "stripe";
import prisma from "../../config/database";
import {
  initFeePriceId,
  stripeWebHookSecretKey,
  stripe,
} from "../../config/stripe";
import { OrderInitData } from "../../types";

export class stripeService {
  // Stripe service methods would go here
  async initOrder(userId: string, orderInitData: OrderInitData) {
    // Implementation for initializing an order
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      let stripeCustomerId: string | undefined =
        user?.stripeCustomerId ?? undefined;
      if (!user?.stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user?.email || undefined,
          name: user?.name || undefined,
          metadata: { userId },
        });
        stripeCustomerId = customer.id;
        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId: stripeCustomerId },
        });
      }

      // ensure initFeePriceId is present and non-null
      if (!initFeePriceId) {
        return Promise.reject(new Error("Init fee price id is not configured"));
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"] as any,
        mode: "payment",
        customer: stripeCustomerId ?? undefined,
        line_items: [
          { price: initFeePriceId, quantity: 1 }, // Add your line items here
        ],
        success_url: process.env.FRONTEND_URL,
        cancel_url: process.env.FRONTEND_URL,
        metadata: {
          userId: userId,
          orderInitData: JSON.stringify(orderInitData),
        },
      });
      return session;
    } catch (error) {
      return Promise.reject(error);
    }
    return;
  }

  //webhook handling
  async handleWebhook(body: Buffer | string, signature: string) {
    let event: Stripe.Event;
    if (!signature || !stripeWebHookSecretKey) {
      throw new Error("Invalid webhook signature or secret");
    }
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        stripeWebHookSecretKey!
      );
      // Handle the event
      try {
        switch (event.type) {
          case "checkout.session.completed":
            await this.handleCheckoutSessionCompleted(
              event.data.object as Stripe.Checkout.Session
            );
            break;

          case "payment_intent.succeeded":
            console.log("💰 Payment succeeded:", event.data.object.id);
            break;

          default:
            console.log(`ℹ️  Unhandled event type: ${event.type}`);
        }
      } catch (err) {
        return Promise.reject(err);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session
  ) {
    console.log("🎉 Checkout session completed:", session.id);

    try {
      if (!session.metadata?.orderInitData) {
        console.error("❌ No orderInitData in session metadata");
        return;
      }

      // CRITICAL FIX: userId is already a string in metadata, no need to parse
      const userId = session.metadata.userId;
      const orderInitData: OrderInitData = JSON.parse(
        session.metadata.orderInitData
      );

      // CRITICAL FIX: Parse userId from orderInitData if it's stringified there
      const actualUserId = userId;

      // Create the order
      const order = await prisma.order.create({
        data: {
          userId: actualUserId,
          protectionPlan: orderInitData.protectionPlan as any,
          packingKitQuantity: orderInitData.withKit
            ? orderInitData.packingKitQuantity
            : 0,
          kitShippingDate: orderInitData.withKit
            ? orderInitData.kitShippingDate
            : null,
          kitShippingAddressId: orderInitData.withKit
            ? orderInitData.kitShippingAddressId
            : null,
          status: orderInitData.withKit
            ? "AWAITING_FOR_KIT_SHIPMENT"
            : "AWAITING_FOR_PICKUP_SCHEDULING",
        },
      });
      if (
        orderInitData.collaborators &&
        orderInitData.collaborators.length > 0
      ) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            collaborators: {
              connect: orderInitData.collaborators.map(
                (collaboratorId: string) => ({
                  id: collaboratorId,
                })
              ),
            },
          },
        });
      }

      console.log("✅ Order created successfully:", order.id);
    } catch (error: any) {
      console.error("❌ Error creating order:", error.message);
      throw error;
    }
  }
}
