-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `_prisma_migrations` (
	`id` text PRIMARY KEY NOT NULL,
	`checksum` text NOT NULL,
	`finished_at` numeric,
	`migration_name` text NOT NULL,
	`logs` text,
	`rolled_back_at` numeric,
	`started_at` numeric DEFAULT (current_timestamp) NOT NULL,
	`applied_steps_count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `DbSize` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`dbName` text NOT NULL,
	`size` integer NOT NULL,
	`date` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`dbSizeGroup` text NOT NULL
);

*/