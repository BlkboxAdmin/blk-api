SELECT 
    `thread`.`id`,
    `thread`.`participants_ids`,
    `thread`.`created_by`,
    `thread`.`updated_on`,
    `thread`.`created_on`,
    `thread`.`status`
FROM
    `thread`
WHERE
    `thread`.`participants_ids` LIKE '%<{recipient_user_id}>%'
        AND `thread`.`participants_ids` LIKE '%<{sender_user_id}>%'
        AND `thread`.`status` <> 'Deleted';
