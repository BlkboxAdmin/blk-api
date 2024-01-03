SELECT 
    `templates`.`id`,
    `templates`.`type`,
    `templates`.`description`,
    `templates`.`created_by`,
    `templates`.`updated_on`,
    `templates`.`created_on`,
    `templates`.`status`
FROM
    `templates`
WHERE
    CASE '<{type}>'
        WHEN 'All' THEN TRUE
        ELSE `templates`.`type` = '<{type}>'
    END
        AND CASE '<{status}>'
        WHEN 'All' THEN TRUE
        ELSE `templates`.`status` = '<{status}>'
    END
        AND `templates`.`status` <> 'Deleted'
;
