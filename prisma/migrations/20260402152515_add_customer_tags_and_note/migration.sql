-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "note" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
