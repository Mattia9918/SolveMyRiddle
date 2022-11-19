'use strict';

const sqlite = require('sqlite3');
const crypto = require('crypto');
const { Riddle } = require('./riddle');
const { Response } = require('./response');
const { User } = require('./user');


/* DB opening */
const db = new sqlite.Database('solveMyRiddle.sqlite', (err) => {
    if (err) {
        throw err;
    }
});


/* DAO functions */

/**
 * User authentication function, called by LocalStrategy's
 * function verify
 */

function getUser(username, password) {
    return new Promise((resolve, reject) => {

        /* Username research */
        const sql = 'SELECT * FROM USER WHERE USERNAME = ?';
        db.get(sql, [username], (err, row) => {
            if (err) {
                reject(err);
            }
            else if (row === undefined) {
                resolve(false);
            }
            else {
                const user = new User(
                    row.ID,
                    row.USERNAME,
                    row.SCORE
                );

                /* In clear password (parameter) conversion according to user's salt */
                crypto.scrypt(password, row.SALT, 32, function (err, hashedPassword) {
                    if (err) reject(err);

                    /* Hashed password (parameter) compared with in-database user's password */
                    if (!crypto.timingSafeEqual(Buffer.from(row.HASH, 'hex'), hashedPassword))
                        resolve(false);
                    else
                        resolve(user);
                });
            }
        });
    });
};

function getOpenRiddles(userId) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT R.ID, STATUS, DURATION, RESIDUALTIME, DIFFICULTY, QUESTION, HINT1, HINT2, CORRECTRESPONSE, USERID, U.ID AS UID, U.USERNAME FROM RIDDLE R, USER U WHERE R.USERID = U.ID AND UID != ? AND STATUS = "OPEN" ORDER BY R.ID DESC';
        db.all(sql, [userId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const riddles = rows.map((riddle) =>
                    new Riddle(
                        riddle.ID,
                        riddle.STATUS,
                        riddle.DURATION,
                        riddle.RESIDUALTIME,
                        riddle.DIFFICULTY,
                        riddle.QUESTION,
                        riddle.HINT1,
                        riddle.HINT2,
                        undefined, /* security measure to avoid anonymous and users to sniff the correctResponse */
                        riddle.USERID,
                        riddle.USERNAME
                    ));

                resolve(riddles);
            }
        });
    });
};

function getClosedRiddles() {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT R.ID, STATUS, DURATION, RESIDUALTIME, DIFFICULTY, QUESTION, HINT1, HINT2, CORRECTRESPONSE, USERID, U.ID AS UID, U.USERNAME FROM RIDDLE R, USER U WHERE R.USERID = U.ID AND STATUS = "CLOSED" ORDER BY R.ID DESC';
        db.all(sql, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const riddles = rows.map((riddle) =>
                    new Riddle(
                        riddle.ID,
                        riddle.STATUS,
                        riddle.DURATION,
                        riddle.RESIDUALTIME,
                        riddle.DIFFICULTY,
                        riddle.QUESTION,
                        riddle.HINT1,
                        riddle.HINT2,
                        riddle.CORRECTRESPONSE,
                        riddle.USERID,
                        riddle.USERNAME
                    ));

                resolve(riddles);
            }
        });
    });
};

function getMyOpenRiddles(userId) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM RIDDLE WHERE USERID = ? AND STATUS = "OPEN" ORDER BY ID DESC';
        db.all(sql, [userId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const riddles = rows.map((riddle) =>
                    new Riddle(
                        riddle.ID,
                        riddle.STATUS,
                        riddle.DURATION,
                        riddle.RESIDUALTIME,
                        riddle.DIFFICULTY,
                        riddle.QUESTION,
                        riddle.HINT1,
                        riddle.HINT2,
                        riddle.CORRECTRESPONSE,
                        riddle.USERID
                    ));

                resolve(riddles);
            }
        });
    });
};

function getMyClosedRiddles(userId) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM RIDDLE WHERE USERID = ? AND STATUS = "CLOSED" ORDER BY ID DESC';
        db.all(sql, [userId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const riddles = rows.map((riddle) =>
                    new Riddle(
                        riddle.ID,
                        riddle.STATUS,
                        riddle.DURATION,
                        riddle.RESIDUALTIME,
                        riddle.DIFFICULTY,
                        riddle.QUESTION,
                        riddle.HINT1,
                        riddle.HINT2,
                        riddle.CORRECTRESPONSE,
                        riddle.USERID
                    ));

                resolve(riddles);
            }
        });
    });
};

function getUserRanking() {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM (SELECT *, DENSE_RANK() OVER (ORDER BY SCORE DESC) CLASSIFY FROM USER) WHERE CLASSIFY <= 3;';
        db.all(sql, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const users = rows.map((user) =>
                    new User(
                        user.ID,
                        user.USERNAME,
                        user.SCORE,
                        user.CLASSIFY
                    ));

                resolve(users);
            }
        });
    });
};

function postRiddle(riddle, userId) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO RIDDLE(ID, STATUS, DURATION, RESIDUALTIME, DIFFICULTY, QUESTION, HINT1, HINT2, CORRECTRESPONSE, USERID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        db.run(sql, [undefined, riddle.status, riddle.duration, riddle.residualTime, riddle.difficulty, riddle.question, riddle.hint1, riddle.hint2, riddle.correctResponse, userId], (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(true);
            }
        });
    });
};


function closeRiddle(riddleId) {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE RIDDLE SET STATUS = "CLOSED", RESIDUALTIME = 0 WHERE ID = ?';
        db.run(sql, [riddleId], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        });
    });
};


function getResponses(riddleId) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT R.ID, R.TEXT, R.USERID, R.RIDDLEID, U.ID AS UID, U.USERNAME FROM RESPONSE R, USER U WHERE R.USERID = U.ID AND R.RIDDLEID = ? ORDER BY R.ID DESC';
        db.all(sql, [riddleId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const responses = rows.map((response) =>
                    new Response(
                        response.ID,
                        response.TEXT,
                        response.USERID,
                        response.USERNAME,
                        response.RIDDLEID
                    ));

                resolve(responses);
            }
        });
    });
};

function checkExistingResponse(userId, riddleId) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT COUNT(*) AS count FROM RESPONSE WHERE USERID = ? AND RIDDLEID = ?'
        db.get(sql, [userId, riddleId], (err, row) => {
            if (err) {
                reject(err);
            } else if (row.count !== 0) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
};

function postResponse(data, userId, riddleId) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO RESPONSE(ID, TEXT, USERID, RIDDLEID) VALUES (?, ?, ?, ?)'
        db.run(sql, [undefined, data.text, userId, riddleId], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        });
    });
};

function getCorrectResponseAndDifficulty(riddleId) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT CORRECTRESPONSE, DIFFICULTY FROM RIDDLE WHERE ID = ?'
        db.get(sql, [riddleId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                const couple = [row.CORRECTRESPONSE, row.DIFFICULTY];
                resolve(couple);
            }
        });
    });
};

function putScore(userId, score) {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE USER SET SCORE = SCORE + ? WHERE ID = ?'
        db.run(sql, [score, userId], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        });
    });
};

function getUserInfo(userId) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM USER WHERE ID = ?';
        db.get(sql, [userId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                const user =
                    new User(
                        row.ID,
                        row.USERNAME,
                        row.SCORE
                    );
                resolve(user);
            }
        });
    });
};


function decrementResidualTime(riddleId) {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE RIDDLE SET RESIDUALTIME = RESIDUALTIME - 1 WHERE ID = ? AND STATUS = "OPEN"';
        db.run(sql, [riddleId], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        });
    });
};

function checkResidualTime(riddleId) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT RESIDUALTIME FROM RIDDLE WHERE ID = ?';
        db.get(sql, [riddleId], (err, row) => {
            if (err) {
                reject(err);
            } else if (row.RESIDUALTIME === 0) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
};

//TO DO: put -> close riddle, decrement riddle residualTime

module.exports = { checkResidualTime, decrementResidualTime, getUser, getOpenRiddles, getClosedRiddles, getMyOpenRiddles, getMyClosedRiddles, getResponses, getUserRanking, postRiddle, postResponse, checkExistingResponse, closeRiddle, getCorrectResponseAndDifficulty, putScore, getUserInfo }