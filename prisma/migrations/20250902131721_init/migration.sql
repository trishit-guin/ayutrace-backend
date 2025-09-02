-- CreateEnum
CREATE TYPE "public"."OrgType" AS ENUM ('COOPERATIVE', 'PROCESSOR', 'LABORATORY', 'MANUFACTURER', 'REGULATOR');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('FARMER', 'COOP_ADMIN', 'PROCESSOR', 'LAB_TECH', 'MANUFACTURER_QA', 'REGULATOR_ADMIN');

-- CreateEnum
CREATE TYPE "public"."BatchStatus" AS ENUM ('COLLECTED', 'IN_TRANSIT', 'PROCESSING', 'AWAITING_TEST', 'TEST_PASSED', 'TEST_FAILED', 'FORMULATED', 'RECALLED');

-- CreateEnum
CREATE TYPE "public"."SupplyEventType" AS ENUM ('PROCESSING', 'QUALITY_TEST', 'CUSTODY_TRANSFER');

-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('LAB_CERTIFICATE', 'HARVEST_PHOTO', 'SHIPPING_MANIFEST', 'ORGANIC_CERTIFICATION');

-- CreateEnum
CREATE TYPE "public"."AuditAction" AS ENUM ('USER_LOGIN', 'USER_LOGOUT', 'CREATE_BATCH', 'UPDATE_BATCH_STATUS', 'ADD_SUPPLY_CHAIN_EVENT', 'GENERATE_FINISHED_GOOD', 'VIEW_PROVENANCE');

-- CreateTable
CREATE TABLE "public"."Organization" (
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."OrgType" NOT NULL,
    "msp_id" TEXT NOT NULL,
    "contact_info" JSONB,
    "registration_details" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("organizationId")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "userId" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "blockchain_identity" TEXT NOT NULL,
    "phone" TEXT,
    "last_login" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."SpeciesRule" (
    "species_code" TEXT NOT NULL,
    "common_name" TEXT NOT NULL,
    "scientific_name" TEXT NOT NULL,
    "harvest_start_day" INTEGER NOT NULL,
    "harvest_end_day" INTEGER NOT NULL,
    "geo_fence" geography NOT NULL,
    "quality_thresholds" JSONB,

    CONSTRAINT "SpeciesRule_pkey" PRIMARY KEY ("species_code")
);

-- CreateTable
CREATE TABLE "public"."RawMaterialBatch" (
    "batchId" TEXT NOT NULL,
    "batch_name" TEXT,
    "species_code" TEXT NOT NULL,
    "current_status" "public"."BatchStatus" NOT NULL DEFAULT 'COLLECTED',
    "current_owner_org_id" TEXT NOT NULL,
    "blockchain_ref_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RawMaterialBatch_pkey" PRIMARY KEY ("batchId")
);

-- CreateTable
CREATE TABLE "public"."CollectionEvent" (
    "eventId" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "collector_id" TEXT NOT NULL,
    "collection_time" TIMESTAMP(3) NOT NULL,
    "location" geography NOT NULL,
    "quantity_kg" DECIMAL(65,30) NOT NULL,
    "initial_quality_metrics" JSONB,
    "blockchain_tx_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollectionEvent_pkey" PRIMARY KEY ("eventId")
);

-- CreateTable
CREATE TABLE "public"."SupplyChainEvent" (
    "eventId" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "actor_org_id" TEXT NOT NULL,
    "event_type" "public"."SupplyEventType" NOT NULL,
    "event_timestamp" TIMESTAMP(3) NOT NULL,
    "event_details" JSONB NOT NULL,
    "blockchain_tx_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplyChainEvent_pkey" PRIMARY KEY ("eventId")
);

-- CreateTable
CREATE TABLE "public"."FinishedGood" (
    "productId" TEXT NOT NULL,
    "manufacturer_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "batch_number" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "qr_code_id" TEXT NOT NULL,
    "manufacturing_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinishedGood_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "public"."FGBatchComposition" (
    "compositionId" TEXT NOT NULL,
    "finished_good_id" TEXT NOT NULL,
    "raw_material_batch_id" TEXT NOT NULL,
    "quantity_used_kg" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "FGBatchComposition_pkey" PRIMARY KEY ("compositionId")
);

-- CreateTable
CREATE TABLE "public"."Document" (
    "documentId" TEXT NOT NULL,
    "document_type" "public"."DocumentType" NOT NULL,
    "original_filename" TEXT NOT NULL,
    "storage_hash" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_size_bytes" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raw_material_batch_id" TEXT,
    "collection_event_id" TEXT,
    "supply_chain_event_id" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("documentId")
);

-- CreateTable
CREATE TABLE "public"."Device" (
    "deviceId" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "device_identifier" TEXT NOT NULL,
    "device_name" TEXT NOT NULL,
    "last_sync_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("deviceId")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "auditId" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "action" "public"."AuditAction" NOT NULL,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("auditId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "public"."Organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_msp_id_key" ON "public"."Organization"("msp_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_blockchain_identity_key" ON "public"."User"("blockchain_identity");

-- CreateIndex
CREATE UNIQUE INDEX "RawMaterialBatch_blockchain_ref_id_key" ON "public"."RawMaterialBatch"("blockchain_ref_id");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionEvent_batch_id_key" ON "public"."CollectionEvent"("batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionEvent_blockchain_tx_hash_key" ON "public"."CollectionEvent"("blockchain_tx_hash");

-- CreateIndex
CREATE UNIQUE INDEX "SupplyChainEvent_blockchain_tx_hash_key" ON "public"."SupplyChainEvent"("blockchain_tx_hash");

-- CreateIndex
CREATE UNIQUE INDEX "FinishedGood_sku_key" ON "public"."FinishedGood"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "FinishedGood_qr_code_id_key" ON "public"."FinishedGood"("qr_code_id");

-- CreateIndex
CREATE UNIQUE INDEX "FGBatchComposition_finished_good_id_raw_material_batch_id_key" ON "public"."FGBatchComposition"("finished_good_id", "raw_material_batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "Document_storage_hash_key" ON "public"."Document"("storage_hash");

-- CreateIndex
CREATE UNIQUE INDEX "Device_device_identifier_key" ON "public"."Device"("device_identifier");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RawMaterialBatch" ADD CONSTRAINT "RawMaterialBatch_species_code_fkey" FOREIGN KEY ("species_code") REFERENCES "public"."SpeciesRule"("species_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RawMaterialBatch" ADD CONSTRAINT "RawMaterialBatch_current_owner_org_id_fkey" FOREIGN KEY ("current_owner_org_id") REFERENCES "public"."Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CollectionEvent" ADD CONSTRAINT "CollectionEvent_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."RawMaterialBatch"("batchId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CollectionEvent" ADD CONSTRAINT "CollectionEvent_collector_id_fkey" FOREIGN KEY ("collector_id") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SupplyChainEvent" ADD CONSTRAINT "SupplyChainEvent_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."RawMaterialBatch"("batchId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SupplyChainEvent" ADD CONSTRAINT "SupplyChainEvent_actor_org_id_fkey" FOREIGN KEY ("actor_org_id") REFERENCES "public"."Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FinishedGood" ADD CONSTRAINT "FinishedGood_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "public"."Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FGBatchComposition" ADD CONSTRAINT "FGBatchComposition_finished_good_id_fkey" FOREIGN KEY ("finished_good_id") REFERENCES "public"."FinishedGood"("productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FGBatchComposition" ADD CONSTRAINT "FGBatchComposition_raw_material_batch_id_fkey" FOREIGN KEY ("raw_material_batch_id") REFERENCES "public"."RawMaterialBatch"("batchId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_raw_material_batch_id_fkey" FOREIGN KEY ("raw_material_batch_id") REFERENCES "public"."RawMaterialBatch"("batchId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_collection_event_id_fkey" FOREIGN KEY ("collection_event_id") REFERENCES "public"."CollectionEvent"("eventId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_supply_chain_event_id_fkey" FOREIGN KEY ("supply_chain_event_id") REFERENCES "public"."SupplyChainEvent"("eventId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Device" ADD CONSTRAINT "Device_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;
