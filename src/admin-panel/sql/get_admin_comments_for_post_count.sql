SELECT 
    COUNT(`comments`.`id`) AS num
FROM
    `comments`
WHERE
    `comments`.`type` = '<{type}>'
        AND CASE '<{post_id}>'
        WHEN 'All' THEN TRUE
        ELSE `comments`.`post_id` = '<{post_id}>'
    END
        AND CASE '<{status}>'
        WHEN 'All' THEN `comments`.`status` <> 'Deleted'
        ELSE `comments`.`status` = '<{status}>'
    END
;
