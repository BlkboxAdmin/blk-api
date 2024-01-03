SELECT 
    COUNT(`books`.`id`) AS num
FROM
    `books`
WHERE
    CASE '<{status}>'
        WHEN 'All' THEN `books`.`status` <> 'Deleted'
        ELSE `books`.`status` = '<{status}>'
    END
;
