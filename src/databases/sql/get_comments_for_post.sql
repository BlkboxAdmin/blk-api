SELECT 
    `comments`.`id`,
    `comments`.`type`,
    `comments`.`comment_text`,
    `comments`.`post_id`,
    `comments`.`created_by`,
    `comments`.`updated_on`,
    `comments`.`created_on`,
    `comments`.`status`,
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
    `comments`
        INNER JOIN
    users ON (users.id = comments.created_by)
WHERE
    `comments`.`type` = '<{type}>'
        AND `comments`.`post_id` = '<{post_id}>'
        AND `comments`.`status` = 'Active'
ORDER BY `comments`.`created_on` DESC
LIMIT <{offset}>, <{perPage}>
;
