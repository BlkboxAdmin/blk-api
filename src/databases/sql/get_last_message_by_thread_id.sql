SELECT 
	MAX(`messages`.`created_on`) AS created_on,
    `messages`.`id`,
    `messages`.`message_text`,
    `messages`.`thread_id`,
    `messages`.`created_by`,
    `messages`.`updated_on`,
    `messages`.`status`
FROM
    `messages`
WHERE
    `messages`.`thread_id` = '<{threadId}>'
        AND `messages`.`status` IN ('Active')
;
