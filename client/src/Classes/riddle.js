function Riddle(id, status, duration, residualTime, difficulty, question, hint1, hint2, correctResponse, userId, userUsername)
{
    this.id = id;
    this.status = status;
    this.duration = duration;
    this.residualTime = residualTime;
    this.difficulty = difficulty;
    this.question = question;
    this.hint1 = hint1;
    this.hint2 = hint2;
    this.correctResponse = correctResponse;
    this.userId = userId;
    this.userUsername = userUsername;
}

exports.Riddle = Riddle;