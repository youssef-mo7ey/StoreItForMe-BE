import { Router } from "express";
import { authenticate, AuthRequest } from "../../middlewares/auth.middleware";
import { AddressController } from "./address.controller";
import { AddressService } from "./address.service";
const router = Router();
const controller = new AddressController(new AddressService());

//create address
router.post("/", authenticate, (req, res) => {
  return controller.createAddress(req as AuthRequest, res);
});
//get addresses
router.get("/", authenticate, (req, res) => {
  return controller.getAddresses(req as AuthRequest, res);
});
//delete address
router.delete("/:id", authenticate, (req, res) => {
  return controller.deleteAddress(req as AuthRequest, res);
});
//update address
router.put("/:id", authenticate, (req, res) => {
  return controller.updateAddress(req as AuthRequest, res);
});
//get address
router.get("/:id", authenticate, (req, res) => {
  return controller.getAddress(req as AuthRequest, res);
});


export default router;
