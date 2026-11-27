CREATE TABLE `domain_specialists` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`primary_domain` text NOT NULL,
	`specialty_details` text NOT NULL,
	`years_experience` text NOT NULL,
	`highest_credential` text DEFAULT '' NOT NULL,
	`preferred_work_setting` text DEFAULT 'Project-Basis' NOT NULL,
	`portfolio_url` text DEFAULT '' NOT NULL,
	`availability_notes` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `domain_specialists_email_unique` ON `domain_specialists` (`email`);--> statement-breakpoint
CREATE INDEX `specialists_domain_idx` ON `domain_specialists` (`primary_domain`);--> statement-breakpoint
ALTER TABLE `applicants` ADD `interested_roles` text DEFAULT '[]' NOT NULL;