import { OrderStatus } from "@prisma/client";
import { OrderService } from "../order/order.service";
import { AuthService } from "../auth/auth.service";
import { LocalRegisterInput } from "../../types/auth.types";

export class AdminService {
  constructor(private orderService: OrderService, private authService: AuthService) {}
  async getOrders(userId?: string, status?: OrderStatus) {
    try {
      const orders = await this.orderService.getAllOrders(userId, status);
      return orders;
    } catch (err) {
      console.error(err);
      throw new Error("Service: Failed to retrieve orders ADMIN");
    }
  }
  async registerAdmin(userId: string, userData: LocalRegisterInput): Promise<void> {
    try {
      const newAdmin = await this.authService.adminRegister(userId, userData);
      return newAdmin;
    } catch (err) {
      console.error(err);
      throw new Error("Service: Admin registration failed");
    }
  }
}
