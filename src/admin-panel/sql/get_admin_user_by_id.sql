SELECT 
    `users`.`id`,
    `users`.`username`,
    `users`.`email`,
    `users`.`fullname`,
    `users`.`last_login`,
    `users`.`email_verified`,
    `users`.`verification_status`,
    `users`.`status`
FROM
    `admin_users` users
WHERE
    `users`.`id` = '<{userId}>'
        AND `users`.`status` <> 'Deleted';
