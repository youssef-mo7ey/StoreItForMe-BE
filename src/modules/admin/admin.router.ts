import { Router } from "express";
import {
  authenticate,
  authorize,
  AuthRequest,
} from "../../middlewares/auth.middleware";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { OrderService } from "../order/order.service";
import { AuthService } from "../auth/auth.service";

const router = Router();
const controller = new AdminController(
  new AdminService(new OrderService(), new AuthService())
);

//register admin
router.post("/register", authenticate, authorize("ADMIN"), (req, res) => {
  return controller.registerAdmin(req as AuthRequest, res);
});
//get orders
router.get("/orders", authenticate, authorize("ADMIN"), (req, res) => {
  return controller.getOrders(req as AuthRequest, res);
});

export default router;
