import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { OrderService } from "./order.service";
import { OrderStatus } from "@prisma/client";

export class OrderController {
  constructor(private orderService: OrderService) {}
  async getOrders(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      // Implementation for retrieving orders
      const orders = await this.orderService.getOrders(userId);
      res.status(200).json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to retrieve orders" });
    }
  }

  async getOrderById(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const orderId = req.params.id;
      const order = await this.orderService.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.status(200).json(order);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to retrieve order" });
    }
  }

  async changeOrderStatus(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const orderId = req.params.id;
      const { status } = req.body;
      if (!Object.values(OrderStatus as object).includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      const updatedOrder = await this.orderService.changeOrderStatus(orderId, status);
      res.status(200).json(updatedOrder);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update order status" });
    }
  }

  async validateOrderOwnership(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const orderId = req.params.id;
      const isOwner = await this.orderService.ValidateOrderOwnership(userId, orderId);
      res.status(200).json({ isOwner });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to validate order ownership" });
    }
  }
}
