const Utils = require('../helpers/utils');
const Response = require('../helpers/response');
const https = require('https');

const getImageUploadUrl = async (reqt, resp) => {
    try {

        const output = new Response();
        const data = '';
        const options = {
            hostname: 'api.cloudflare.com',
            path: '/client/v4/accounts/' + process.env.CF_ACCOUNT_ID + '/images/v2/direct_upload',
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + process.env.CF_IMAGE_TOKEN,
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            console.log('Status Code:', res.statusCode);

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                const cfResponse = JSON.parse(data);

                if (cfResponse.success) {
                    output.okRequest('Upload url fetched successfully.', cfResponse.result);
                }
                else {
                    output.badRequest("Error while fetch upload url");
                }

                resp.json(output.response());
            });

        }).on("error", (err) => {
            console.log("Error: ", err.message);
        });

        req.write(data);
        req.end();

    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const getVideoUploadUrl = async (reqt, resp) => {
    try {

        const output = new Response();
        const data = JSON.stringify({
            "maxDurationSeconds": 3600
        });
        const options = {
            hostname: 'api.cloudflare.com',
            path: '/client/v4/accounts/' + process.env.CF_ACCOUNT_ID + '/stream/direct_upload',
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + process.env.CF_VIDEO_TOKEN,
                'Content-Type': 'application/json',
                'Content-Length': data.length
            },
            maxRedirects: 20
        };

        const req = https.request(options, (res) => {
            let data = '';

            console.log('Status Code:', res.statusCode);

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {

                const cfResponse = JSON.parse(data);

                if (cfResponse.success) {
                    output.okRequest('Upload url fetched successfully.', cfResponse.result);
                }
                else {
                    output.badRequest("Error while fetch upload url");
                }

                resp.json(output.response());
            });

        }).on("error", (err) => {
            console.log("Error: ", err.message);
        });

        req.write(data);
        req.end();

    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};


module.exports = {
    getImageUploadUrl,
    getVideoUploadUrl
};
