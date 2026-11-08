CREATE TABLE `application_emails` (
	`application_id` text PRIMARY KEY NOT NULL,
	`state` text DEFAULT 'pending' NOT NULL,
	`payload` text,
	`attempts` integer DEFAULT 0 NOT NULL,
	`first_attempt_at` integer,
	`last_attempt_at` integer,
	`sent_at` integer,
	`provider_id` text,
	`error_code` text,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `sessions` ADD `impersonated_by` text;--> statement-breakpoint
ALTER TABLE `applicants` ADD `role` text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE `applicants` ADD `banned` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `applicants` ADD `ban_reason` text;--> statement-breakpoint
ALTER TABLE `applicants` ADD `ban_expires` integer;