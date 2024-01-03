SELECT 
    COUNT(`books`.`id`) AS num
FROM
    `books`
WHERE
    `books`.`status` = 'Active'
;
