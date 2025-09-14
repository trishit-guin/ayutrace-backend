-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "public"."AdminActionType" AS ENUM ('USER_CREATED', 'USER_UPDATED', 'USER_DEACTIVATED', 'USER_ACTIVATED', 'USER_VERIFIED', 'ORGANIZATION_CREATED', 'ORGANIZATION_UPDATED', 'ORGANIZATION_DELETED', 'ORGANIZATION_ACTIVATED', 'ORGANIZATION_DEACTIVATED', 'BATCH_QUARANTINED', 'BATCH_RELEASED', 'CERTIFICATE_REVOKED', 'SYSTEM_CONFIG_UPDATED', 'DATA_EXPORT', 'ALERT_RESOLVED');

-- CreateEnum
CREATE TYPE "public"."AlertType" AS ENUM ('SECURITY_BREACH', 'COMPLIANCE_VIOLATION', 'QUALITY_ISSUE', 'SYSTEM_ERROR', 'UNUSUAL_ACTIVITY', 'BATCH_EXPIRY', 'CERTIFICATE_EXPIRY', 'DATA_ANOMALY');

-- CreateEnum
CREATE TYPE "public"."AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "public"."organizations" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role" "public"."UserRole" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "public"."admin_actions" (
    "action_id" TEXT NOT NULL,
    "action_type" "public"."AdminActionType" NOT NULL,
    "description" TEXT NOT NULL,
    "admin_user_id" TEXT NOT NULL,
    "target_user_id" TEXT,
    "target_organization_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_actions_pkey" PRIMARY KEY ("action_id")
);

-- CreateTable
CREATE TABLE "public"."system_alerts" (
    "alert_id" TEXT NOT NULL,
    "alert_type" "public"."AlertType" NOT NULL,
    "severity" "public"."AlertSeverity" NOT NULL DEFAULT 'MEDIUM',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "system_alerts_pkey" PRIMARY KEY ("alert_id")
);

-- AddForeignKey
ALTER TABLE "public"."admin_actions" ADD CONSTRAINT "admin_actions_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "public"."users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."admin_actions" ADD CONSTRAINT "admin_actions_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."admin_actions" ADD CONSTRAINT "admin_actions_target_organization_id_fkey" FOREIGN KEY ("target_organization_id") REFERENCES "public"."organizations"("organization_id") ON DELETE SET NULL ON UPDATE CASCADE;
