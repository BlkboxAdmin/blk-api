SELECT 
    `comments`.`id`,
    `comments`.`type`,
    `comments`.`comment_text`,
    `comments`.`post_id`,
    `comments`.`created_by`,
    `comments`.`updated_on`,
    `comments`.`created_on`,
    `comments`.`status`
FROM
    `comments`
WHERE
    `comments`.`id` = '<{id}>'
        AND `comments`.`status` = 'Active'
;
