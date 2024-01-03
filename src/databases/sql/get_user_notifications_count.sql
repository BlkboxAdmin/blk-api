SELECT 
    COUNT(`notifications`.`id`) AS num
FROM
    `notifications`
WHERE
    `notifications`.`user_id` = '<{userId}>'
        AND `notifications`.`status` <> 'Deleted'
;
