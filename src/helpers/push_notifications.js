var apn = require('apn');
var path = require('path');
const { explode } = require('./utils');

class PushNotifications {

    constructor() {

        this.keyId = process.env.APN_KEY_ID;
        this.teamId = process.env.APPLE_TEAM_ID;
        this.bundleId = process.env.APP_BUNDLE_ID;

        if (!this.isValid()) return false;

        var options = {
            token: {
                key: path.join(__dirname, '..', '..', 'certs', `AuthKey_${this.keyId}.p8`),
                keyId: this.keyId,
                teamId: this.teamId
            },
            production: false
        };

        this.apnProvider = new apn.Provider(options);
    }

    send(deviceTokens, message, badge = 1, data = {}, expiry = 3600) {

        if (!this.isValid()) return false;

        if (deviceTokens == '') return false;

        const deviceTokensArr = explode(deviceTokens, ',');
        var note = new apn.Notification();

        note.expiry = Math.floor(Date.now() / 1000) + expiry; // Expires 1 hour from now.
        note.badge = 1;
        note.sound = "ping.aiff";
        note.alert = message;
        note.payload = data;
        note.topic = this.bundleId;

        this.apnProvider.send(note, deviceTokensArr).then((result) => {

            if (result.failed.length > 0)
                console.log(result);
        });
    }

    isValid() {
        if (!this.keyId || !this.teamId || !this.bundleId) return false;

        return true;
    }
}

module.exports = PushNotifications;