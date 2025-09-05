-- CreateEnum
CREATE TYPE "public"."OrgType" AS ENUM ('FARMER', 'MANUFACTURER', 'LABS', 'DISTRIBUTOR');

-- CreateEnum
CREATE TYPE "public"."RawMaterialBatchStatus" AS ENUM ('CREATED', 'IN_PROCESSING', 'PROCESSED', 'QUARANTINED');

-- CreateEnum
CREATE TYPE "public"."SupplyChainEventType" AS ENUM ('PROCESSING', 'TESTING', 'TRANSFER', 'STORAGE', 'PACKAGING');

-- CreateEnum
CREATE TYPE "public"."FinishedGoodProductType" AS ENUM ('POWDER', 'CAPSULE', 'TABLET', 'SYRUP', 'OIL', 'CREAM');

-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('CERTIFICATE', 'PHOTO', 'INVOICE', 'REPORT', 'TEST_RESULT', 'LICENSE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."QREntityType" AS ENUM ('RAW_MATERIAL_BATCH', 'FINISHED_GOOD', 'SUPPLY_CHAIN_EVENT');

-- CreateEnum
CREATE TYPE "public"."ConservationStatus" AS ENUM ('LEAST_CONCERN', 'NEAR_THREATENED', 'VULNERABLE', 'ENDANGERED', 'CRITICALLY_ENDANGERED');

-- CreateEnum
CREATE TYPE "public"."QuantityUnit" AS ENUM ('KG', 'TONNES', 'GRAMS', 'POUNDS', 'PIECES', 'BOTTLES', 'BOXES');

-- CreateTable
CREATE TABLE "public"."users" (
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "org_type" "public"."OrgType" NOT NULL,
    "blockchain_identity" TEXT,
    "phone" TEXT,
    "last_login" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "location" TEXT,
    "longitude" DOUBLE PRECISION,
    "organization_id" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."organizations" (
    "organization_id" TEXT NOT NULL,
    "type" "public"."OrgType" NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("organization_id")
);

-- CreateTable
CREATE TABLE "public"."herb_species" (
    "species_id" TEXT NOT NULL,
    "common_name" TEXT NOT NULL,
    "scientific_name" TEXT NOT NULL,
    "family" TEXT,
    "description" TEXT,
    "medicinal_uses" TEXT[],
    "native_regions" TEXT[],
    "harvesting_season" TEXT,
    "parts_used" TEXT[],
    "conservation_status" "public"."ConservationStatus",
    "regulatory_info" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "herb_species_pkey" PRIMARY KEY ("species_id")
);

-- CreateTable
CREATE TABLE "public"."collection_events" (
    "event_id" TEXT NOT NULL,
    "collector_id" TEXT NOT NULL,
    "farmer_id" TEXT,
    "herb_species_id" TEXT,
    "collection_date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "quantity" DOUBLE PRECISION,
    "unit" TEXT,
    "quality_notes" TEXT,
    "notes" TEXT,
    "batch_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_events_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "public"."raw_material_batches" (
    "batch_id" TEXT NOT NULL,
    "herb_name" TEXT NOT NULL,
    "scientific_name" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" "public"."QuantityUnit" NOT NULL,
    "status" "public"."RawMaterialBatchStatus" NOT NULL DEFAULT 'CREATED',
    "description" TEXT,
    "notes" TEXT,
    "current_owner_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "raw_material_batches_pkey" PRIMARY KEY ("batch_id")
);

-- CreateTable
CREATE TABLE "public"."supply_chain_events" (
    "event_id" TEXT NOT NULL,
    "event_type" "public"."SupplyChainEventType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "handler_id" TEXT NOT NULL,
    "from_location_id" TEXT NOT NULL,
    "to_location_id" TEXT NOT NULL,
    "raw_material_batch_id" TEXT,
    "finished_good_id" TEXT,
    "notes" TEXT,
    "custody" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supply_chain_events_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "public"."finished_goods" (
    "product_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "product_type" "public"."FinishedGoodProductType" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" "public"."QuantityUnit" NOT NULL,
    "manufacturer_id" TEXT NOT NULL,
    "description" TEXT,
    "batch_number" TEXT,
    "expiry_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "finished_goods_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "public"."finished_good_composition" (
    "id" TEXT NOT NULL,
    "finished_good_id" TEXT NOT NULL,
    "raw_material_batch_id" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "quantity_used" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "finished_good_composition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."documents" (
    "document_id" TEXT NOT NULL,
    "file_name" TEXT,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "document_type" "public"."DocumentType" NOT NULL,
    "description" TEXT,
    "uploaded_by" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "collection_event_id" TEXT,
    "raw_material_batch_id" TEXT,
    "supply_chain_event_id" TEXT,
    "finished_good_id" TEXT,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("document_id")
);

-- CreateTable
CREATE TABLE "public"."qr_codes" (
    "qr_code_id" TEXT NOT NULL,
    "qr_hash" TEXT NOT NULL,
    "entity_type" "public"."QREntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "generated_by" TEXT,
    "custom_data" JSONB,
    "scan_count" INTEGER NOT NULL DEFAULT 0,
    "last_scanned_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "raw_material_batch_id" TEXT,
    "finished_good_id" TEXT,
    "supply_chain_event_id" TEXT,

    CONSTRAINT "qr_codes_pkey" PRIMARY KEY ("qr_code_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "herb_species_scientific_name_key" ON "public"."herb_species"("scientific_name");

-- CreateIndex
CREATE UNIQUE INDEX "herb_species_common_name_scientific_name_key" ON "public"."herb_species"("common_name", "scientific_name");

-- CreateIndex
CREATE UNIQUE INDEX "qr_codes_qr_hash_key" ON "public"."qr_codes"("qr_hash");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."collection_events" ADD CONSTRAINT "collection_events_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."raw_material_batches"("batch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."collection_events" ADD CONSTRAINT "collection_events_collector_id_fkey" FOREIGN KEY ("collector_id") REFERENCES "public"."users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."collection_events" ADD CONSTRAINT "collection_events_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "public"."users"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."collection_events" ADD CONSTRAINT "collection_events_herb_species_id_fkey" FOREIGN KEY ("herb_species_id") REFERENCES "public"."herb_species"("species_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."raw_material_batches" ADD CONSTRAINT "raw_material_batches_current_owner_id_fkey" FOREIGN KEY ("current_owner_id") REFERENCES "public"."users"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."supply_chain_events" ADD CONSTRAINT "supply_chain_events_finished_good_id_fkey" FOREIGN KEY ("finished_good_id") REFERENCES "public"."finished_goods"("product_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."supply_chain_events" ADD CONSTRAINT "supply_chain_events_from_location_id_fkey" FOREIGN KEY ("from_location_id") REFERENCES "public"."organizations"("organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."supply_chain_events" ADD CONSTRAINT "supply_chain_events_handler_id_fkey" FOREIGN KEY ("handler_id") REFERENCES "public"."users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."supply_chain_events" ADD CONSTRAINT "supply_chain_events_raw_material_batch_id_fkey" FOREIGN KEY ("raw_material_batch_id") REFERENCES "public"."raw_material_batches"("batch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."supply_chain_events" ADD CONSTRAINT "supply_chain_events_to_location_id_fkey" FOREIGN KEY ("to_location_id") REFERENCES "public"."organizations"("organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."finished_goods" ADD CONSTRAINT "finished_goods_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "public"."users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."finished_good_composition" ADD CONSTRAINT "finished_good_composition_finished_good_id_fkey" FOREIGN KEY ("finished_good_id") REFERENCES "public"."finished_goods"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."finished_good_composition" ADD CONSTRAINT "finished_good_composition_raw_material_batch_id_fkey" FOREIGN KEY ("raw_material_batch_id") REFERENCES "public"."raw_material_batches"("batch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_collection_event_id_fkey" FOREIGN KEY ("collection_event_id") REFERENCES "public"."collection_events"("event_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_finished_good_id_fkey" FOREIGN KEY ("finished_good_id") REFERENCES "public"."finished_goods"("product_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_raw_material_batch_id_fkey" FOREIGN KEY ("raw_material_batch_id") REFERENCES "public"."raw_material_batches"("batch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_supply_chain_event_id_fkey" FOREIGN KEY ("supply_chain_event_id") REFERENCES "public"."supply_chain_events"("event_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."qr_codes" ADD CONSTRAINT "qr_codes_finished_good_id_fkey" FOREIGN KEY ("finished_good_id") REFERENCES "public"."finished_goods"("product_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."qr_codes" ADD CONSTRAINT "qr_codes_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."qr_codes" ADD CONSTRAINT "qr_codes_raw_material_batch_id_fkey" FOREIGN KEY ("raw_material_batch_id") REFERENCES "public"."raw_material_batches"("batch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."qr_codes" ADD CONSTRAINT "qr_codes_supply_chain_event_id_fkey" FOREIGN KEY ("supply_chain_event_id") REFERENCES "public"."supply_chain_events"("event_id") ON DELETE SET NULL ON UPDATE CASCADE;
