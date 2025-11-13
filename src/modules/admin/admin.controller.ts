import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { AdminService } from "./admin.service";
import { OrderStatus } from "@prisma/client";

export class AdminController {
  constructor(private adminService: AdminService) {}
  //get all orders with optional filters
  async getOrders(req: AuthRequest, res: Response) {
    try {
      const { status, userId } = req.query;
      const orders = await this.adminService.getOrders(
        userId as string | undefined,
        status as OrderStatus | undefined
      );
      res.status(200).json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to retrieve orders" });
    }
  }

  //register a users as admin
  async registerAdmin(req: AuthRequest, res: Response) {
    try {
      const adminData = req.body;
      const userId = req.user?.id;
      const newAdmin = await this.adminService.registerAdmin(userId!,adminData);
      res.status(201).json(newAdmin);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to register admin" });
    }
  }  
}
