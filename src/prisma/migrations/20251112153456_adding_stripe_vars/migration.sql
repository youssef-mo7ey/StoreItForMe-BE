-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeOneTimePayment" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT,
ADD COLUMN     "subscriptionStartDate" TIMESTAMP(3),
ALTER COLUMN "serviceType" DROP NOT NULL,
ALTER COLUMN "storageTerm" DROP NOT NULL,
ALTER COLUMN "paymentPlanType" DROP NOT NULL;
