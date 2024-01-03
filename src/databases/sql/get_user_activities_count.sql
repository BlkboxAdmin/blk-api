SELECT 
    COUNT(`activity`.`id`) AS num
FROM
    `activity`
WHERE
    `activity`.`user_id` = '<{userId}>'
        AND `activity`.`status` <> 'Deleted'
;
