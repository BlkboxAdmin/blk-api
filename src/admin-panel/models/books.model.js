const { explode } = require('../../helpers/utils');
const Model = require('../../models/model');

class Books extends Model {
    constructor() {
        super(true);
        this.tableName = 'books';
    }

    async list(page, args) {

        this.requiredCols = {
            status: 'required'
        }
        this.validate(args);

        if (this.isError) return this.output.response();

        const data = await this.getPageData(page, 'get_admin_books_count', args, 10);

        args.offset = data.offset;
        args.perPage = data.perPage;

        const rows = await this.runQuery('get_admin_books', args);

        for (let idx in rows) {
            const row = rows[idx];
            const likedByArr = explode(row.liked_by, ',');
            const disLikedByArr = explode(row.disliked_by, ',');
            rows[idx].like_count = likedByArr.length;
            rows[idx].dislike_count = disLikedByArr.length;
        }

        data.rows = rows;

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

    async deleteById(id) {

        await this.updateQuery(this.tableName, { status: 'Deleted' }, id);
        return this.output.response();
    }

}

module.exports = Books;