SELECT 
    `apn_devices`.`id`,
    `apn_devices`.`device_token`,
    `apn_devices`.`user_id`,
    `apn_devices`.`updated_on`,
    `apn_devices`.`created_on`,
    `apn_devices`.`status`
FROM
    `apn_devices`
WHERE
    `apn_devices`.`user_id` = '<{user_id}>'
        AND `apn_devices`.`device_token` = '<{device_token}>'
        AND `apn_devices`.`status` <> 'Deleted'
;
