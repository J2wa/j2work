CREATE TABLE `application_confirmations` (
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
