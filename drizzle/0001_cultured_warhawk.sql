CREATE TABLE `erpnext_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`erpnextUrl` varchar(255) NOT NULL,
	`apiKey` text NOT NULL,
	`apiSecret` text NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`lastTestedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `erpnext_connections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `erpnext_data_cache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`connectionId` int NOT NULL,
	`userId` int NOT NULL,
	`verifiedUserId` varchar(255) NOT NULL,
	`doctype` varchar(128) NOT NULL,
	`data` text NOT NULL,
	`retrievedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `erpnext_data_cache_id` PRIMARY KEY(`id`)
);
