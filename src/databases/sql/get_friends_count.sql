SELECT 
    COUNT(`friends`.`id`) AS num
FROM
    `friends`
WHERE
    (`friends`.`sender_user_id` = '<{userId}>'
    OR `friends`.`receiver_user_id` = '<{userId}>')
        AND `friends`.`status` = 'Active'
;
