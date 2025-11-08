ALTER TABLE "enrollments" ALTER COLUMN "enrolledAt" SET DEFAULT '2025-11-03T12:51:05.210Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_cid_unique" UNIQUE("cid");