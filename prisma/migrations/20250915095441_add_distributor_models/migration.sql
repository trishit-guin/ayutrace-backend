-- CreateEnum
CREATE TYPE "public"."InventoryProductType" AS ENUM ('RAW_MATERIAL_BATCH', 'FINISHED_GOOD');

-- CreateEnum
CREATE TYPE "public"."InventoryStatus" AS ENUM ('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'RESERVED', 'DAMAGED', 'EXPIRED', 'QUARANTINED');

-- CreateEnum
CREATE TYPE "public"."RecipientType" AS ENUM ('MANUFACTURER', 'DISTRIBUTOR', 'RETAILER', 'CUSTOMER', 'LAB');

-- CreateEnum
CREATE TYPE "public"."ShipmentStatus" AS ENUM ('PREPARING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'DELAYED', 'CANCELLED', 'RETURNED');

-- CreateEnum
CREATE TYPE "public"."DistributorVerificationType" AS ENUM ('INCOMING_GOODS_VERIFICATION', 'QUALITY_CHECK', 'AUTHENTICITY_VERIFICATION', 'BATCH_VERIFICATION', 'DOCUMENT_VERIFICATION', 'STORAGE_CONDITION_CHECK', 'EXPIRY_VERIFICATION');

-- CreateEnum
CREATE TYPE "public"."VerificationEntityType" AS ENUM ('RAW_MATERIAL_BATCH', 'FINISHED_GOOD', 'SHIPMENT', 'INVENTORY_ITEM');

-- CreateEnum
CREATE TYPE "public"."VerificationStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'VERIFIED', 'REJECTED', 'REQUIRES_ATTENTION');

-- CreateEnum
CREATE TYPE "public"."AnalyticsReportType" AS ENUM ('INVENTORY_SUMMARY', 'SHIPMENT_ANALYSIS', 'QUALITY_METRICS', 'FINANCIAL_SUMMARY', 'PERFORMANCE_KPI');

-- CreateEnum
CREATE TYPE "public"."AnalyticsPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- AlterTable
ALTER TABLE "public"."documents" ADD COLUMN     "shipment_id" TEXT;

-- CreateTable
CREATE TABLE "public"."distributor_inventory" (
    "inventory_id" TEXT NOT NULL,
    "distributor_id" TEXT NOT NULL,
    "product_type" "public"."InventoryProductType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" "public"."QuantityUnit" NOT NULL,
    "location" TEXT,
    "warehouse_section" TEXT,
    "status" "public"."InventoryStatus" NOT NULL DEFAULT 'IN_STOCK',
    "received_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3),
    "supplier_info" JSONB,
    "quality_notes" TEXT,
    "storage_conditions" TEXT,
    "last_updated" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "distributor_inventory_pkey" PRIMARY KEY ("inventory_id")
);

-- CreateTable
CREATE TABLE "public"."distributor_shipments" (
    "shipment_id" TEXT NOT NULL,
    "distributor_id" TEXT NOT NULL,
    "shipment_number" TEXT NOT NULL,
    "recipient_type" "public"."RecipientType" NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "recipient_name" TEXT NOT NULL,
    "recipient_address" TEXT NOT NULL,
    "recipient_phone" TEXT,
    "shipment_date" TIMESTAMP(3) NOT NULL,
    "expected_delivery" TIMESTAMP(3),
    "actual_delivery" TIMESTAMP(3),
    "status" "public"."ShipmentStatus" NOT NULL DEFAULT 'PREPARING',
    "tracking_number" TEXT,
    "carrier_info" JSONB,
    "shipping_cost" DOUBLE PRECISION,
    "total_value" DOUBLE PRECISION,
    "notes" TEXT,
    "special_instructions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "distributor_shipments_pkey" PRIMARY KEY ("shipment_id")
);

-- CreateTable
CREATE TABLE "public"."shipment_items" (
    "item_id" TEXT NOT NULL,
    "shipment_id" TEXT NOT NULL,
    "product_type" "public"."InventoryProductType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" "public"."QuantityUnit" NOT NULL,
    "unit_price" DOUBLE PRECISION,
    "total_price" DOUBLE PRECISION,
    "batch_number" TEXT,
    "expiry_date" TIMESTAMP(3),
    "quality_grade" TEXT,

    CONSTRAINT "shipment_items_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "public"."distributor_verifications" (
    "verification_id" TEXT NOT NULL,
    "distributor_id" TEXT NOT NULL,
    "verification_type" "public"."DistributorVerificationType" NOT NULL,
    "entity_type" "public"."VerificationEntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "status" "public"."VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verification_date" TIMESTAMP(3),
    "verified_by" TEXT,
    "verification_method" TEXT,
    "results" JSONB,
    "notes" TEXT,
    "photos_urls" TEXT[],
    "document_refs" TEXT[],
    "blockchain_tx_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "distributor_verifications_pkey" PRIMARY KEY ("verification_id")
);

-- CreateTable
CREATE TABLE "public"."distributor_analytics" (
    "analytics_id" TEXT NOT NULL,
    "distributor_id" TEXT NOT NULL,
    "report_date" TIMESTAMP(3) NOT NULL,
    "report_type" "public"."AnalyticsReportType" NOT NULL,
    "period" "public"."AnalyticsPeriod" NOT NULL,
    "total_inventory_value" DOUBLE PRECISION,
    "total_units" DOUBLE PRECISION,
    "low_stock_items" INTEGER,
    "expiring_soon_items" INTEGER,
    "total_shipments" INTEGER,
    "completed_shipments" INTEGER,
    "pending_shipments" INTEGER,
    "total_shipment_value" DOUBLE PRECISION,
    "average_delivery_time" DOUBLE PRECISION,
    "verifications_performed" INTEGER,
    "quality_issues_found" INTEGER,
    "custom_metrics" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "distributor_analytics_pkey" PRIMARY KEY ("analytics_id")
);

-- CreateTable
CREATE TABLE "public"."_InventoryShipments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_InventoryShipments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "distributor_shipments_shipment_number_key" ON "public"."distributor_shipments"("shipment_number");

-- CreateIndex
CREATE INDEX "_InventoryShipments_B_index" ON "public"."_InventoryShipments"("B");

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "public"."distributor_shipments"("shipment_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."distributor_inventory" ADD CONSTRAINT "distributor_inventory_distributor_id_fkey" FOREIGN KEY ("distributor_id") REFERENCES "public"."users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."distributor_shipments" ADD CONSTRAINT "distributor_shipments_distributor_id_fkey" FOREIGN KEY ("distributor_id") REFERENCES "public"."users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."distributor_shipments" ADD CONSTRAINT "distributor_shipments_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shipment_items" ADD CONSTRAINT "shipment_items_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "public"."distributor_shipments"("shipment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."distributor_verifications" ADD CONSTRAINT "distributor_verifications_distributor_id_fkey" FOREIGN KEY ("distributor_id") REFERENCES "public"."users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."distributor_verifications" ADD CONSTRAINT "distributor_verifications_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."distributor_verifications" ADD CONSTRAINT "distributor_verifications_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "public"."distributor_inventory"("inventory_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."distributor_analytics" ADD CONSTRAINT "distributor_analytics_distributor_id_fkey" FOREIGN KEY ("distributor_id") REFERENCES "public"."users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_InventoryShipments" ADD CONSTRAINT "_InventoryShipments_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."distributor_inventory"("inventory_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_InventoryShipments" ADD CONSTRAINT "_InventoryShipments_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."distributor_shipments"("shipment_id") ON DELETE CASCADE ON UPDATE CASCADE;
