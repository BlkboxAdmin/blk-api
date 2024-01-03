SELECT 
    COUNT(`templates`.`id`) AS num
FROM
    `templates`
WHERE
    CASE '<{status}>'
        WHEN 'All' THEN TRUE
        ELSE `templates`.`status` = '<{status}>'
    END
        AND `templates`.`status` <> 'Deleted'
;
