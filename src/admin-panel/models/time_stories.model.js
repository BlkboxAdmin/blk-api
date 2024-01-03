const { explode } = require('../../helpers/utils');
const Model = require('../../models/model');

class TimeStories extends Model {
    constructor() {
        super(true);
        this.tableName = 'time_stories';
    }

    async list(page, args) {

        this.requiredCols = {
            status: 'required',
            created_by: 'required'
        }
        this.validate(args);

        if (this.isError) return this.output.response();

        const data = await this.getPageData(page, 'get_admin_time_stories_count', args, 10);
        args.offset = data.offset;
        args.perPage = data.perPage;

        const rows = await this.runQuery('get_admin_time_stories', args);

        for (let idx in rows) {
            const row = rows[idx];
            const favArr = explode(row.liked_by, ',');
            rows[idx].favCount = favArr.length;
        }

        data.rows = rows;

        this.output.okRequest('', data);
        return this.output.response();
    }

    async findByIdAndUpdate(id, sqlParam, thisUserId) {

        this.requiredCols = {
            status: 'required'
        }

        this.validate(sqlParam);

        if (this.isError) return this.output.response();

        await this.updateQuery(this.tableName, sqlParam, id);

        return this.output.response();
    }

    async deleteById(id, thisUserId) {

        await this.updateQuery(this.tableName, { status: 'Deleted' }, id);
        return this.output.response();
    }
}

module.exports = TimeStories;