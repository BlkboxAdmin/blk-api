const Utils = require('../helpers/utils');
const Notifications = require('../models/notifications.model');
const Books = require('../models/books.model');
const Frinds = require('../models/friends.model');
const Stories = require('../models/stories.model');
const Templates = require('../models/templates.model');
const TimeStories = require('../models/time_stories.model');
const User = require('../models/user.model');
const PushNotifications = require('../helpers/push_notifications');

const getNotifications = async (req, res) => {
    try {
        const page = isNaN(req.params.page) ? 1 : req.params.page;
        const model = new Notifications();
        const response = await model.list(page, req.user);

        res.json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const addNotification = async (params) => {
    try {
        const user = new User();
        const pn = new PushNotifications();
        let modelRes = {};
        const data = params.data;
        const template = new Templates();
        const templateData = await template.find({ type: params.type });
        params.template_id = templateData.data.id

        // get user data with notification, sms and email settings
        const userData = await user.find({ userId: params.user_id });

        switch (params.type) {

            case 'NEW_MESSAGE_NOTIFICATION':

                if (userData.push_notification == 1) {
                    var devices = await user.getUserDevices(params.user_id);
                    pn.send(devices.data, data.message_text, 1, { type: "message", sender_user_id: params.user_id, receiver_user_id: data.created_by });
                }

                if (userData.email_notification == 1) {
                    // send email
                    const tags = {
                        name: userData.fullname ?? '',
                        email_text: `You have received a new message:<br><br>${data.message_text}`
                    };
                    try {
                        // send email to userData.email
                        const sendEmail = await Utils.sendEmail("chknabeel@hotmail.com", data.message_text, tags, 'generic_no_btn');
                        this.output.okRequest('new message email sent', null);
                    } catch (err) {
                        console.log(err);
                        this.output.badRequest('Email not sent');
                    }
                }

                if (userData.sms_notification == 1) {
                    // send sms
                }

                break;

            case 'NEW_STORY_LIKE_NOTIFICATION':
            case 'NEW_STORY_REPOST_NOTIFICATION':

                var story = new Stories();
                var storyRes = await story.find(data.story);
                params.data.story = storyRes.data;

                modelRes = await user.find(data.user);
                params.data.user = modelRes.data;
                break;

            case 'NEW_TIME_STORY_LIKE_NOTIFICATION':
            case 'NEW_TIME_STORY_REPOST_NOTIFICATION':

                const timeStory = new TimeStories();
                var storyRes = await timeStory.find(data.story);
                params.data.story = storyRes.data;

                modelRes = await user.find(data.user);
                params.data.user = modelRes.data;
                break;

            case 'NEW_BOOK_LIKE_NOTIFICATION':
            case 'NEW_BOOK_COMMENT_NOTIFICATION':
            case 'NEW_FOLLOWER_NOTIFICATION':

                modelRes = await user.find(data);
                params.data = modelRes.data;
                break;

            case 'NEW_FRIEND_REQUEST_NOTIFICATION':
            case 'ACCEPTED_FRIEND_REQUEST_NOTIFICATION':

                const friend = new Frinds();
                modelRes = await friend.find({ id: data.id });
                params.data = modelRes.data;

                if (params.type == 'NEW_FRIEND_REQUEST_NOTIFICATION') {

                    if (userData.push_notification == 1) {
                        var devices = await user.getUserDevices(params.user_id);
                        pn.send(devices.data, "You have a new friend request", 1, { type: "friend_request", profile_id: params.data.sender_user_id });
                    }

                    if (userData.email_notification == 1) {
                        // send email
                        const tags = {
                            name: userData.fullname ?? '',
                            email_text: `You have received a new Friend request:<br><br>${data.message_text}`
                        };
                        try {
                            // send email to userData.email
                            const sendEmail = await Utils.sendEmail("chknabeel@hotmail.com", 'New Friend request received on BlkBox App', tags, 'generic_no_btn');
                            this.output.okRequest('new friend request email sent', null);
                        } catch (err) {
                            console.log(err);
                            this.output.badRequest('Email not sent');
                        }
                    }

                    if (userData.sms_notification == 1) {
                        // send sms
                    }
                }

                break;

            default:
                break;
        }

        params.data = JSON.stringify(params.data);

        const model = new Notifications();
        const response = await model.add(params);

        return response;
    } catch (err) {
        console.log(err);
        return Utils.internalServerError();
    }
};

const updateNotification = async (req, res) => {
    const id = req.params.id;

    try {
        const model = new Notifications();
        const response = await model.findByIdAndUpdate(id, req.body);

        return res.status(response.statusCode).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const deleteNotification = async (req, res) => {
    const id = req.params.id;

    try {
        const model = new Notifications();
        const response = await model.deleteById(id);

        res.json(response);
    } catch (err) {
        res.status(500).json(Utils.internalServerError());
    }
};

module.exports = {
    getNotifications,
    addNotification,
    updateNotification,
    deleteNotification,
};
