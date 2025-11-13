import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { AddressService } from "./address.service";

export class AddressController {
  constructor(private addressService: AddressService) {}
  async createAddress(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const address = await this.addressService.createAddress(userId, req.body);
      res.status(201).json(address);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to create address" });
    }
  }
  async getAddresses(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const addresses = await this.addressService.getAddressesByUserId(userId);
      res.status(200).json(addresses);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to retrieve addresses" });
    }
  }
  async deleteAddress(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const addressId = req.params.id;
      const deletedAddress = await this.addressService.deleteAddress(addressId);
      res.status(200).json(deletedAddress);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to delete address" });
    }
  }
  async updateAddress(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const addressId = req.params.id;
      const updatedAddress = await this.addressService.updateAddress(
        addressId,
        req.body
      );
      res.status(200).json(updatedAddress);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update address" });
    }
  }
  async getAddress(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const addressId = req.params.id;
      const address = await this.addressService.getAddressById(addressId);
      res.status(200).json(address);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to retrieve address" });
    }
  }
}
