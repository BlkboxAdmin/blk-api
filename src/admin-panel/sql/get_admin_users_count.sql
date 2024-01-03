SELECT 
    COUNT(`admin_users`.`id`) AS num
FROM
    `admin_users`
WHERE
    CASE '<{status}>'
        WHEN 'All' THEN `admin_users`.`status` <> 'Deleted'
        ELSE `admin_users`.`status` = '<{status}>'
    END
;
