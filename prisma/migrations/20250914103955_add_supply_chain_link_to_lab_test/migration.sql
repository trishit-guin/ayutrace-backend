-- AlterTable
ALTER TABLE "public"."lab_tests" ADD COLUMN     "supply_chain_event_id" TEXT;

-- AddForeignKey
ALTER TABLE "public"."lab_tests" ADD CONSTRAINT "lab_tests_supply_chain_event_id_fkey" FOREIGN KEY ("supply_chain_event_id") REFERENCES "public"."supply_chain_events"("event_id") ON DELETE SET NULL ON UPDATE CASCADE;
