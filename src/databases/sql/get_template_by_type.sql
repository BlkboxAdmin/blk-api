SELECT 
    `templates`.`id`,
    `templates`.`description`,
    `templates`.`created_by`,
    `templates`.`updated_on`,
    `templates`.`created_on`,
    `templates`.`status`
FROM
    `templates`
WHERE
    `templates`.`type` = '<{type}>'
        AND `templates`.`status` <> 'Deleted';
