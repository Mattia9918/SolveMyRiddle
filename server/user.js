'use strict';

function User(id, username, score, classify){
    this.id = id,
    this.username = username,
    this.score = score,
    this.classify = classify
};

exports.User = User;