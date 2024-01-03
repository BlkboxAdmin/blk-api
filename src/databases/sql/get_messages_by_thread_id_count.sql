SELECT 
    COUNT(`messages`.`id`) AS num
FROM
    `messages`
WHERE
    `messages`.`thread_id` = '<{threadId}>'
        AND `messages`.`status` IN ('Active')
;
