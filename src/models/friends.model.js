const { mysqlDate, explode } = require("../helpers/utils");
const Model = require("./model");

class Frinds extends Model {
    constructor() {
        super();
        this.tableName = 'friends';
    }

    async list(args) {

        this.requiredCols = {
            userId: 'required'
        }
        this.validate(args);

        if (this.isError) return this.output.response();

        const data = await this.runQuery('get_friends_by_user_id', args);
        this.output.okRequest('', data);
        return this.output.response();
    }

    async find(args) {
        this.requiredCols = {
            id: 'required'
        }
        this.validate(args);

        if (this.isError) return this.output.response();

        const data = await this.getOneQuery('get_friend_by_id', args);

        if (!data) return this.output.createBadRequest("Record not found");

        return this.output.createOkResponse('', data);
    }

    async add(sqlParam) {

        this.requiredCols = {
            sender_user_id: 'required',
            receiver_user_id: 'required',
            created_by: 'required'
        }

        this.validate(sqlParam);

        if (this.isError) return this.output.response();

        const data = await this.getOneQuery('get_user_by_id', { userId: sqlParam.receiver_user_id });

        if (!data) return this.output.createBadRequest('User not found');

        const blocksArr = explode(data.blocked_user_ids, ',');
        const isSenderBlocked = blocksArr.indexOf(sqlParam.sender_user_id) > -1;

        if (isSenderBlocked) return this.output.createBadRequest(`You are blocked by ${data.fullname}`);

        const params = {
            sender_user_id: sqlParam.sender_user_id,
            receiver_user_id: sqlParam.receiver_user_id
        };
        const friendShipData = await this.getFriendship(params);

        if (friendShipData.isInvited) return this.output.createBadRequest('Already Invited');
        if (friendShipData.isFriend) return this.output.createBadRequest('Already Friend');

        sqlParam.invited_on = mysqlDate();

        if (this.isError) return this.output.response();

        await this.insertQuery(this.tableName, sqlParam);

        return this.output.response();
    }

    async updateAnswer(id, args) {

        this.requiredCols = {
            answer: 'required'
        }

        this.validate(args);

        if (this.isError) return this.output.response();

        const params = {
            id: id
        };
        const row = await this.getOneQuery('get_friend_by_id', params);

        if (!row)
            return this.output.createBadRequest('Invalid ID');
        else if (row.status == 'Active')
            return this.output.createBadRequest('Already Friend');
        else if (row.status == 'Declined')
            return this.output.createBadRequest('Already declined this friend request');

        const isAccepted = args.answer == 'Accept';

        const sqlParam = {
            answered_on: mysqlDate(),
            status: isAccepted ? 'Active' : 'Declined'
        };
        await this.updateQuery(this.tableName, sqlParam, id);

        return this.output.response();
    }

    async unfriend(args) {

        this.requiredCols = {
            friend_id: 'required',
            userId: 'required'
        }

        this.validate(args);

        if (this.isError) return this.output.response();

        const params = {
            sender_user_id: args.friend_id,
            receiver_user_id: args.userId
        };
        const friendShipData = await this.getFriendship(params);

        if (!friendShipData.isFriend) return this.output.createBadRequest('This user is not your friend');

        return await this.deleteById(friendShipData.data.id);
    }

    async getFriendship(args) {

        this.requiredCols = {
            sender_user_id: 'required',
            receiver_user_id: 'required'
        }

        this.validate(args);

        const row = await this.getOneQuery('get_friend_by_user_ids', args);

        if (!row) return { isFriend: false, isInvited: false, data: null };

        return {
            isFriend: (row.status == 'Active'), isInvited: (row.status == 'Invited'), data: row
        };
    }

    async findByIdAndUpdate(id, sqlParam) {

        this.requiredCols = {
            answer: 'required'
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

module.exports = Frinds;