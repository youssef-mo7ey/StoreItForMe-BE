import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
  typescript: true,
});

export const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;
export const stripeWebHookSecretKey = process.env.STRRIPE_WEBHOOK_SECRET!;
export const initFeePriceId = process.env.Init_FEE_PRICE_ID!;
