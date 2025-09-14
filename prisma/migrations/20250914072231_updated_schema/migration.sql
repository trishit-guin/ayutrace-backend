/*
  Warnings:

  - The values [PROCESSING,TRANSFER,STORAGE,PACKAGING] on the enum `SupplyChainEventType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."TestType" AS ENUM ('ADULTERATION_TESTING', 'HEAVY_METALS_ANALYSIS', 'MOISTURE_CONTENT', 'ACTIVE_INGREDIENT_ANALYSIS', 'MICROBIOLOGICAL_TESTING', 'PESTICIDE_RESIDUE_ANALYSIS', 'STABILITY_TESTING', 'STERILITY_TESTING', 'CONTAMINATION_TESTING', 'QUALITY_ASSURANCE');

-- CreateEnum
CREATE TYPE "public"."TestStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED', 'REQUIRES_RETEST');

-- CreateEnum
CREATE TYPE "public"."TestPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."CertificateType" AS ENUM ('QUALITY_CERTIFICATE', 'AYUSH_COMPLIANCE', 'ADULTERATION_FREE', 'HEAVY_METALS_CLEARED', 'MICROBIOLOGICAL_CLEARED', 'ORGANIC_CERTIFICATION', 'GMP_COMPLIANCE', 'EXPORT_CERTIFICATE', 'BATCH_CERTIFICATE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."QREntityType" ADD VALUE 'LAB_TEST';
ALTER TYPE "public"."QREntityType" ADD VALUE 'CERTIFICATE';

-- AlterEnum
BEGIN;
CREATE TYPE "public"."SupplyChainEventType_new" AS ENUM ('TESTING', 'DISTRIBUTION');
ALTER TABLE "public"."supply_chain_events" ALTER COLUMN "event_type" TYPE "public"."SupplyChainEventType_new" USING ("event_type"::text::"public"."SupplyChainEventType_new");
ALTER TYPE "public"."SupplyChainEventType" RENAME TO "SupplyChainEventType_old";
ALTER TYPE "public"."SupplyChainEventType_new" RENAME TO "SupplyChainEventType";
DROP TYPE "public"."SupplyChainEventType_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."documents" ADD COLUMN     "certificate_id" TEXT,
ADD COLUMN     "lab_test_id" TEXT;

-- AlterTable
ALTER TABLE "public"."qr_codes" ADD COLUMN     "lab_test_id" TEXT;

-- CreateTable
CREATE TABLE "public"."lab_tests" (
    "test_id" TEXT NOT NULL,
    "test_type" "public"."TestType" NOT NULL,
    "status" "public"."TestStatus" NOT NULL DEFAULT 'PENDING',
    "sample_name" TEXT NOT NULL,
    "sample_type" TEXT NOT NULL,
    "sample_description" TEXT,
    "batch_number" TEXT,
    "collection_date" TIMESTAMP(3) NOT NULL,
    "test_date" TIMESTAMP(3),
    "completion_date" TIMESTAMP(3),
    "results" JSONB,
    "methodology" TEXT,
    "equipment" TEXT,
    "notes" TEXT,
    "priority" "public"."TestPriority" NOT NULL DEFAULT 'MEDIUM',
    "cost" DOUBLE PRECISION,
    "certification_number" TEXT,
    "blockchain_tx_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "requester_id" TEXT NOT NULL,
    "lab_technician_id" TEXT,
    "organization_id" TEXT NOT NULL,
    "batch_id" TEXT,
    "finished_good_id" TEXT,

    CONSTRAINT "lab_tests_pkey" PRIMARY KEY ("test_id")
);

-- CreateTable
CREATE TABLE "public"."certificates" (
    "certificate_id" TEXT NOT NULL,
    "certificate_number" TEXT NOT NULL,
    "certificate_type" "public"."CertificateType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "issue_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3),
    "is_valid" BOOLEAN NOT NULL DEFAULT true,
    "blockchain_tx_hash" TEXT,
    "digital_signature" TEXT,
    "qr_code_data" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "test_id" TEXT,
    "organization_id" TEXT NOT NULL,
    "issuer_id" TEXT NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("certificate_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lab_tests_certification_number_key" ON "public"."lab_tests"("certification_number");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_certificate_number_key" ON "public"."certificates"("certificate_number");

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_lab_test_id_fkey" FOREIGN KEY ("lab_test_id") REFERENCES "public"."lab_tests"("test_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_certificate_id_fkey" FOREIGN KEY ("certificate_id") REFERENCES "public"."certificates"("certificate_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lab_tests" ADD CONSTRAINT "lab_tests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lab_tests" ADD CONSTRAINT "lab_tests_lab_technician_id_fkey" FOREIGN KEY ("lab_technician_id") REFERENCES "public"."users"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lab_tests" ADD CONSTRAINT "lab_tests_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lab_tests" ADD CONSTRAINT "lab_tests_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."raw_material_batches"("batch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lab_tests" ADD CONSTRAINT "lab_tests_finished_good_id_fkey" FOREIGN KEY ("finished_good_id") REFERENCES "public"."finished_goods"("product_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."certificates" ADD CONSTRAINT "certificates_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "public"."lab_tests"("test_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."certificates" ADD CONSTRAINT "certificates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."certificates" ADD CONSTRAINT "certificates_issuer_id_fkey" FOREIGN KEY ("issuer_id") REFERENCES "public"."users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."qr_codes" ADD CONSTRAINT "qr_codes_lab_test_id_fkey" FOREIGN KEY ("lab_test_id") REFERENCES "public"."lab_tests"("test_id") ON DELETE SET NULL ON UPDATE CASCADE;
