import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { stripeService } from "./stripe.service";


export class StripeController {
  constructor(private stripeService: stripeService) {}
  // Define your methods here, e.g., addCollaborator, getCollaborators, etc.
  async initOrder(req: AuthRequest, res: Response) {
    // Implementation for initializing an order
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const orderInitData = req.body;
      const session = await this.stripeService.initOrder(userId, orderInitData);
      res.status(200).json(session);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to initialize order" });
    }
  }
  async webhook(req: AuthRequest, res: Response) {
    try {
      const body = req.body;
      const signature = req.headers["stripe-signature"] as string;
      await this.stripeService.handleWebhook(body, signature);
      res.status(200).json({ received: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Webhook handling failed" });
    }
  }
}
