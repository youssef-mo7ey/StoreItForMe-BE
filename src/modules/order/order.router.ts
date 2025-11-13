import { Router } from "express";
import { authenticate, AuthRequest } from "../../middlewares/auth.middleware";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";

const router = Router();
const controller = new OrderController(new OrderService());

//create orders
router.get("/", authenticate, (req, res) => {
  return controller.getOrders(req as AuthRequest, res);
});
//get order by id
router.get("/:id", authenticate, (req, res) => {
  return controller.getOrderById(req as AuthRequest, res);
});
//change order status
router.put("/:id/status", authenticate, (req, res) => {
  return controller.changeOrderStatus(req as AuthRequest, res);
});
//validate order ownership
router.get("/:id/validate", authenticate, (req, res) => {
  return controller.validateOrderOwnership(req as AuthRequest, res);
});


export default router;
