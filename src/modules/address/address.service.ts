import { type Address } from "@prisma/client";
import { AddressInput } from "../../types";
import prisma from "../../config/database";

export class AddressService {

    async createAddress(userId: string, addressData: AddressInput): Promise<Address> {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error("User not found");
        }
        if( !addressData.country ) {
            addressData.country = "Spain"; // default country
        }
        if( !addressData.label ) {
            addressData.label = addressData.street1; // default label
        }
        return await prisma.address.create({
            data: {
                userId: user.id,
                ...addressData,
            },
        });
    }

    async getAddressById(addressId: string): Promise<Address | null> {
        return await prisma.address.findUnique({
            where: { id: addressId },
        });
    }

    async getAddressesByUserId(userId: string): Promise<Address[]> {
        return await prisma.address.findMany({
            where: { userId },
        });
    }

    async updateAddress(addressId: string, addressData: AddressInput): Promise<Address> {
        return await prisma.address.update({
            where: { id: addressId },
            data: addressData,
        });
    }

    async deleteAddress(addressId: string): Promise<Address> {
        return await prisma.address.delete({
            where: { id: addressId },
        });
    }
}
