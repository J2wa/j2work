CREATE TABLE `application_emails` (
	`application_id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`sent_at` integer,
	`last_attempt_at` integer,
	`error` text,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE cascade
);
