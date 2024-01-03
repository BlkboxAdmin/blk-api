const Model = require("./model");

class Comments extends Model {
    constructor() {
        super();
        this.tableName = 'comments';
    }

    async list(page, args) {

        this.requiredCols = {
            type: 'required',
            post_id: 'required'
        }
        this.validate(args);

        if (this.isError) return this.output.response();

        const data = await this.getPageData(page, 'get_comments_for_post_count', args, 5);

        args.offset = data.offset;
        args.perPage = data.perPage;

        data.rows = await this.runQuery('get_comments_for_post', args);

        this.output.okRequest('', data);
        return this.output.response();
    }

    async add(sqlParam) {

        this.requiredCols = {
            type: 'required',
            comment_text: 'required',
            post_id: 'required',
            created_by: 'required'
        }
        this.validate(sqlParam);

        if (!this.isError) {
            await this.insertQuery(this.tableName, sqlParam);
        }

        return this.output.response();
    }

    async deleteById(id, thisUserId) {

        const data = await this.getOneQuery('get_comment_by_id', { id: id });

        if (!data) return this.output.createBadRequest("Record not found");

        if (data.created_by != thisUserId) return this.output.createBadRequest("Access denied");

        await this.updateQuery(this.tableName, { status: 'Deleted' }, id);
        return this.output.response();
    }
}

module.exports = Comments;