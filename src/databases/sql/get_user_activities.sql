SELECT 
    `activity`.`id`,
    `activity`.`type`,
    `activity`.`template_id`,
    `activity`.`data`,
    `activity`.`user_id`,
    `activity`.`created_by`,
    `activity`.`updated_on`,
    `activity`.`created_on`,
    `activity`.`status`,
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
    `activity`
        INNER JOIN
    users ON (users.id = activity.user_id)
	INNER JOIN
    templates ON (templates.id = activity.template_id)
WHERE
    `activity`.`user_id` = '<{userId}>'
        AND `activity`.`status` <> 'Deleted'
ORDER BY `activity`.`created_on` DESC
LIMIT <{offset}>, <{perPage}>
;
