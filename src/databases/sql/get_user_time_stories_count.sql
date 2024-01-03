SELECT 
    COUNT(`time_stories`.`id`) AS num
FROM
    `time_stories`
WHERE
    `time_stories`.`status` = 'Active'
        AND `time_stories`.`expiring_on` > `time_stories`.`created_on`
        AND `time_stories`.`created_by` = '<{userId}>'
;
