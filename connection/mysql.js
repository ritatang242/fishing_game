var mysql = require('mysql');

const DatabaseCredential = {
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b8228822a37ac5',
    password: 'e26c1c18',
    database: 'heroku_e783206b1d51501',
    port: 3306
};
const DatabaseCredential2 = {
    host: '140.119.19.122',
    user: 'b8228822a37ac5',
    password: 'e26c1c18',
    database: 'fishgame',
    port: 3306
};

var pool = mysql.createPool(DatabaseCredential2);

const mysqlPoolQuery = async (sql, options, callback) => {
    pool.getConnection(async function (err, conn) {
        if (err) {
            callback(err, null, null);
        } else {
            conn.query(sql, options, async function (err, result, fields) {
                // callback
                callback(err, result, fields);
                //wlogger.debug(`[connection sussessful @ mysql.js] `);
                // http://localhost:${serverPort}/Product/ProductList
            });
            // release connection。
            // 要注意的是，connection 的釋放需要在此 release，而不能在 callback 中 release
            conn.release();
        }
    });
};

module.exports = { mysqlPoolQuery };