SELECT 
    `friends`.`id`,
    `friends`.`sender_user_id`,
    `friends`.`receiver_user_id`,
    `friends`.`invited_on`,
    `friends`.`answered_on`,
    `friends`.`created_by`,
    `friends`.`updated_on`,
    `friends`.`created_on`,
    `friends`.`status`
FROM
    `friends`
WHERE
    ((`friends`.`sender_user_id` = '<{sender_user_id}>'
        AND `friends`.`receiver_user_id` = '<{receiver_user_id}>')
        OR (`friends`.`sender_user_id` = '<{receiver_user_id}>'
        AND `friends`.`receiver_user_id` = '<{sender_user_id}>'))
        AND `friends`.`status` IN ('Invited' , 'Active')
;
