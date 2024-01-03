var nodemailer = require('nodemailer');
var fs = require('fs');
var path = require('path');

class Utils {

    constructor() { }

    static internalServerError() {
        return { statusCode: 500, statusMessage: 'Internal Server Error', message: null, data: null };
    }

    static whereInStr(str) {
        return Utils.replaceAll(',', "','", str);
    }

    static explode(str, separator) {
        return str != '' ? str.split(separator) : [];
    }

    static replaceAll(find, replaceWith, text) {
        const searchRegExp = new RegExp(find, 'g');
        return text.replace(searchRegExp, replaceWith);
    }

    static addSlashes(str) {
        return (str + '').replace(/([\\"'])/g, "\\$1").replace(/\0/g, "\\0");;
    }

    static randomStr() {
        let r = Date.now().toString(36) + Math.random().toString(36).substring(2);
        return r;
    }

    static async sendEmail(to, subject, tags = {}, templateName = 'generic') {
        var transporter = nodemailer.createTransport({
            host: "blkbox.winnyweb.com", // mail.blkbox.winnyweb.com
            port: 465, // 2525
            secure: true, // true for 465, false for other ports
            auth: {
                user: "no_reply@blkbox.winnyweb.com",
                pass: "n95Z4]Ah(68U",
            },
        });

        var emailTemplate = path.join(__dirname, '..', 'email_templates', `${templateName}.html`);
        let htmlBody = fs.readFileSync(emailTemplate, 'utf8');
        htmlBody = Utils.replaceTags(tags, htmlBody);

        var mailOptions = {
            from: '"BLKBox" <no_reply@blkbox.winnyweb.com>',
            to: to,
            subject: subject,
            html: htmlBody
        }

        return await transporter.sendMail(mailOptions);
    }

    static replaceTags(params, content) {
        for (let key in params) {
            content = Utils.replaceAll(`{{${key}}}`, params[key], content);
        }

        return content;
    }

    static mysqlDate(date = new Date()) {
        return date.toISOString().replace("T", " ");
    }
}

module.exports = Utils;