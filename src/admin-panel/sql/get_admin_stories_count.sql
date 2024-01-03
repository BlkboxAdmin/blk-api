SELECT 
    COUNT(`stories`.`id`) AS num
FROM
    `stories`
WHERE
    CASE '<{type}>'
        WHEN 'tile' THEN `stories`.`image` = ''
        WHEN 'frame' THEN `stories`.`image` <> ''
        ELSE TRUE
    END
        AND CASE '<{status}>'
        WHEN 'All' THEN `stories`.`status` <> 'Deleted'
        ELSE `stories`.`status` = '<{status}>'
    END
        AND CASE '<{created_by}>'
        WHEN 'All' THEN TRUE
        ELSE `stories`.`created_by` = '<{created_by}>'
    END
;
