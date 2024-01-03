SELECT 
    COUNT(`time_stories`.`id`) AS num
FROM
    `time_stories`
WHERE
    CASE '<{status}>'
        WHEN 'All' THEN `time_stories`.`status` <> 'Deleted'
        ELSE `time_stories`.`status` = '<{status}>'
    END
        AND CASE '<{created_by}>'
        WHEN 'All' THEN TRUE
        ELSE `time_stories`.`created_by` = '<{created_by}>'
    END
        AND `time_stories`.`expiring_on` > `time_stories`.`created_on`
;
