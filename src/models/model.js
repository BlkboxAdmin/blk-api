const pool = require('../databases/mysql.db');
var fs = require('fs');
var path = require('path');
const Utils = require('../helpers/utils');
const Response = require('../helpers/response');
const { addSlashes } = require('../helpers/utils');

class Model {

    constructor(isAdmin = false) {
        this.requiredCols = {};
        this.output = new Response();
        this.isAdmin = isAdmin;
    }

    get isAdmin() {
        return this._isAdmin;
    }

    set isAdmin(v) {
        this._isAdmin = v;
    }

    get requiredCols() {
        return this._requiredCols;
    }

    set requiredCols(v) {
        this._requiredCols = v;
    }

    get isError() {
        return (this.output.statusCode > 202);
    }

    sanitizeRequest(reqCols, reqParam) {
        for (let col in reqParam) {
            const isValidCol = (reqCols.indexOf(col) > -1);
            if (!isValidCol) {
                delete reqParam[col];
            }
        }

        if (Object.keys(reqParam).length === 0) {
            this.output.badRequest('Invalid parameters');
            return false;
        }

        return true;
    }

    validate(input) {

        for (let key in this.requiredCols) {
            let isMissing = !(key in input)
            if (isMissing) {
                this.output.badRequest(`${key} is missing from request.`);
                break;
            }
        }

        for (let key in input) {
            let isRequiredCol = key in this.requiredCols;
            if (isRequiredCol) {
                let validationType = this.requiredCols[key];
                const value = input[key]
                switch (validationType) {
                    case 'required':
                        this.isRequired(value, key);
                        break;

                    case 'email':
                        this.isValidEmail(value, key);
                        break;

                    case 'password':
                        this.isValidPassword(value, key);
                        break;

                    default:
                        validationType(value, key, this);
                        break;
                }
            }
        }
    }

    isRequired(value, key) {
        if (value === undefined) {
            this.output.badRequest(`Invalid ${key} value.`);
            return false;
        }

        if (value === '') {
            this.output.badRequest(`Invalid ${key} value.`);
            return false;
        }
    }

    isValidEmail(value, key) {
        this.isRequired(value, key);

        const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

        if (!value.match(validRegex)) {
            this.output.badRequest(`Invalid email.`);
            return false;
        }
    }

    isValidPassword(value, key) {
        this.isRequired(value, key);

        const validRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/;

        if (!value.match(validRegex)) {
            this.output.badRequest(`Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters`);
            return false;
        }
    }

    async checkDuplicates(tableName, col, value) {
        try {
            const sql = `SELECT COUNT(${col}) AS num FROM ${tableName} WHERE ${col} = '${value}';`;
            const [row, fields] = await pool.execute(sql);

            return row[0].num;

        } catch (err) {
            console.log(err);
            this.output.internalServerError();
        }
    }

    async checkDuplicatesForExisting(tableName, col, value, id) {
        try {
            const sql = `SELECT COUNT(${col}) AS num FROM ${tableName} WHERE ${col} = '${value}' AND id <> '${id}';`;
            const [row, fields] = await pool.execute(sql);

            return row[0].num;

        } catch (err) {
            console.log(err);
            this.output.internalServerError();
        }
    }

    replaceSqlTags(params, sql) {
        for (let key in params) {
            sql = Utils.replaceAll(`<{${key}}>`, params[key], sql);
        }

        return sql;
    }

    async getUserDevices(userId) {

        const param = {
            user_id: userId
        }

        this.requiredCols = {
            user_id: 'required'
        }
        this.validate(param);

        if (this.isError) return this.output.response();

        const row = await this.getOneQuery('get_apn_devices_by_user', param);

        return this.output.createOkResponse('', row.devices);
    }

    async addDevice(deviceToken, userId) {

        const data = this.output.data;

        const param = {
            device_token: deviceToken,
            user_id: userId
        }

        this.requiredCols = {
            device_token: 'required',
            user_id: 'required'
        }
        this.validate(param);

        if (this.isError) return this.output.createOkResponse('device not registered. token missing', data);

        const rows = await this.runQuery('get_apn_device', param);

        if (rows.length == 0) {

            await this.insertQuery('apn_devices', param);

            return this.output.createOkResponse('new device registered', data);
        }

        return this.output.createOkResponse('device already registered', data);
    }

    async checkUsername(tableName, username) {
        try {
            const sql = `SELECT username, password, email, id, fullname, status FROM ${tableName} WHERE email = '${username}' AND status <> 'Deleted';`;
            const [rows, fields] = await pool.execute(sql);

            return rows;

        } catch (err) {
            console.log(err);
            this.output.internalServerError();
        }
    }

    async checkUserId(tableName, userId, password) {
        try {
            const sql = `SELECT username, password, email, id, fullname, status FROM ${tableName} WHERE id = '${userId}' AND status <> 'Deleted';`;
            const [rows, fields] = await pool.execute(sql);

            return rows;

        } catch (err) {
            console.log(err);
            this.output.internalServerError();
        }
    }

    async checkResetPasswordKey(tableName, key) {
        try {
            const sql = `SELECT username, password, email, id, fullname, status FROM ${tableName} WHERE reset_password_key = '${key}' AND reset_password_key <> '' AND reset_password_request_on >= (NOW() - INTERVAL 24 HOUR) AND status <> 'Deleted';`;
            const [rows, fields] = await pool.execute(sql);

            return rows;

        } catch (err) {
            console.log(err);
            this.output.internalServerError();
        }
    }

    async checkEmailVerificationKey(tableName, email, key) {
        try {
            const sql = `SELECT username, password, email, id, fullname, status FROM ${tableName} WHERE email = '${email}' AND email_verification_key = '${key}' AND email_verification_key <> '' AND email_verified = 'Pending' AND status <> 'Deleted';`;
            const [rows, fields] = await pool.execute(sql);

            return rows;

        } catch (err) {
            console.log(err);
            this.output.internalServerError();
        }
    }

    async getPageData(page, sqlKey, sqlParam = {}, perPage = 3) {
        const offset = (page - 1) * perPage;
        const totalRows = (await this.getOneQuery(sqlKey, sqlParam)).num;
        const totalPages = Math.ceil(totalRows / perPage);
        const currentPage = parseInt(page);
        const data = {
            rows: [],
            page: currentPage,
            isFirstPage: (currentPage == 1),
            perPage: perPage,
            offset: offset,
            totalRows: totalRows,
            totalPages: totalPages,
            isLastPage: (currentPage == totalPages),
            pageRange: this.range(1, totalPages)
        };

        return data;
    }

    range(start, end) {
        const numbers = [];
        for (let i = start; i <= end; i++) {
            numbers.push(i);
        }
        return numbers;
    };

    async getCount(sqlKey, params = {}) {
        try {
            const rows = await this.runQuery(sqlKey, params)
            return rows[0].num;
        } catch (err) {
            console.log(err);
            this.output.internalServerError();
        }
    }

    async getOneQuery(sqlKey, params = {}) {
        try {
            const rows = await this.runQuery(sqlKey, params)
            return rows[0];
        } catch (err) {
            console.log(err);
            this.output.internalServerError();
        }
    }

    async runQuery(sqlKey, params = {}) {
        try {
            var sqlPath = this.isAdmin ? path.join(__dirname, '..', 'admin-panel', 'sql', `${sqlKey}.sql`) : path.join(__dirname, '..', 'databases', 'sql', `${sqlKey}.sql`);
            let sql = fs.readFileSync(sqlPath, 'utf8');
            sql = this.replaceSqlTags(params, sql);

            const [rows, fields] = await pool.execute(sql);
            return rows;
        } catch (err) {
            console.log(err);
            this.output.internalServerError();
        }
    }

    async insertQuery(tableName, sqlParam) {
        try {
            if (tableName == '')
                return false;

            if (sqlParam == '')
                return false;

            let columns = '';
            let values = '';

            for (let col in sqlParam) {
                columns += `, ${col}`;
                values += `, '${addSlashes(sqlParam[col])}'`;
            }

            var [r, _] = await pool.execute(`SELECT UUID() AS uuid`);
            const uuid = r[0].uuid;

            let sql = `
            INSERT INTO ${tableName}
            ( id ${columns} )
            VALUES 
            ('${uuid}' ${values})
            `;

            await pool.execute(sql);

            sql = `SELECT * FROM ${tableName} WHERE id = '${uuid}';`;
            var [rows, _] = await pool.execute(sql);

            this.output.insertRequest("Successfully added.", rows[0])

        } catch (err) {
            console.log(err);
            this.output.internalServerError();
        }
    }

    async updateQuery(tableName, sqlParam, id) {

        try {

            if (tableName == '')
                return false;

            if (sqlParam == '')
                return false;

            if (id == '')
                return false;

            let updatesArr = [];

            for (let col in sqlParam) {
                const val = sqlParam[col];
                const isBool = (typeof val == "boolean");
                if (isBool)
                    updatesArr.push(`${col}=${val}`);
                else
                    updatesArr.push(`${col}="${addSlashes(val)}"`);
            }

            let sql = `
            UPDATE ${tableName}
            SET ${updatesArr.join(' ,')}
            WHERE id = "${id}"
            `;

            await pool.execute(sql);

            sql = `SELECT * FROM ${tableName} WHERE id = '${id}';`;
            const [rows, fields] = await pool.execute(sql);

            this.output.updateRequest("Successfully updated.", rows[0]);
        } catch (err) {
            console.log(err);
            this.output.internalServerError();
        }
    }
}

module.exports = Model;