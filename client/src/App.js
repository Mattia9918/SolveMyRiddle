import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import Layout from './Components/Layout';
import RiddleLayout from './Components/RiddleLayout';
import API from './API';
import PageNotFound from './Components/PageNotFound';

function App() {

  /* --- STATES --- */
  const [user, setUser] = useState();                   /* Logged-in user informations: "undefined" means anonymous user, otherwise the user is logged-in */
  const [riddles, setRiddles] = useState([]);           /* Array containing the list of riddles */
  const [userRanking, setUserRanking] = useState([]);   /* Array containing top 3 users according to their score */
  const [message, setMessage] = useState('');           /* Filled with the login messages (success or error) or response result (correct / wrong) */
  const [errMessage, setErrMessage] = useState('');     /* Filled with the error messages coming from the server-side API */
  const [show, setShow] = useState("hide");             /* Login/Logout modal and create new riddle modal. Possible values: "login", "logout", "create", "hide" (no modal to show) */
  const [responses, setResponses] = useState([]);       /* Array containing the list of responses */
  const [timeUpdate, setTimeUpdate] = useState(false);  /* Assumes alternatively values true/false (every 1000ms) to trigger a use effect calling a riddle update / response update every second */

  /* -- STATE UPDATE FUNCTIONS -- */

  /* -- Modal state management */

  /* Modals closed */
  function hideModals() {
    setShow("hide");
  };

  /* Login modal open */
  function showLogin() {
    setShow("login");
  };

  /* Logout modal open */
  function showLogout() {
    setShow("logout");
  };

  /*  Create modal open */
  function showCreate() {
    setShow("create");
  };

  /* Switches timeUpdate value (true/false) every 1000ms */
  function switchTimeUpdate() {
    setTimeout(() => { setTimeUpdate(!timeUpdate) }, 1000);
  };

  /* Updates a message (will be shown in the aside) */
  function writeMessage(message) {
    setMessage(message);
  };

  /* --- API INTERFACES --- */

  /**
   * Function handling the user login:
   * - a correctly logged-in user fills the user state with its informations
   * - sets the login message in case of success (will be shown in the user dashboard) / error (will be shown on the login modal)
   * - only in case of successful login hides the login modal
   */
  async function handleLogin(credentials) {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setMessage({ msg: `Welcome, ${user.username}!`, type: 'success'});
      hideModals();
    } catch (err) {
      setMessage({ msg: 'Wrong credentials!', type: 'danger' });
    }
  };

  /**
   * User info refreshed in case of existing session 
   */
  useEffect(() => {
    const checkAuth = async () => {
      const user = await API.getUserInfo();
      setUser(user);
    };
    checkAuth();
  }, []);

  /**
   * Function handling the logout and cleaning specific state variables
   */
  async function handleLogout() {
    await API.logOut();
    setUser();
    setMessage('');
    setErrMessage('');
    setShow('hide');
    setResponses([]);
  };

  /**
   * Load open riddles (and refreshes the userRanking)
   * - In case of error (unauthorized access, failed to fetch etc...) the error is loaded in the errMessage state
   * - In case of success the errMessage state is cleaned
   * This will be valid also for most of the next functions
   */
  async function loadOpenRiddles() {
    try {
      const riddleList = await API.getRiddles("open");
      setRiddles(riddleList);
      setErrMessage('');
    } catch (err) {
      setErrMessage(String(err));
    }
  };

  /**
   * Load closed riddles (and refreshes the userRanking)
   */
  async function loadClosedRiddles() {
    try {
      const riddleList = await API.getRiddles("closed");
      setRiddles(riddleList);
      setErrMessage('');
    } catch (err) {
      setErrMessage(String(err));
    }
  };

  /**
   * Load my open riddles (and refreshes the userRanking)
   */
  async function loadMyOpenRiddles() {
    try {
      const riddleList = await API.getMyRiddles("open");
      setRiddles(riddleList);
      setErrMessage('');
    } catch (err) {
      setErrMessage(String(err));
    }
  };

  /**
   * Load my closed riddles (same as loadMyOpenRiddles)
   */
  async function loadMyClosedRiddles() {
    try {
      const riddleList = await API.getMyRiddles("closed");
      setRiddles(riddleList);
      setErrMessage('');
    } catch (err) {
      setErrMessage(String(err));
    }
  };

  /**
   * Create new riddle
   */
  async function createRiddle(riddle) {
    try {
      await API.postRiddle(riddle);
      loadMyOpenRiddles();
      setErrMessage('');
    } catch (err) {
      setErrMessage(String(err));
    }
  };

  /**
   * Load user ranking
   */
  async function loadRanking() {
    try {
      const users = await API.getRanking();
      setUserRanking(users);
    } catch (err) {
      throw (err);
    }
  };

  /**
   * Send response to a riddle:
   * In case of "correctresponse" returned by the API:
   * - an update of the user info (score included) is triggered
   * - an immediate update of the open riddles is triggered (the actual riddle wont be present anymore)
   * - the message status is filled with a success message (will be shown in the aside through an alert component)
   * In case of wrong response, the response is normally sent, and the message status is filled with a "wrong response" message 
   * In case of error, the behaviour is similar to that of the previous functions)
   * 
   */
  async function sendResponse(response) {
    try {
      const result = await API.postResponse(response);
      if (result.msg === "correctresponse") {
        const user = await API.getUpdatedUserInfo();
        setUser(user);
        loadOpenRiddles();
        setMessage({msg: "Your response is correct!", type: "info"});
      } else {
        setMessage({msg: "Oh... your answer is wrong. You still need some training!", type: "danger"});
      }
      setErrMessage('');
    } catch (err) {
      setErrMessage(String(err));
    }
  };

  /**
   * Load responses and fills the responses state with the array of responses
   */
  async function loadResponses(riddleId) {
    try {
      const responses = await API.getResponses(riddleId);
      setResponses(responses);
      setErrMessage('');
    } catch (err) {
      setErrMessage(String(err));
    }
  };


  /* --- APP RENDERING --- */
  return (
    <>

      <BrowserRouter>
        <Routes>

          {/* -- Outer layout */}
          <Route element={<Layout
            createRiddle={createRiddle}
            userRanking={userRanking}
            handleLogin={handleLogin}
            handleLogout={handleLogout}
            show={show}
            hideModals={hideModals}
            showLogin={showLogin}
            showLogout={showLogout}
            showCreate={showCreate}
            writeMessage = {writeMessage}
            message = {message}
            user={user}

          />}>

            {/**
             * All the routes will show either:
             * - an alert containing the errMessage (if present) coming from the server-side APIs  
             * - a RiddleLayout component
             * This content will be shown in the "body" of the page (Layout outlet)
             */
            }

            {/* -- RIDDLE TYPE: open (root path) */}
            <Route path='/' element={(errMessage && <Alert variant='danger' >{errMessage}</Alert>) || <RiddleLayout riddles={riddles} loadRiddles={loadOpenRiddles} user={user} type="reply" timeUpdate = {timeUpdate} switchTimeUpdate = {switchTimeUpdate} loadRanking = {loadRanking}/>} />

            {/* -- RIDDLE TYPE: open  */}
            <Route path='/open' element={(errMessage && <Alert variant='danger' > {errMessage} </Alert>) || <RiddleLayout riddles={riddles} loadRiddles={loadOpenRiddles} user={user} type="reply" timeUpdate = {timeUpdate} switchTimeUpdate = {switchTimeUpdate} loadRanking = {loadRanking}/>} />

            {/* -- RIDDLE TYPE: closed */}
            <Route path='/closed' element={(errMessage && <Alert variant='danger' > {errMessage} </Alert>) || <RiddleLayout riddles={riddles} loadRiddles={loadClosedRiddles} user={user} type="responses" mode="closed" loadResponses={loadResponses} responses={responses} loadRanking = {loadRanking}/>} />

            {/* -- RIDDLE TYPE: my open riddles */}
            <Route path='/myopen' element={(errMessage && <Alert variant='danger' > {errMessage} </Alert>) || <RiddleLayout riddles={riddles} loadRiddles={loadMyOpenRiddles} user={user} type="responses" mode="myopen" loadResponses={loadResponses} timeUpdate = {timeUpdate} switchTimeUpdate = {switchTimeUpdate} loadRanking = {loadRanking}/>} />

            {/* -- RIDDLE TYPE: my closed riddles */}
            <Route path='/myclosed' element={(errMessage && <Alert variant='danger' > {errMessage} </Alert>) || <RiddleLayout riddles={riddles} loadRiddles={loadMyClosedRiddles} user={user} type="responses" mode="myclosed" loadResponses={loadResponses} responses={responses} loadRanking = {loadRanking} />} />

            {/* -- RIDDLE TYPE: responses */}
            <Route path='/:modality/responses/:riddleId' element={(errMessage && <Alert variant='danger' > {errMessage} </Alert>) || <RiddleLayout riddles={riddles} loadRiddles={undefined} user={user} type="responses" loadResponses={loadResponses} refreshMyRiddles={loadMyOpenRiddles} responses={responses} timeUpdate = {timeUpdate} switchTimeUpdate = {switchTimeUpdate} loadRanking = {loadRanking} />} />

            {/* -- REPLY RIDDLE */}
            <Route path='/reply/:riddleId' element={(errMessage && <Alert variant='danger' > {errMessage} </Alert>) || <RiddleLayout riddles={riddles} loadRiddles={loadOpenRiddles} user={user} type="reply" mode="reply" sendResponse={sendResponse} timeUpdate = {timeUpdate} switchTimeUpdate = {switchTimeUpdate} loadRanking = {loadRanking} />} />

            {/* -- WRONG PATH: */}
            <Route path='*' element={<PageNotFound loadRanking={loadRanking} />} />

          </Route>

        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
