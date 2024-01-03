SELECT 
    `messages`.`id`,
    `messages`.`message_text`,
    `messages`.`thread_id`,
    `messages`.`created_by`,
    `messages`.`updated_on`,
    `messages`.`created_on`,
    `messages`.`status`,
    IF(`messages`.`created_by` = '<{thisUserId}>',
        TRUE,
        FALSE) AS `is_my_message`,
    JSON_OBJECT('id',
            users.id,
            'fullname',
            users.fullname,
            'username',
            users.username,
            'email',
            users.email,
            'image',
            users.image) AS `user`
FROM
    `messages`
        INNER JOIN
    users ON (`messages`.`created_by` = `users`.`id`)
WHERE
    `messages`.`thread_id` = '<{threadId}>'
        AND `messages`.`status` IN ('Active')
ORDER BY `messages`.`created_on` DESC
LIMIT <{offset}>, <{perPage}>
;
