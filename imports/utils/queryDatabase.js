module.exports = async (queryStrign, values = [], connection = global.DATABASE) => {
    return await new Promise((resolve, reject) => {
        connection.query(queryStrign, values, (err, res) => {
            if(err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}