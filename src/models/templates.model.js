const Model = require("./model");

class Templates extends Model {
    constructor() {
        super();
        this.tableName = 'templates';
    }

    async find(args) {
        this.requiredCols = {
            type: 'required'
        }

        this.validate(args);

        const data = await this.getOneQuery('get_template_by_type', args);

        if (!data) return this.output.createBadRequest("Record not found");

        return this.output.createOkResponse('', data);
    }
}

module.exports = Templates;