const { explode } = require("../helpers/utils");
const Model = require("./model");

class Stories extends Model {
    constructor() {
        super();
        this.tableName = 'stories';
    }

    async list(page, args) {
        const data = await this.getPageData(page, 'get_stories_count', args, 10);
        args.offset = data.offset;
        args.perPage = data.perPage;

        const rows = await this.runQuery('get_stories', args);

        for (let idx in rows) {
            const row = rows[idx];
            const favArr = explode(row.favs, ',');
            rows[idx].favCount = favArr.length;
        }

        data.rows = rows;

        this.output.okRequest('', data);
        return this.output.response();
    }

    async listByUserId(page, args) {

        this.requiredCols = {
            userId: 'required',
            type: 'required'
        }
        this.validate(args);

        if (this.isError) return this.output.response();

        const data = await this.getPageData(page, 'get_user_stories_count', args, 10);
        args.offset = data.offset;
        args.perPage = data.perPage;

        const rows = await this.runQuery('get_user_stories', args);

        for (let idx in rows) {
            const row = rows[idx];
            const favArr = explode(row.favs, ',');
            rows[idx].favCount = favArr.length;
        }

        data.rows = rows;

        this.output.okRequest('', data);
        return this.output.response();
    }

    async boardByUserId(page, args) {

        this.requiredCols = {
            userId: 'required',
            type: 'required'
        }
        this.validate(args);

        if (this.isError) return this.output.response();

        const data = await this.getPageData(page, 'get_user_board_stories_count', args, 10);
        args.offset = data.offset;
        args.perPage = data.perPage;

        const rows = await this.runQuery('get_user_board_stories', args);

        for (let idx in rows) {
            const row = rows[idx];
            const favArr = explode(row.favs, ',');
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

        const data = await this.getOneQuery('get_story_by_id', sqlParam);

        if (!data) return this.output.createBadRequest("Record not found");

        const favArr = explode(data.favs, ',');
        data.favCount = favArr.length;

        this.output.okRequest('', data);
        return this.output.response();
    }

    async add(sqlParam) {

        this.requiredCols = {
            created_by: 'required'
        }

        this.validate(sqlParam);

        if (sqlParam.description == '' && sqlParam.image == '') {
            this.output.badRequest("Please add description or image");
        }

        if (!this.isError) {
            await this.insertQuery(this.tableName, sqlParam);
        }

        return this.output.response();
    }

    async updateFavs(storyId, userId) {

        if (!storyId) return this.output.createBadRequest('Story ID missing.');

        const sqlParam = {
            id: storyId
        };
        const row = await this.getOneQuery('get_story_by_id', sqlParam);

        if (!row) return this.output.createBadRequest("Record not found");

        const favByArr = explode(row.favs, ',');
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
                favs: favByArr.join(',')
            };
            await this.updateQuery(this.tableName, params, storyId);
        }

        return this.output.response();
    }

    async repost(storyId, sqlparam, userId) {

        if (!storyId) return this.output.createBadRequest('Story ID missing.');

        sqlparam.parent_story = storyId;
        sqlparam.created_by = userId;
        const addResponse = await this.add(sqlparam);

        if (this.isError) return this.output.createInternalServerError();

        const sqlParam = {
            id: storyId
        };
        const row = await this.getOneQuery('get_story_by_id', sqlParam);

        if (!row) return this.output.createBadRequest("Record not found");

        if (!this.isError) {
            const params = {
                repost_count: row.repost_count + 1
            };
            await this.updateQuery(this.tableName, params, storyId);
        }

        return this.output.response();
    }

    async findByIdAndUpdate(id, sqlParam, thisUserId) {

        this.requiredCols = {
            description: 'required'
        }

        this.validate(sqlParam);

        if (this.isError) return this.output.response();

        const data = await this.getOneQuery('get_story_by_id', { id: id });

        if (!data) return this.output.createBadRequest("Record not found");

        if (data.created_by != thisUserId) return this.output.createBadRequest("Access denied");

        await this.updateQuery(this.tableName, sqlParam, id);

        return this.output.response();
    }

    async deleteById(id, thisUserId) {

        const data = await this.getOneQuery('get_story_by_id', { id: id });

        if (!data) return this.output.createBadRequest("Record not found");

        if (data.created_by != thisUserId) return this.output.createBadRequest("Access denied");

        await this.updateQuery(this.tableName, { status: 'Deleted' }, id);

        return this.output.response();
    }
}

module.exports = Stories;