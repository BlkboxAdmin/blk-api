SELECT 
    `time_stories`.`id`,
    `time_stories`.`description`,
    `time_stories`.`video`,
    `time_stories`.`parent_story`,
    IFNULL(`time_stories`.`liked_by`, '') AS liked_by,
    `time_stories`.`expiring_on`,
    `time_stories`.`repost_count`,
    `time_stories`.`created_by`,
    `time_stories`.`updated_on`,
    `time_stories`.`created_on`,
    `time_stories`.`status`,
    (SELECT 
            COUNT(`comments`.`id`) AS num
        FROM
            `comments`
        WHERE
            `comments`.`type` = 'time_stories'
                AND `comments`.`post_id` = `time_stories`.`id`
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
    `time_stories`
        INNER JOIN
    users ON (users.id = time_stories.created_by)
WHERE
    `time_stories`.`status` = 'Active'
        AND `time_stories`.`expiring_on` > `time_stories`.`created_on`
        AND `time_stories`.`created_by` = '<{userId}>'
ORDER BY `time_stories`.`created_on` DESC
LIMIT <{offset}>, <{perPage}>
;
