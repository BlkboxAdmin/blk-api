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
ORDER BY `stories`.`created_on` DESC
LIMIT <{offset}>, <{perPage}>
;
