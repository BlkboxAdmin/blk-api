SELECT 
    `admin_users`.`id`,
    `admin_users`.`username`,
    `admin_users`.`email`,
    `admin_users`.`password`,
    `admin_users`.`fullname`,
    `admin_users`.`email_verification_key`,
    `admin_users`.`email_verification_request_on`,
    `admin_users`.`reset_password_key`,
    `admin_users`.`reset_password_request_on`,
    `admin_users`.`last_login`,
    `admin_users`.`email_verified`,
    `admin_users`.`verification_status`,
    `admin_users`.`updated_on`,
    `admin_users`.`created_on`,
    `admin_users`.`status`
FROM
    `admin_users`
WHERE
    CASE '<{status}>'
        WHEN 'All' THEN `admin_users`.`status` <> 'Deleted'
        ELSE `admin_users`.`status` = '<{status}>'
    END
;
