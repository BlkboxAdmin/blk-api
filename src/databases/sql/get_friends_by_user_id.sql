SELECT 
    `friends`.`id`,
    `friends`.`sender_user_id`,
    `friends`.`receiver_user_id`,
    `friends`.`invited_on`,
    `friends`.`answered_on`,
    `friends`.`created_by`,
    `friends`.`updated_on`,
    `friends`.`created_on`,
    `friends`.`status`,
    JSON_OBJECT('id',
            users.id,
            'fullname',
            users.fullname,
            'username',
            users.username,
            'email',
            users.email,
            'image',
            users.image,
            'last_activity_on',
            users.last_activity_on) AS `user`
FROM
    `friends`
        INNER JOIN
    users ON ((users.id = friends.sender_user_id
        AND `friends`.`receiver_user_id` = '<{userId}>')
        OR (users.id = friends.receiver_user_id
        AND `friends`.`sender_user_id` = '<{userId}>'))
WHERE
    (`friends`.`sender_user_id` = '<{userId}>'
        OR `friends`.`receiver_user_id` = '<{userId}>')
        AND (users.fullname LIKE '<{query}>%'
        OR users.username LIKE '<{query}>%'
        OR users.email LIKE '<{query}>%')
        AND `friends`.`status` IN ('Active')
ORDER BY users.fullname , users.username , users.email
;
