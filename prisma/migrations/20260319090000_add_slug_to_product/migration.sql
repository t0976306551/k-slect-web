-- AlterTable: 新增 slug 欄位（nullable）至 Product
ALTER TABLE "Product" ADD COLUMN "slug" TEXT;

-- CreateIndex: slug 唯一索引
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
