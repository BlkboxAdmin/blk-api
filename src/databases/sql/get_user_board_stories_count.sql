SELECT 
    COUNT(`stories`.`id`) AS num
FROM
    `stories`
WHERE
    `stories`.`status` = 'Active'
        AND ((`stories`.`created_by` = '<{userId}>'
        AND `stories`.`parent_story` <> '')
        OR `stories`.`favs` LIKE '%<{userId}>%')
        AND CASE '<{type}>'
        WHEN 'tile' THEN `stories`.`image` = ''
        WHEN 'frame' THEN `stories`.`image` <> ''
        ELSE TRUE
    END
;
