import { Order, OrderStatus } from "@prisma/client";
import prisma from "../../config/database";

export class OrderService {
  //--- Multiple Orders Retrieval Method ---
  async getOrders(userId: string): Promise<Order[]> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }
    try {
      const orders = await prisma.order.findMany({
        where: { userId },
      });
      return orders;
    } catch (err) {
      console.error(err);
      throw new Error("Service: Failed to retrieve orders");
    }
  }
  //--- Single Order Retrieval Method ---
  async getOrderById(orderId: string): Promise<Order | null> {
    return await prisma.order.findUnique({
      where: { id: orderId },
    });
  }
  //--- Order Status Management Method ---
  async changeOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<Order> {
    return await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }
  //--- Order Ownership Validation Method ---
  async ValidateOrderOwnership(
    userId: string,
    orderId: string
  ): Promise<boolean> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      throw new Error("Order not found");
    }
    return order.userId === userId;
  }
  //--- get all orders for admin ---
  async getAllOrders(
    customerId?: string,
    orderStatus?: OrderStatus
  ): Promise<Order[]> {
    try {
      let orders = await prisma.order.findMany();
      if (customerId) {
        orders = orders.filter((order) => order.userId === customerId);
      }
      if (orderStatus) {
        orders = orders.filter((order) => order.status === orderStatus);
      }
      return orders;
    } catch (err) {
      console.error(err);
      throw new Error("Service: Failed to retrieve orders ADMIN");
    }
  }
}
