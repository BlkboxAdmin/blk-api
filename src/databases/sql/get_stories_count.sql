SELECT 
    COUNT(`stories`.`id`) AS num
FROM
    `stories`
WHERE
    `stories`.`status` = 'Active'
        AND CASE '<{type}>'
        WHEN 'tile' THEN `stories`.`image` = ''
        WHEN 'frame' THEN `stories`.`image` <> ''
        ELSE TRUE
    END
;
