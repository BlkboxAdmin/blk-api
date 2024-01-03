SELECT 
    `books`.`id`,
    `books`.`description`,
    `books`.`liked_by`,
    IFNULL(`books`.`liked_by`, '') AS liked_by,
    IFNULL(`books`.`disliked_by`, '') AS disliked_by,
    `books`.`created_by`,
    `books`.`updated_on`,
    `books`.`created_on`,
    `books`.`status`,
    (SELECT 
            COUNT(`comments`.`id`) AS num
        FROM
            `comments`
        WHERE
            `comments`.`type` = 'books'
                AND `comments`.`post_id` = `books`.`id`
                AND `comments`.`status` = 'Active') AS comment_count,
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
    `books`
        INNER JOIN
    users ON (users.id = books.created_by)
WHERE
    `books`.`status` = 'Active'
ORDER BY `books`.`created_on` DESC
LIMIT <{offset}>, <{perPage}>
;
