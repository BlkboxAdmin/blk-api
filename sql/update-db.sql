USE `blk`;

ALTER TABLE `users` 
ADD COLUMN `email_verified` VARCHAR(45) NULL DEFAULT 'Pending' COMMENT 'Pending\nEmailSent\nVerified' AFTER `last_login`,
ADD COLUMN `phone_verified` VARCHAR(45) NULL DEFAULT 'Pending' COMMENT 'Pending\nSmsSent\nVerified' AFTER `email_verified`,
CHANGE COLUMN `verification_status` `verification_status` VARCHAR(45) NULL DEFAULT 'Pending' COMMENT 'Pending/NotVerified/Verified' ;

ALTER TABLE `users` 
ADD COLUMN `email_verification_key` VARCHAR(45) NULL AFTER `blocked_user_ids`,
ADD COLUMN `email_verification_request_on` DATETIME NULL AFTER `email_verification_key`,
ADD COLUMN `reset_password_key` VARCHAR(45) NULL AFTER `email_verification_request_on`,
ADD COLUMN `reset_password_request_on` DATETIME NULL AFTER `reset_password_key`;

# 15/11/2022
ALTER TABLE `comments` 
ADD COLUMN `type` VARCHAR(45) NULL COMMENT 'books/time_stories' AFTER `id`;

# 17/11/2022
ALTER TABLE `users` 
ADD COLUMN `followed_books` TEXT NULL DEFAULT NULL AFTER `blocked_user_ids`;

# 19/11/2022
ALTER TABLE `time_stories` 
ADD COLUMN `parent_story` VARCHAR(45) NULL DEFAULT NULL AFTER `expiring_on`;
ALTER TABLE `time_stories` 
ADD COLUMN `repost_count` INT NULL DEFAULT 0 AFTER `liked_by`;

# 20/11/2022
ALTER TABLE `templates` 
ADD COLUMN `type` VARCHAR(45) NOT NULL DEFAULT '' AFTER `id`;
ALTER TABLE `activity` 
ADD COLUMN `data` TEXT NULL COMMENT 'JSON object with value to replace tags in template description' AFTER `template_id`,
ADD COLUMN `user_id` VARCHAR(45) NULL AFTER `data`;
ALTER TABLE `notifications` 
ADD COLUMN `template_id` VARCHAR(45) NULL AFTER `type`,
CHANGE COLUMN `description` `data` TEXT NULL DEFAULT NULL ;

# 07/12/2022
ALTER TABLE `time_stories` 
ADD COLUMN `views` INT NULL DEFAULT 0 AFTER `repost_count`;

CREATE TABLE `apn_devices` (
  `id` varchar(45) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `device_token` text COLLATE utf8mb4_unicode_520_ci COMMENT 'device address',
  `user_id` varchar(45) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `updated_on` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_on` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(45) COLLATE utf8mb4_unicode_520_ci DEFAULT 'Active' COMMENT 'Active/Inactive/Deleted',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
# updated



