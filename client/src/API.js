import { User } from './Classes/user';
import { Riddle } from './Classes/riddle';
import { Response } from './Classes/response';

const APIURL = 'http://localhost:3001/api/'

/**
 * LOGIN FUNCTION
 * Returns the user that will fill the user state at login time  
 */
async function logIn(credentials) {
    const response = await fetch(APIURL + 'sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
    });
    if (response.ok) {
        const user = await response.json();
        return user;
    }
    else {
        /* Application error */
        const appErrText = await response.text();
        throw appErrText;
    }
};

/**
 * GETUSERINFO:
 * Refreshes the user informations (filling the user state)
 */
const getUserInfo = async () => {
    const response = await fetch(APIURL + 'sessions/current', {
      credentials: 'include',
    });
    const user = await response.json();
    if (response.ok) {
      return user;
    } else {
      throw user;  // an object with the error coming from the server
    }
  };

/**
 * LOGOUT METHOD 
 */
async function logOut() {
    const response = await fetch(APIURL + 'sessions/current', {
        method: 'DELETE',
        credentials: 'include'
    });
    if (response.ok)
        return null;
};

/**
 * GETRIDDLES:
 * Calls the proper API to get the riddles in function of their status (open, closed)
 */
async function getRiddles(status) {
    let url;

    switch (status) {

        case "open":
            url = APIURL + 'riddles/open';
            break;

        case "closed":
            url = APIURL + 'riddles/closed';
            break;

        default:
            url = APIURL + 'riddles/open';
            break;
    }
    try {
        const response = await fetch(url, {
            credentials: 'include',
        });
        if (response.ok) {
            const list = await response.json();
            const riddleList = list.map((riddle) =>
                new Riddle(
                    riddle.id,
                    riddle.status,
                    riddle.duration,
                    riddle.residualTime,
                    riddle.difficulty,
                    riddle.question,
                    riddle.hint1,
                    riddle.hint2,
                    riddle.correctResponse,
                    riddle.userId,
                    riddle.userUsername
                ));
            return riddleList;
        } else {
            /* Application error */
            const appErrText = await response.text();
            throw new TypeError(appErrText);
        }
    } catch (err) {
        /* Network error */
        throw (err);
    }
};

/**
 * GETMYRIDDLES:
 * Calls the proper API to get "my" riddles in function of their status (open, closed)
 */
async function getMyRiddles(status) {
    let url;

    switch (status) {

        case "open":
            url = APIURL + 'riddles/myopen';
            break;

        case "closed":
            url = APIURL + 'riddles/myclosed';
            break;

        default:
            url = APIURL + 'riddles/myopen';
            break;
    }
    try {
        const response = await fetch(url, {
            credentials: 'include',
        });
        if (response.ok) {
            const list = await response.json();
            const riddleList = list.map((riddle) =>
                new Riddle(
                    riddle.id,
                    riddle.status,
                    riddle.duration,
                    riddle.residualTime,
                    riddle.difficulty,
                    riddle.question,
                    riddle.hint1,
                    riddle.hint2,
                    riddle.correctResponse,
                    riddle.userId,
                    riddle.userUsername
                ));
            return riddleList;
        } else {
            /* Application error */
            const appErrText = await response.text();
            throw new TypeError(appErrText);
        }
    } catch (err) {
        /* Network error */
        throw (err);
    }
};

/**
 * POST RIDDLE: 
 * Receives a riddle object in input and calls the riddle post API
 */
async function postRiddle(riddle) {
    const url = APIURL + `riddle`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(riddle),
        });

        if (response.ok) {
            return true;

        } else {
            /* Application error */
            const appErrText = await response.text();
            throw new TypeError(appErrText);
        }

    } catch (err) {
        /* Network error */
        throw (err);
    }
};

/**
 * GETRANKING:
 * Calls the server-side API that will perform a dense rank of the users, ordered by their score
 * Their position in the ranking (that is a list of users) is saved as "classify" into the user object
 */
async function getRanking() {
    const url = APIURL + 'users/ranking';
    try {
        const response = await fetch(url, {
            credentials: 'include',
        });
        if (response.ok) {
            const list = await response.json();
            const userRanking = list.map((user) =>
                new User(
                    user.id,
                    user.username,
                    user.score,
                    user.classify
                )
            );
            return userRanking;
        } else {
            /* Application error */
            const appErrText = await response.text();
            throw new TypeError(appErrText);
        }

    } catch (err) {
        /* Network error */
        throw (err);
    }
};

/**
 * GETUPDATEDUSERINFO:
 * Refreshes the user informations (score included, this API is used whenever a user solves a riddle to update
 * the user's dashboard in the aside)
 */
async function getUpdatedUserInfo() {
    const url = APIURL + 'user';
    try {
        const response = await fetch(url, {
            credentials: 'include',
        });
        if (response.ok) {
            const user = await response.json();
            return user;
        } else {
            /* Application error */
            const appErrText = await response.text();
            throw new TypeError(appErrText);
        }
    } catch (err) {
        /* Network error */
        throw (err);
    }
};

/**
 * GETALREADYRESPONDED:
 * Calls a server-side API checking if the current user has already responded to the specific riddle
 * whose id is passed as parameter. Returns true if the user has already responded (false otherwise).
 */
async function getAlreadyResponded(riddleId) {
    const url = APIURL + `riddles/${riddleId}/alreadyresponded`;
    try {
        const response = await fetch(url, {
            credentials: 'include',
        });
        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            /* Application error */
            const appErrText = await response.text();
            throw new TypeError(appErrText);
        }

    } catch (err) {
        /* Network error */
        throw (err);
    }
};

/**
 * GETRESPONSES:
 * Calls a server-side API, returning the list of responses associated to a specific riddle
 * Each response will be mapped to a response object, so the result is an array of responses that
 * will fill the response state at the app.js level.
 */
async function getResponses(riddleId) {
    const url = APIURL + `riddles/${riddleId}/responses`;
    try {
        const response = await fetch(url, {
            credentials: 'include',
        });
        if (response.ok) {
            const list = await response.json();
            const responses = list.map((resp) =>
                new Response(
                    resp.id,
                    resp.text,
                    resp.userId,
                    resp.userUsername,
                    resp.riddleId,
                )
            );
            return responses;
        } else {
            /* Application error */
            const appErrText = await response.text();
            throw new TypeError(appErrText);
        }

    } catch (err) {
        /* Network error */
        throw (err);
    }
};

/**
 * POSTRESPONSE:
 * Calls an API that loads the response passed as parameter (and performs other checks)
 */
async function postResponse(resp) {
    const url = APIURL + `riddles/${resp.riddleId}/response`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(resp),
        });

        if (response.ok) {
            const result = await response.json();
            return result;

        } else {
            /* Application error */
            const appErrText = await response.text();
            throw new TypeError(appErrText);
        }

    } catch (err) {
        /* Network error */
        throw (err);
    }
};

const API = { getRiddles, getMyRiddles, postRiddle, getRanking, logIn, getUserInfo, logOut, postResponse, getAlreadyResponded, getResponses, getUpdatedUserInfo };
export default API;