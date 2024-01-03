const { replaceTags } = require("../helpers/utils");
const Model = require("./model");

class Notifications extends Model {
    constructor() {
        super();
        this.tableName = 'notifications';
    }

    async list(page, args) {

        this.requiredCols = {
            userId: 'required'
        }

        this.validate(args);

        if (this.isError) return this.output.response();

        const data = await this.getPageData(page, 'get_user_notifications_count', args, 10);
        args.offset = data.offset;
        args.perPage = data.perPage;
        const notificationData = await this.runQuery('get_user_notifications', args);

        for (let i in notificationData) {

            notificationData[i].data = JSON.parse(notificationData[i].data);
            const type = notificationData[i].type;
            const notificationUser = notificationData[i].user;

            switch (type) {

                case 'NEW_MESSAGE_NOTIFICATION':
                    var params = {
                        fullname: notificationUser.fullname ?? notificationUser.username,
                        message_text: notificationData[i].data.message_text
                    };
                    notificationData[i].text = replaceTags(params, notificationData[i].text);
                    break;

                case 'NEW_STORY_LIKE_NOTIFICATION':
                case 'NEW_STORY_REPOST_NOTIFICATION':

                    var user = notificationData[i].data.user;
                    var story = notificationData[i].data.story;
                    var params = {
                        fullname: user.fullname ?? user.username,
                        type: story.type
                    };
                    notificationData[i].text = replaceTags(params, notificationData[i].text);
                    break;

                case 'NEW_TIME_STORY_LIKE_NOTIFICATION':
                case 'NEW_TIME_STORY_REPOST_NOTIFICATION':

                    var user = notificationData[i].data.user;
                    var story = notificationData[i].data.story;
                    var params = {
                        fullname: user.fullname ?? user.username
                    };
                    notificationData[i].text = replaceTags(params, notificationData[i].text);
                    break;

                case 'NEW_BOOK_LIKE_NOTIFICATION':
                case 'NEW_FOLLOWER_NOTIFICATION':

                    const bookFollower = notificationData[i].data;
                    var params = {
                        fullname: bookFollower.fullname ?? bookFollower.username
                    };
                    notificationData[i].text = replaceTags(params, notificationData[i].text);
                    break;

                case 'NEW_FRIEND_REQUEST_NOTIFICATION':

                    const sender = notificationData[i].data.sender_user;
                    var params = {
                        fullname: sender.fullname ?? sender.username
                    };
                    notificationData[i].text = replaceTags(params, notificationData[i].text);
                    break;

                case 'ACCEPTED_FRIEND_REQUEST_NOTIFICATION':
                case 'DECLINED_FRIEND_REQUEST_NOTIFICATION':

                    const receiver = notificationData[i].data.receiver_user;
                    var params = {
                        fullname: receiver.fullname ?? receiver.username
                    };
                    notificationData[i].text = replaceTags(params, notificationData[i].text);
                    break;

                default:
                    break;
            }
        }

        data.rows = notificationData;
        this.output.okRequest('', data);
        return this.output.response();
    }

    async find(sqlParam) {

        this.requiredCols = {
            type: 'required'
        }

        this.validate(sqlParam);

        const data = await this.runQuery('get_user_by_id', args);

        if (!data) return this.output.createBadRequest("Record not found");

        this.output.okRequest('', data);
        return this.output.response();
    }

    async add(sqlParam) {

        this.requiredCols = {
            type: 'required',
            template_id: 'required',
            data: 'required',
            user_id: 'required'
        }

        this.validate(sqlParam);

        if (this.isError) return this.output.response();

        await this.insertQuery(this.tableName, sqlParam);

        return this.output.response();
    }

    async findByIdAndUpdate(id, sqlParam) {

        this.requiredCols = {
            first_name: 'required',
            last_name: 'required',
            age: this.validateAge
        }

        this.validate(sqlParam);

        if (!this.isError) {
            await this.updateQuery(this.tableName, sqlParam, id);
        }

        return this.output.response();
    }

    async deleteById(id) {

        await this.updateQuery(this.tableName, { status: 'Deleted' }, id);
        return this.output.response();
    }
}

module.exports = Notifications;