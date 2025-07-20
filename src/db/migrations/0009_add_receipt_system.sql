CREATE TABLE `receipt` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`transactionId` text NOT NULL,
	`paymentIntentId` text(255) NOT NULL,
	`stripeInvoiceId` text(255),
	`stripeChargeId` text(255),
	`receiptNumber` text(100) NOT NULL,
	`amount` integer NOT NULL,
	`currency` text(3) DEFAULT 'usd' NOT NULL,
	`taxAmount` integer DEFAULT 0 NOT NULL,
	`taxRate` text(10),
	`paymentMethod` text(50) NOT NULL,
	`cardLast4` text(4),
	`cardBrand` text(20),
	`pdfUrl` text(500),
	`htmlContent` text,
	`downloadToken` text(255) NOT NULL,
	`emailSent` integer,
	`emailDelivered` integer,
	`downloadCount` integer DEFAULT 0 NOT NULL,
	`lastDownloaded` integer,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`transactionId`) REFERENCES `credit_transaction`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `receipt_user_id_idx` ON `receipt` (`userId`);--> statement-breakpoint
CREATE INDEX `receipt_transaction_id_idx` ON `receipt` (`transactionId`);--> statement-breakpoint
CREATE INDEX `receipt_payment_intent_id_idx` ON `receipt` (`paymentIntentId`);--> statement-breakpoint
CREATE INDEX `receipt_number_idx` ON `receipt` (`receiptNumber`);--> statement-breakpoint
CREATE INDEX `receipt_download_token_idx` ON `receipt` (`downloadToken`);--> statement-breakpoint
ALTER TABLE `credit_transaction` ADD `receiptId` text(255);--> statement-breakpoint
ALTER TABLE `credit_transaction` ADD `receiptUrl` text(500);--> statement-breakpoint
ALTER TABLE `credit_transaction` ADD `receiptEmailSent` integer;--> statement-breakpoint
CREATE INDEX `credit_transaction_receipt_id_idx` ON `credit_transaction` (`receiptId`);