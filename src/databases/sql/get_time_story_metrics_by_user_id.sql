SELECT 
    (SELECT 
            SUM(`time_stories`.`views`)
        FROM
            time_stories
        WHERE
            `time_stories`.`created_by` = '<{userId}>'
                AND `time_stories`.`expiring_on` > `time_stories`.`created_on`
                AND `time_stories`.`status` = 'Active') AS total_video_views_count,
    (SELECT 
            COUNT(`comments`.`id`)
        FROM
            `comments`
                INNER JOIN
            `time_stories` ON (`comments`.`post_id` = `time_stories`.`id`)
        WHERE
            `time_stories`.`status` <> 'Deleted'
                AND `time_stories`.`expiring_on` > `time_stories`.`created_on`
                AND `comments`.`type` = 'time_stories'
                AND `time_stories`.`created_by` = '<{userId}>') AS comment_count,
    IFNULL((SELECT 
                    GROUP_CONCAT(`time_stories`.`liked_by`)
                FROM
                    `time_stories`
                WHERE
                    `time_stories`.`status` <> 'Deleted'
                        AND `time_stories`.`expiring_on` > `time_stories`.`created_on`
                        AND `time_stories`.`created_by` = '<{userId}>'
                        AND `time_stories`.`liked_by` <> ''),
            '') AS fav_by,
    (SELECT 
            COUNT(`time_stories`.`id`)
        FROM
            time_stories
        WHERE
            `time_stories`.`created_by` = '<{userId}>'
                AND `time_stories`.`expiring_on` > `time_stories`.`created_on`
                AND `time_stories`.`status` = 'Active') AS video_count
;
