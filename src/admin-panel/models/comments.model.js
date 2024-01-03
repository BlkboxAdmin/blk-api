const Model = require('../../models/model');

class Comments extends Model {
    constructor() {
        super(true);
        this.tableName = 'comments';
    }

    async list(page, args) {

        this.requiredCols = {
            type: 'required',
            status: 'required',
            post_id: 'required'
        }
        this.validate(args);

        if (this.isError) return this.output.response();

        const data = await this.getPageData(page, 'get_admin_comments_for_post_count', args, 5);

        args.offset = data.offset;
        args.perPage = data.perPage;

        data.rows = await this.runQuery('get_admin_comments_for_post', args);

        this.output.okRequest('', data);
        return this.output.response();
    }

    async findByIdAndUpdate(id, sqlParam) {

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

module.exports = Comments;