const Model = require("./model");

class Messages extends Model {
    constructor() {
        super();
        this.tableName = 'messages';
    }

    async list(page, args) {
        this.requiredCols = {
            threadId: 'required',
            thisUserId: 'required'
        }
        this.validate(args);

        if (this.isError) return this.output.response();

        const thread = await this.getOneQuery('get_thread_by_user_id', args);

        if (!thread) return this.output.createBadRequest('Invalid thread');

        const data = await this.getPageData(page, 'get_messages_by_thread_id_count', args, 20);
        args.offset = data.offset;
        args.perPage = data.perPage;
        data.rows = await this.runQuery('get_messages_by_thread_id', args);

        data.rows = data.rows.reverse();

        this.output.okRequest('', data);
        return this.output.response();
    }

    async checkNewMessage(userId, sqlParam) {

        this.requiredCols = {
            threadId: 'required',
            lastMessageId: 'required'
        }
        this.validate(sqlParam);

        if (this.isError) return this.output.response();

        const data = await this.getOneQuery('get_last_message_by_thread_id', sqlParam);

        const response = (data.id != sqlParam.lastMessageId);

        this.output.okRequest(response ? 'new messages exists' : 'no new message', response);
        return this.output.response();
    }

    async add(sqlParam) {

        this.requiredCols = {
            thread_id: 'required',
            message_text: 'required',
            created_by: 'required'
        }
        this.validate(sqlParam);

        if (this.isError) return this.output.response();

        const thread = await this.getOneQuery('get_thread_by_user_id', { threadId: sqlParam.thread_id, thisUserId: sqlParam.created_by });

        if (!thread) return this.output.createBadRequest('Invalid thread');

        await this.insertQuery(this.tableName, sqlParam);

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

module.exports = Messages;