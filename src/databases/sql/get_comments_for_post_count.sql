SELECT 
    COUNT(`comments`.`id`) AS num
FROM
    `comments`
WHERE
    `comments`.`type` = '<{type}>'
        AND `comments`.`post_id` = '<{post_id}>'
        AND `comments`.`status` = 'Active'
;
