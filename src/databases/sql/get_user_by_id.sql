SELECT 
    `users`.`id`,
    `users`.`username`,
    `users`.`email`,
    `users`.`fullname`,
    `users`.`image`,
    `users`.`bio`,
    `users`.`phone`,
    `users`.`dob`,
    `users`.`show_online`,
    `users`.`push_notification`,
    `users`.`sms_notification`,
    `users`.`email_notification`,
    IFNULL(`users`.`blocked_user_ids`, '') AS blocked_user_ids,
    IFNULL(`users`.`followed_books`, '') AS followed_books,
    `users`.`last_activity_on`,
    `users`.`last_login`,
    `users`.`email_verified`,
    `users`.`phone_verified`,
    `users`.`verification_status`,
    `users`.`status`
FROM
    `users`
WHERE
    `users`.`id` = '<{userId}>'
        AND `users`.`status` <> 'Deleted';
