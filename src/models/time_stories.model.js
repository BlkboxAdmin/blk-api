const { explode } = require("../helpers/utils");
const Model = require("./model");

class TimeStories extends Model {
    constructor() {
        super();
        this.tableName = 'time_stories';
    }

    async list(page, args) {
        const data = await this.getPageData(page, 'get_time_stories_count', args, 10);
        args.offset = data.offset;
        args.perPage = data.perPage;

        const rows = await this.runQuery('get_time_stories', args);

        for (let idx in rows) {
            const row = rows[idx];
            const favArr = explode(row.liked_by, ',');
            rows[idx].favCount = favArr.length;
        }

        data.rows = rows;

        this.output.okRequest('', data);
        return this.output.response();
    }

    async listByUserId(page, args) {

        this.requiredCols = {
            userId: 'required'
        }
        this.validate(args);

        if (this.isError) return this.output.response();

        const data = await this.getPageData(page, 'get_user_time_stories_count', args, 10);
        args.offset = data.offset;
        args.perPage = data.perPage;

        const rows = await this.runQuery('get_user_time_stories', args);

        for (let idx in rows) {
            const row = rows[idx];
            const favArr = explode(row.liked_by, ',');
            rows[idx].favCount = favArr.length;
        }

        data.rows = rows;

        this.output.okRequest('', data);
        return this.output.response();
    }

    async find(sqlParam) {

        this.requiredCols = {
            id: 'required'
        }
        this.validate(sqlParam);

        const data = await this.getOneQuery('get_time_story_by_id', sqlParam);

        if (!data) return this.output.createBadRequest("Record not found");

        const favArr = explode(data.liked_by, ',');
        data.favCount = favArr.length;

        await this.updateQuery(this.tableName, { views: data.views + 1 }, data.id);

        this.output.okRequest('', data);
        return this.output.response();
    }

    async updateViews(sqlParam, userId) {

        this.requiredCols = {
            id: 'required'
        }
        this.validate(sqlParam);

        const data = await this.getOneQuery('get_time_story_by_id', sqlParam);

        if (!data) return this.output.createBadRequest("Record not found");

        const isStoryOwner = data.created_by == userId
        if (isStoryOwner) return this.output.createBadRequest("self view");

        await this.updateQuery(this.tableName, { views: data.views + 1 }, data.id);

        this.output.okRequest('', data);
        return this.output.response();
    }

    async metrics(sqlParam) {

        this.requiredCols = {
            userId: 'required'
        }
        this.validate(sqlParam);

        const data = await this.getOneQuery('get_time_story_metrics_by_user_id', sqlParam);

        if (!data) return this.output.createBadRequest("Record not found");

        const favArr = explode(data.fav_by, ',');

        const rData = {
            totalVideoViews: parseInt(data.total_video_views_count),
            totalVideoLikeCount: favArr.length,
            totalVideoCommentCount: data.comment_count,
            videoCount: data.video_count
        };

        this.output.okRequest('', rData);
        return this.output.response();
    }

    async add(sqlParam) {

        this.requiredCols = {
            video: 'required',
            expiring_on: 'required',
            created_by: 'required'
        }

        this.validate(sqlParam);

        if (this.isError) return this.output.response();

        await this.insertQuery(this.tableName, sqlParam);

        return this.output.response();
    }

    async updateFavs(storyId, userId) {

        if (!storyId) return this.output.createBadRequest('Story ID missing.');

        const sqlParam = {
            id: storyId
        };
        const row = await this.getOneQuery('get_time_story_by_id', sqlParam);

        if (!row) return this.output.createBadRequest("Record not found");

        const favByArr = explode(row.liked_by, ',');
        const faverIdx = favByArr.indexOf(userId);
        const isAlreadyFaved = faverIdx > -1;

        if (isAlreadyFaved) {
            favByArr.splice(faverIdx, 1);
        }
        else {
            favByArr.push(userId);
        }

        if (!this.isError) {
            const params = {
                liked_by: favByArr.join(',')
            };
            await this.updateQuery(this.tableName, params, storyId);
        }

        return this.output.response();
    }

    async repost(storyId, sqlparam, userId) {

        if (!storyId) return this.output.createBadRequest('Story ID missing.');

        const sqlParam = {
            id: storyId
        };
        const row = await this.getOneQuery('get_time_story_by_id', sqlParam);

        if (!row) return this.output.createBadRequest("Record not found");

        sqlparam.video = row.video;
        sqlparam.parent_story = storyId;
        sqlparam.created_by = userId;
        const addResponse = await this.add(sqlparam);

        if (this.isError) return this.output.createInternalServerError();

        const params = {
            repost_count: row.repost_count + 1
        };
        await this.updateQuery(this.tableName, params, storyId);

        return this.output.response();
    }

    async findByIdAndUpdate(id, sqlParam, thisUserId) {

        this.requiredCols = {
            description: 'required'
        }

        this.validate(sqlParam);

        if (this.isError) return this.output.response();

        const data = await this.getOneQuery('get_time_story_by_id', { id: id });

        if (!data) return this.output.createBadRequest("Record not found");

        if (data.created_by != thisUserId) return this.output.createBadRequest("Access denied");

        await this.updateQuery(this.tableName, sqlParam, id);

        return this.output.response();
    }

    async deleteById(id, thisUserId) {

        const data = await this.getOneQuery('get_time_story_by_id', { id: id });

        if (!data) return this.output.createBadRequest("Record not found");

        if (data.created_by != thisUserId) return this.output.createBadRequest("Access denied");

        await this.updateQuery(this.tableName, { status: 'Deleted' }, id);
        return this.output.response();
    }
}

module.exports = TimeStories;