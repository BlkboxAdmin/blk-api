SELECT 
    COUNT(`users`.`id`) AS num
FROM
    `users`
WHERE
    CASE '<{status}>'
        WHEN 'All' THEN `users`.`status` <> 'Deleted'
        ELSE `users`.`status` = '<{status}>'
    END
        AND CASE '<{verification_status}>'
        WHEN 'All' THEN TRUE
        ELSE `users`.`verification_status` = '<{verification_status}>'
    END
        AND CASE '<{email_verified}>'
        WHEN 'All' THEN TRUE
        ELSE `users`.`email_verified` = '<{email_verified}>'
    END
;
