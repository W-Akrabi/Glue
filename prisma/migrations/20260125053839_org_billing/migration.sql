-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "billingCardBrand" TEXT,
ADD COLUMN     "billingCardLast4" TEXT,
ADD COLUMN     "billingUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "planCurrency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "planPriceCents" INTEGER NOT NULL DEFAULT 400,
ADD COLUMN     "subscriptionStatus" TEXT NOT NULL DEFAULT 'inactive';
