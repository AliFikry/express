import { createPool } from "mysql";

const pool = createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "nodejs",
    connectionLimit: 10
});

function registerUser(name, email, password) {
    return new Promise((resolve, reject) => {
        pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password], (error) => {
            if (error) {
                reject(error);
            }
            resolve('User created successfully');
        });
    });

}
function searchUserByEmail(email, callback) {
    // Get a connection from the pool
    pool.getConnection((err, connection) => {
        if (err) {
            callback(err, null);
            return;
        }
        connection.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
            connection.release();

            if (err) {
                callback(err, null);
                return;
            }
            callback(null, results);
        });
    });
}

function getUserInfo(id, callback) {
    pool.query('SELECT * FROM users WHERE id = ?', [id], (error, results) => {
        if (error) {
            callback(error, null);
        }
        callback(null, results);
    });
}

function deleteUser(id, callback) {
    pool.query('DELETE FROM users WHERE id = ?', [id], (error, results) => {
        if (error) {
            callback(error, null);
        }
        callback(null, results);
    });

}

function resetPassword(email, password, callback) {
    pool.query('UPDATE users SET `password` = ? WHERE `email` = ?', [password, email], (error, results) => {
        if (error) {
            callback(error, null);

        }
        callback(null, results);
    });

}
export { registerUser, searchUserByEmail, getUserInfo, deleteUser, resetPassword };
