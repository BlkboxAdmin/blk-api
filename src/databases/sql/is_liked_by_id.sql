SELECT 
    `books`.`id`,
    `books`.`description`,
    IFNULL(`books`.`liked_by`, '') AS liked_by,
    IFNULL(`books`.`disliked_by`, '') AS disliked_by,
    `books`.`created_by`,
    `books`.`updated_on`,
    `books`.`created_on`,
    `books`.`status`
FROM
    `books`
WHERE
    `books`.`id` = '<{bookId}>'
    AND `books`.`liked_by` LIKE '%<{likerId}>%'
        AND `books`.`status` = 'Active'
;
