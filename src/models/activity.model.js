const { replaceTags } = require("../helpers/utils");
const Model = require("./model");

class Activity extends Model {
    constructor() {
        super();
        this.tableName = 'activity';
    }

    async list(page, args) {

        this.requiredCols = {
            userId: 'required'
        }

        this.validate(args);

        if (this.isError) return this.output.response();

        const data = await this.getPageData(page, 'get_user_activities_count', args, 10);
        args.offset = data.offset;
        args.perPage = data.perPage;
        const activitiesData = await this.runQuery('get_user_activities', args);

        for (let i in activitiesData) {

            activitiesData[i].data = JSON.parse(activitiesData[i].data);
            const type = activitiesData[i].type;

            switch (type) {
                case "NEW_BOOK_LIKE_ACTIVITY":
                case 'NEW_FOLLOW_ACTIVITY':

                    const bookAuther = activitiesData[i].data.user;
                    var params = {
                        fullname: bookAuther.fullname ?? bookAuther.username
                    };
                    activitiesData[i].text = replaceTags(params, activitiesData[i].text);
                    break;

                case 'NEW_STORY_LIKE_ACTIVITY':
                case 'NEW_STORY_REPOST_ACTIVITY':

                    const storyAuther = activitiesData[i].data.user;
                    var params = {
                        fullname: storyAuther.fullname ?? storyAuther.username,
                        type: activitiesData[i].data.type
                    };
                    activitiesData[i].text = replaceTags(params, activitiesData[i].text);
                    break;

                case 'NEW_TIME_STORY_LIKE_ACTIVITY':
                case 'NEW_TIME_STORY_REPOST_ACTIVITY':

                    const timeStoryAuther = activitiesData[i].data.user;
                    var params = {
                        fullname: timeStoryAuther.fullname ?? timeStoryAuther.username
                    };
                    activitiesData[i].text = replaceTags(params, activitiesData[i].text);
                    break;

                case 'NEW_FRIEND_REQUEST_ACTIVITY':

                    const receiver = activitiesData[i].data.receiver_user;
                    var params = {
                        fullname: receiver.fullname ?? receiver.username
                    };
                    activitiesData[i].text = replaceTags(params, activitiesData[i].text);
                    break;

                case 'ACCEPTED_FRIEND_REQUEST_ACTIVITY':
                case 'DECLINED_FRIEND_REQUEST_ACTIVITY':

                    const sender = activitiesData[i].data.sender_user;
                    var params = {
                        fullname: sender.fullname ?? sender.username
                    };
                    activitiesData[i].text = replaceTags(params, activitiesData[i].text);
                    break;

                default:
                    break;
            }
        }

        data.rows = activitiesData;
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
            user_id: 'required',
            created_by: 'required'
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

module.exports = Activity;