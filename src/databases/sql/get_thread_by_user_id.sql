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
    `thread`.`id` = '<{threadId}>'
    AND `thread`.`participants_ids` LIKE '%<{thisUserId}>%'
        AND `thread`.`status` <> 'Deleted';
