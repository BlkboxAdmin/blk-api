SELECT 
    `stories`.`id`,
    IF(`stories`.`image` = '',
        'tile',
        'frame') AS `type`,
    `stories`.`description`,
    `stories`.`image`,
    `stories`.`parent_story`,
    IFNULL(`stories`.`favs`, '') AS favs,
    `stories`.`repost_count`,
    `stories`.`created_by`,
    `stories`.`updated_on`,
    `stories`.`created_on`,
    `stories`.`status`,
    JSON_OBJECT('id',
            users.id,
            'fullname',
            users.fullname,
            'username',
            users.username,
            'email',
            users.email,
            'image',
            users.image) AS user
FROM
    `stories`
        INNER JOIN
    users ON (users.id = stories.created_by)
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
ORDER BY `stories`.`created_on` DESC
LIMIT <{offset}>, <{perPage}>
;
