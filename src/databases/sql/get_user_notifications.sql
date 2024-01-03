SELECT 
    `notifications`.`id`,
    `notifications`.`type`,
    `notifications`.`template_id`,
    `notifications`.`data`,
    `notifications`.`user_id`,
    `notifications`.`is_read`,
    `notifications`.`updated_on`,
    `notifications`.`created_on`,
    `notifications`.`status`,
    `templates`.`description` AS `text`,
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
    `notifications`
        INNER JOIN
    users ON (users.id = notifications.user_id)
	INNER JOIN
    templates ON (templates.id = notifications.template_id)
WHERE
    `notifications`.`user_id` = '<{userId}>'
        AND `notifications`.`status` <> 'Deleted'
ORDER BY `notifications`.`created_on` DESC
LIMIT <{offset}>, <{perPage}>
;
