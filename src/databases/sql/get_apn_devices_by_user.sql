SELECT 
    IFNULL(GROUP_CONCAT(`apn_devices`.`device_token`),
            '') AS devices
FROM
    `apn_devices`
WHERE
    `apn_devices`.`user_id` = '<{user_id}>'
        AND `apn_devices`.`status` <> 'Deleted'
;
