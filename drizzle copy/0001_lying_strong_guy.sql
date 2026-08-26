CREATE TABLE `cronTasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`taskName` text NOT NULL,
	`schedule` text NOT NULL,
	`lastRun` numeric,
	`status` text DEFAULT 'pending' NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`serverId` integer NOT NULL,
	`taskType` text DEFAULT 'sql' NOT NULL,
	`api` text,
	`sql` text,
	FOREIGN KEY (`serverId`) REFERENCES `ServersList`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `erpLogs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`step` text NOT NULL,
	`date` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`duration` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pushMessageSubscription` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text,
	`auth` text,
	`expirationTime` numeric,
	`subsecription` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `serverTags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`serverId` integer NOT NULL,
	`tagId` integer NOT NULL,
	FOREIGN KEY (`serverId`) REFERENCES `ServersList`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tagId`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `ServersList` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`brand` text NOT NULL,
	`name` text NOT NULL,
	`ip` text NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`db` text,
	`dbName` text,
	`dbPort` text,
	`dbUser` text,
	`dbPassword` text,
	`dbAlert` text,
	`bkLogDir` text,
	`drInstance` text,
	`dbSizeGroup` text,
	`mountPoint` text,
	`memory` text,
	`cpu` text,
	`deleteFlag` text DEFAULT '0' NOT NULL,
	`dbLabel` text
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`color` text NOT NULL,
	`permanent` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `taskSubscription` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`taskId` integer NOT NULL,
	`subscriptionId` integer NOT NULL,
	FOREIGN KEY (`taskId`) REFERENCES `cronTasks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`subscriptionId`) REFERENCES `pushMessageSubscription`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE `_prisma_migrations`;