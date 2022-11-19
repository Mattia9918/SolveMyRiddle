'use strict';

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const dao = require('./dao');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');

/* -- SERVER AND MIDDLEWARE CONFIGURATION */

/* Express server init */
const app = new express();
const port = 3001;

/* Passport setup */
passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await dao.getUser(username, password)
  if (!user)
    return cb(null, false, 'Incorrect username or password.');

  return cb(null, user);
}));

/* Store user informations into sessions (passport) */
passport.serializeUser(function (user, cb) {
  cb(null, user);
});

/* Retrieve user informations from sessions (passport) */
passport.deserializeUser(function (user, cb) { // this user is id + username + score
  return cb(null, user);
});

/* Session middleware configuration */
app.use(session({
  secret: "a1b2c3d4e5f6g7h8i9j0k1",
  resave: false,
  saveUninitialized: false,
}));

/* CORS options allowing cookies exchange */
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};

/* Middlewares */
app.use(express.json());
app.use(morgan('dev'));
app.use(cors(corsOptions));
app.use(passport.authenticate('session'));

/* isLoggedIn middleware definition (route protection)*/
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Not authorized' });
}

/* -- TIMEOUT MANAGEMENT -- RIDDLE RESIDUAL TIME DECREMENT -- */

let riddleList = [];

setInterval(decrementRiddle, 1000);

function pushRiddle(riddleId) {

  let alreadyPushed = riddleList.includes(riddleId);

  if (!alreadyPushed) {
    riddleList.push(riddleId);
  };

};

async function decrementRiddle() {
  riddleList.forEach(async (riddleId) => {
    await dao.decrementResidualTime(riddleId);
    let toClose = await dao.checkResidualTime(riddleId);
    if (toClose) {
      const indexToRemove = riddleList.indexOf(riddleId); //find riddleList index where there's the proper riddleId to remove
      if (indexToRemove != -1) { //if the element is found (and we got the array index)
        riddleList.splice(indexToRemove, 1); //remove 1 element (so the element) on the chosen index
      }
      await dao.closeRiddle(riddleId);
    }
  });
};

/* -- API -- */

/* - APIs not requiring authentication - */

/**
 * Login user authentication
 */
app.post('/api/sessions', passport.authenticate('local'), (req, res) => {
  res.status(201).json(req.user);
});

/**
 * Refresh user info from opened session without relogging in
 */
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  }
  else
    res.status(401).json({ error: 'Not authenticated' });
});

/**
 * Logout (session deleted)
 */
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});

/**
 * Get open riddles:
 * - users will see only the riddles they haven't opened
 * - anonymous will see all the riddles (will receive userId = 0)
 */
app.get('/api/riddles/open', async (req, res) => {
  let userId;
  req.user ? userId = req.user.id : userId = 0;
  try {
    const openRiddles = await dao.getOpenRiddles(userId);
    return res.status(200).json(openRiddles);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

app.get('/api/riddles/closed', async (req, res) => {
  try {
    const closedRiddles = await dao.getClosedRiddles();
    return res.status(200).json(closedRiddles);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

app.get('/api/users/ranking', async (req, res) => {
  try {
    const userRanking = await dao.getUserRanking();
    return res.status(200).json(userRanking);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});


/* - APIs requiring authentication - */
app.use(isLoggedIn);

app.get('/api/riddles/myopen', async (req, res) => {
  const userId = req.user.id;
  try {
    const myOpenRiddles = await dao.getMyOpenRiddles(userId);
    return res.status(200).json(myOpenRiddles);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

app.get('/api/riddles/myclosed', async (req, res) => {
  const userId = req.user.id;
  try {
    const myClosedRiddles = await dao.getMyClosedRiddles(userId);
    return res.status(200).json(myClosedRiddles);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

app.get('/api/riddles/:id/responses', async (req, res) => {
  const riddleId = req.params.id;
  try {
    const responses = await dao.getResponses(riddleId);
    return res.status(200).json(responses);
  } catch (err) {
    return res.status(500).json({ error: err });
  };
});

app.get('/api/riddles/:id/alreadyresponded', async (req, res) => {
  const userId = req.user.id;
  const riddleId = req.params.id;
  try {
    const result = await dao.checkExistingResponse(userId, riddleId);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

app.get('/api/user', async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await dao.getUserInfo(userId);

    /* session storage informations updated */
    req.logIn(user, function (error) {
      if (error) {
        return res.status(500).json({ error: err });
      }
      return res.status(200).json(req.user);
    });

  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

app.post('/api/riddle', async (req, res) => {
  const userId = req.user.id;
  const riddle = req.body;
  try {
    await dao.postRiddle(riddle, userId);
    return res.status(201).end();
  } catch (err) {
    return res.status(503).json({ error: err });
  }
});

app.post('/api/riddles/:riddleId/response', async (req, res) => {
  const userId = req.user.id;
  const riddleId = req.params.riddleId;
  const response = req.body;
  try {
    await dao.postResponse(response, userId, riddleId);
    const [correctResponse, difficulty] = await dao.getCorrectResponseAndDifficulty(riddleId);
    if (response.text === correctResponse) {
      let score;
      switch (difficulty) {
        case "Easy":
          score = 1;
          break;
        case "Average":
          score = 2;
          break;
        case "Difficult":
          score = 3;
          break;
        default:
          score = 0;
          break;
      }
      await dao.putScore(userId, score)
      await dao.closeRiddle(riddleId);
      return res.status(201).json({ msg: "correctresponse" }).end();
    } else {
      pushRiddle(riddleId);
      return res.status(201).json({ msg: "wrongresponse" }).end();
    }
  } catch (err) {
    return res.status(503).json({ error: err });
  }
});


/* -- SERVER ACTIVATION -- */
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
