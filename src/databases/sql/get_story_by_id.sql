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
    `stories`.`id` = '<{id}>'
        AND `stories`.`status` = 'Active'
;
