const Model = require("../../models/model");

class Templates extends Model {
    constructor() {
        super(true);
        this.tableName = 'templates';
    }

    async list(page, args) {

        this.requiredCols = {
            type: 'required',
            status: 'required'
        }

        this.validate(args);

        if (this.isError) return this.output.response();

        const data = await this.getPageData(page, 'get_templates_count', args, 10);
        args.offset = data.offset;
        args.perPage = data.perPage;

        data.rows = await this.runQuery('get_templates', args);

        return this.output.createOkResponse('', data);
    }

    async find() {
        const args = {
            age: 10,
            query: ''
        };
        const data = await this.runQuery('get_user_by_id', args);

        if (!data) return this.output.createBadRequest("Record not found");

        this.output.okRequest('', data);
        return this.output.response();
    }

    async add(sqlParam) {

        this.requiredCols = {
            type: 'required',
            description: 'required',
            created_by: 'required'
        }

        this.validate(sqlParam);

        if (this.isError) return this.output.response();

        await this.insertQuery(this.tableName, sqlParam);

        return this.output.response();
    }

    async findByIdAndUpdate(id, sqlParam) {

        this.requiredCols = {
            type: 'required',
            description: 'required',
            status: 'required'
        }

        this.validate(sqlParam);

        if (this.isError) return this.output.response();

        await this.updateQuery(this.tableName, sqlParam, id);

        return this.output.response();
    }

    async deleteById(id) {

        await this.updateQuery(this.tableName, { status: 'Deleted' }, id);
        return this.output.response();
    }
}

module.exports = Templates;