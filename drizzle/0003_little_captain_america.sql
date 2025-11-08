ALTER TABLE "courses" DROP CONSTRAINT "courses_cid_unique";--> statement-breakpoint
ALTER TABLE "enrollments" DROP COLUMN "progress";--> statement-breakpoint
ALTER TABLE "enrollments" DROP COLUMN "enrolledAt";