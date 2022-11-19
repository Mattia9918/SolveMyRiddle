function Response(id, text, userId, userUsername, riddleId){
    this.id = id;
    this.text = text;
    this.userId = userId;
    this.userUsername = userUsername;
    this.riddleId = riddleId;
};

exports.Response = Response;