import { Router } from "express";
import { authenticate, AuthRequest } from "../../middlewares/auth.middleware";
import { StripeController } from "./stripe.controller";
import express from "express";
import { stripeService } from "./stripe.service";

const router = Router();
const controller = new StripeController(new stripeService());

router.post("/webhook", express.raw({ type: "application/json" }), (req, res) =>
  controller.webhook(req as AuthRequest, res)
);

router.use(express.json());
router.post("/initOrder", authenticate, (req, res) =>
  controller.initOrder(req as AuthRequest, res)
);

export default router;
