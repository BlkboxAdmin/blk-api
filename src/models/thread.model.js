const { explode } = require("../helpers/utils");
const Model = require("./model");

class Thread extends Model {
    constructor() {
        super();
        this.tableName = 'thread';
    }

    async list() {
        const args = {
            age: 10,
            query: ''
        };
        const data = await this.runQuery('get_user_by_id', args);
        this.output.okRequest('', data);
        return this.output.response();
    }

    async find(args) {
        this.requiredCols = {
            recipient_user_id: 'required',
            sender_user_id: 'required'
        }
        this.validate(args);

        if (this.isError) return this.output.response();

        let data = await this.getOneQuery('get_thread_by_user_ids', args);

        if (!data) {
            const participantsArr = [args.recipient_user_id, args.sender_user_id];
            const params = {
                participants_ids: participantsArr.join(','),
                created_by: args.sender_user_id
            };
            await this.add(params);

            data = await this.getOneQuery('get_thread_by_user_ids', args);
        }

        this.output.okRequest('', data);
        return this.output.response();
    }

    async getRecipients(args, senderId = null) {

        this.requiredCols = {
            id: 'required'
        }
        this.validate(args);

        if (this.isError) return this.output.response();

        let data = await this.getOneQuery('get_thread_by_id', args);

        const participantsArr = explode(data.participants_ids, ',');
        const res = [];
        for (let i in participantsArr) {
            const userId = participantsArr[i];
            if (senderId != userId)
                res.push(userId);
        }

        return this.output.createOkResponse('', res);
    }


    async add(sqlParam) {

        if (!this.isError) {
            await this.insertQuery(this.tableName, sqlParam);
        }

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

module.exports = Thread;