CREATE TABLE `guest_interaction` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`guestSessionId` text NOT NULL,
	`interactionType` text(50) NOT NULL,
	`interactionData` text(5000),
	`ipAddress` text(100),
	FOREIGN KEY (`guestSessionId`) REFERENCES `guest_session`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `guest_interaction_session_idx` ON `guest_interaction` (`guestSessionId`);--> statement-breakpoint
CREATE INDEX `guest_interaction_type_idx` ON `guest_interaction` (`interactionType`);--> statement-breakpoint
CREATE TABLE `guest_session` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`sessionId` text(255) NOT NULL,
	`ipAddress` text(100),
	`userAgent` text(500),
	`country` text(10),
	`city` text(100),
	`tempData` text(50000),
	`lastActivityAt` integer NOT NULL,
	`expiresAt` integer NOT NULL,
	`apiCallCount` integer DEFAULT 0 NOT NULL,
	`lastApiCallAt` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `guest_session_sessionId_unique` ON `guest_session` (`sessionId`);--> statement-breakpoint
CREATE INDEX `guest_session_id_idx` ON `guest_session` (`sessionId`);--> statement-breakpoint
CREATE INDEX `guest_ip_idx` ON `guest_session` (`ipAddress`);--> statement-breakpoint
CREATE INDEX `guest_expires_idx` ON `guest_session` (`expiresAt`);