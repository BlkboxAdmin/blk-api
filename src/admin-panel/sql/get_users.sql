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
    `users`.`blocked_user_ids`,
    `users`.`followed_books`,
    `users`.`email_verification_request_on`,
    `users`.`reset_password_request_on`,
    `users`.`last_activity_on`,
    `users`.`last_login`,
    `users`.`email_verified`,
    `users`.`phone_verified`,
    `users`.`verification_status`,
    `users`.`updated_on`,
    `users`.`created_on`,
    `users`.`status`
FROM
    `users`
WHERE
    CASE '<{status}>'
        WHEN 'All' THEN `users`.`status` <> 'Deleted'
        ELSE `users`.`status` = '<{status}>'
    END
        AND CASE '<{verification_status}>'
        WHEN 'All' THEN TRUE
        ELSE `users`.`verification_status` = '<{verification_status}>'
    END
        AND CASE '<{email_verified}>'
        WHEN 'All' THEN TRUE
        ELSE `users`.`email_verified` = '<{email_verified}>'
    END
ORDER BY `users`.`fullname` ASC , `users`.`email` ASC , `users`.`username` ASC
;
