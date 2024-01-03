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
            sender.id,
            'fullname',
            sender.fullname,
            'username',
            sender.username,
            'email',
            sender.email,
            'image',
            sender.image) AS sender_user,
    JSON_OBJECT('id',
            receiver.id,
            'fullname',
            receiver.fullname,
            'username',
            receiver.username,
            'email',
            receiver.email,
            'image',
            receiver.image) AS receiver_user
FROM
    `friends`
        INNER JOIN
    users sender ON (sender.id = friends.sender_user_id)
        INNER JOIN
    users receiver ON (receiver.id = friends.receiver_user_id)
WHERE
    `friends`.`id` = '<{id}>'
        AND `friends`.`status` IN ('Invited' , 'Active', 'Declined')
;
