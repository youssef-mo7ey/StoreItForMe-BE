/*
  Warnings:

  - Made the column `label` on table `Address` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "label" SET NOT NULL;
