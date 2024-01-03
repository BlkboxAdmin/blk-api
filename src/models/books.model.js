const { explode } = require('../helpers/utils');
const Model = require('../models/model');

class Books extends Model {
    constructor() {
        super();
        this.tableName = 'books';
    }

    async list(page) {
        const data = await this.getPageData(page, 'get_books_count', {}, 10);
        const args = {
            offset: data.offset,
            perPage: data.perPage
        };
        const rows = await this.runQuery('get_books', args);

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

    async find(sqlParam) {
        const data = await this.getOneQuery('get_book_by_id', sqlParam);

        if (!data) return this.output.createBadRequest("Record not found");

        const likedByArr = explode(data.liked_by, ',');
        const disLikedByArr = explode(data.disliked_by, ',');
        data.like_count = likedByArr.length;
        data.dislike_count = disLikedByArr.length;

        this.output.okRequest('', data);
        return this.output.response();
    }

    async add(sqlParam) {

        this.requiredCols = {
            description: 'required',
            created_by: 'required'
        }
        this.validate(sqlParam);

        if (!this.isError) {
            await this.insertQuery(this.tableName, sqlParam);
        }

        return this.output.response();
    }

    async updateLikes(bookId, likerId) {

        if (!bookId) return this.output.createBadRequest('Book ID missing.');

        const sqlParam = {
            id: bookId
        };
        const row = await this.getOneQuery('get_book_by_id', sqlParam);
        const likedByArr = row.liked_by != '' ? row.liked_by.split(',') : [];
        const disLikedByArr = row.disliked_by != '' ? row.disliked_by.split(',') : [];
        const likedIdx = likedByArr.indexOf(likerId);
        const disLikedIdx = disLikedByArr.indexOf(likerId);
        const isAlreadyLiked = likedIdx > -1;
        const isAlreadyDisLiked = disLikedIdx > -1;

        if (isAlreadyLiked) return this.output.createOkResponse("Already liked", null);

        if (isAlreadyDisLiked) {
            disLikedByArr.splice(disLikedIdx, 1);
        }

        likedByArr.push(likerId);

        if (!this.isError) {
            const params = {
                liked_by: likedByArr.join(','),
                disliked_by: disLikedByArr.join(',')
            };
            await this.updateQuery(this.tableName, params, bookId);
        }

        return this.output.response();
    }

    async updateDisLikes(bookId, disLikerId) {

        if (!bookId) return this.output.createBadRequest('Book ID missing.');

        const sqlParam = {
            id: bookId
        };
        const row = await this.getOneQuery('get_book_by_id', sqlParam);
        const likedByArr = row.liked_by != '' ? row.liked_by.split(',') : [];
        const disLikedByArr = row.disliked_by != '' ? row.disliked_by.split(',') : [];
        const likedIdx = likedByArr.indexOf(disLikerId);
        const disLikedIdx = disLikedByArr.indexOf(disLikerId);
        const isAlreadyLiked = likedIdx > -1;
        const isAlreadyDisLiked = disLikedIdx > -1;

        if (isAlreadyDisLiked) return this.output.createOkResponse("Already disliked", null);

        if (isAlreadyLiked) {
            likedByArr.splice(likedIdx, 1);
        }

        disLikedByArr.push(disLikerId);

        if (!this.isError) {
            const params = {
                liked_by: likedByArr.join(','),
                disliked_by: disLikedByArr.join(',')
            };
            await this.updateQuery(this.tableName, params, bookId);
        }

        return this.output.response();
    }

    async findByIdAndUpdate(id, sqlParam, thisUserId) {

        this.requiredCols = {
            description: 'required'
        }
        this.validate(sqlParam);

        if (this.isError) return this.output.response();

        const data = await this.getOneQuery('get_book_by_id', { id: id });

        if (!data) return this.output.createBadRequest("Record not found");

        if (data.created_by != thisUserId) return this.output.createBadRequest("Access denied");

        await this.updateQuery(this.tableName, sqlParam, id);

        return this.output.response();
    }

    async deleteById(id, thisUserId) {

        const data = await this.getOneQuery('get_book_by_id', { id: id });

        if (!data) return this.output.createBadRequest("Record not found");

        if (data.created_by != thisUserId) return this.output.createBadRequest("Access denied");

        await this.updateQuery(this.tableName, { status: 'Deleted' }, id);
        return this.output.response();
    }

}

module.exports = Books;