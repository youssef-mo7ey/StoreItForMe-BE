/*
  Warnings:

  - You are about to drop the column `collaboratorId` on the `Order` table. All the data in the column will be lost.
  - Changed the type of `status` on the `Order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('AWAITING_FOR_KIT_SHIPMENT', 'AWAITING_FOR_PICKUP_SCHEDULING', 'AWAITING_FOR_DROP_OFF_SCHEDULING', 'COMPLETED', 'CLOSED');

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "collaboratorId",
DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus" NOT NULL;
