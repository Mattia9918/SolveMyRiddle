import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Container, Card, Button, ListGroup, Col, Row, Form, Badge } from 'react-bootstrap';
import { Response } from '../Classes/response';
import API from '../API';

function RiddleCard(props) {

    /* -- CONSTANTS DEFINITION -- */
    const navigate = useNavigate();                 /* allows navigation to other routes */
    const { modality } = useParams();               /* url param used in the routes where it is possible to see the responses (values: "myclosed", "myopen", "closed") */
    const { riddleId } = useParams();               /* url param used in the routes, associated to an action on a specific riddle card*/
    const difficulty = props.riddle.difficulty;     /* difficulty associated to a riddle */
    const status = props.riddle.status;             /* status associated to a riddle */

    /* -- STATES -- */
    const [responded, setResponded] = useState();   /* responded defines, for each riddle card, if the user has already sent a response (true) or not (false) */


    /* -- FUNCTIONS -- */
    /**
     * checkAlreadyResponded calls the getAlreadyResponded API, checking for existing responses sent by the user
     * on the clicked riddle. For each riddle card, the result of the API (true / false) is set as "responded" state.  
     * 
     */
    async function checkAlreadyResponded(riddleId) {
        try {
            const result = await API.getAlreadyResponded(riddleId);
            setResponded(result);

        } catch (err) {
            throw (err);
        }
    };

    /* -- RENDERING -- */
    return (
        <>
            <Container fluid id="riddlecardcontainer">

                <Card className="shadow-sm p-2">

                    {/* -- CARD HEADER -- */}
                    <Card.Header id={
                        (status === "OPEN" && "opencard") ||
                        (status === "CLOSED" && "closedcard")
                    }>
                        <Row>

                            {/* Author's username is not taken by the getRiddles API in case of "my" riddles (open/closed) */}
                            <Col xxl={10} xl={9} lg={9} md={8} sm={6} xs={6}>
                                <b>Posted by: </b>  {(props.riddle.userUsername && <>{props.riddle.userUsername}</>) || "you"}
                            </Col>

                            <Col className="d-none d-lg-block" align="right">
                                <Badge bg={
                                    (status === "OPEN" && "success") ||
                                    (status === "CLOSED" && "danger")}>
                                    {props.riddle.status}
                                </Badge>
                            </Col>

                            <Col align="right">
                                <Badge bg={
                                    (difficulty === "Easy" && "success") ||
                                    (difficulty === "Average" && "warning") ||
                                    (difficulty === "Difficult" && "danger")}>
                                    {props.riddle.difficulty}
                                </Badge>
                            </Col>

                        </Row>
                    </Card.Header>


                    {/* -- CARD BODY -- */}
                    <Card.Body>

                        <Row>

                            <Col xxl={11} xl={10} lg={10} md={9} sm={8} xs={7}>
                                <Card.Title id="cardtitle">{props.riddle.question}</Card.Title>
                            </Col>

                            <Col className align="right">
                                {status === "OPEN" &&
                                    <Card id="timer">
                                        <h5>{props.riddle.residualTime}</h5>
                                    </Card>}
                            </Col>

                        </Row>
                    </Card.Body>



                    <ListGroup variant="flush">

                        {props.riddle.residualTime <= props.riddle.duration * 0.5 &&
                            <ListGroup.Item><b>Hint 1: </b>{props.riddle.hint1}</ListGroup.Item>}

                        {props.riddle.residualTime <= props.riddle.duration * 0.25 &&
                            <ListGroup.Item><b>Hint 2: </b>{props.riddle.hint2}</ListGroup.Item>}

                        {/* A not logged-in user cannot see the the correct response, but only the list group item (if in the proper section) with a standard message */}
                        {(props.mode === "closed" || props.mode === "myclosed" || modality === "myclosed" || modality === "closed") &&
                            <ListGroup.Item>{(props.user && <><b>Correct response: </b> {props.riddle.correctResponse}</>) || "Login to see the correct response!"}</ListGroup.Item>}

                    </ListGroup>

                    {/* If card type is "reply":
                        - if the riddleId taken by the URL is equal to the card riddle.id, the user has clicked on the reply button, and the response form is shown
                        - otherwise the reply button is shown and enabled, only if the user is logged-in 
                        -- BUTTON ON CLICK: --
                        -  check on the riddle to which the user wants to add a reply, to see if it already contains a response sent by the user
                        -  navigate on the proper reply path 
                    */}
                    {(props.type === "reply") &&
                        <Card.Body>
                            {/*eslint-disable-next-line*/}
                            {riddleId == props.riddle.id ?
                                <ResponseForm riddle={props.riddle} user={props.user} sendResponse={props.sendResponse} responded={responded} setResponded={setResponded} /> :
                                <Button variant="primary" onClick={() => {
                                    checkAlreadyResponded(props.riddle.id)
                                    navigate(`/reply/${props.riddle.id}`)
                                }} disabled={props.user ? false : true}>{props.user ? "Reply" : "Login to reply"}</Button>
                            }
                        </Card.Body>
                    }


                    {/* If the card type is "responses" and the riddleId in the url is different by the card riddle.id 
                        a button (See responses) is shown at the bottom of the riddle card
                        -- BUTTON ON CLICK: --
                        - call to loadResponses(id of the clicked riddle card) that updates the responses state in App.js
                        - if modality is defined (i.e the user is already seeing closed/myopen/myclosed responses) the user can be able to switch to another response list of the same category
                        - if modality is undefined (i.e. the user is just in a closed/myclosed/myopen section) the user can be able to open the list of responses
                    */}
                    {/*eslint-disable-next-line*/}
                    {(props.type === "responses") && (riddleId != props.riddle.id) &&
                        <Card.Body>
                            <Button variant="primary" disabled={props.user ? false : true} onClick={() => {
                                props.loadResponses(props.riddle.id);
                                modality ?
                                    navigate(`/${modality}/responses/${props.riddle.id}`) :
                                    navigate(`/${props.mode}/responses/${props.riddle.id}`)

                            }} >{props.user ? "See responses" : "Login to see responses"}</Button>
                        </Card.Body>
                    }


                </Card>
            </Container >



            {/* -- RESPONSES LIST (CARD AND ITEMS) -- */}
            {/*eslint-disable-next-line*/}
            {props.type === "responses" && riddleId == props.riddle.id &&
                <Container>
                    <Card className="shadow-sm p-2" id="responses">

                        <Card.Header>
                            <Row>
                                <Col md={3} sm={4} xs={5}>
                                    <b>Username:</b>
                                </Col>
                                <Col>
                                    <b>Response:</b>
                                </Col>
                            </Row>
                        </Card.Header>


                        {/**
                         * For each response in the responses state that has been updated due to the onClick on "see responses", a 
                         * a ResponseList component (i.e. listgroup item) is generated  
                         */}
                        <ListGroup variant="flush">
                            <>
                                {(props.responses.length === 0 && <i id="emptyresponselist">Still no response to show</i>) ||
                                    props.responses.map((response) => <ResponsesList key={response.id} response={response} riddle={props.riddle} />)
                                }
                            </>
                        </ListGroup>


                        {/**
                         *  Close button
                         *  -- BUTTON ON CLICK --
                         *  - The current url modality is taken, and the user goes back to the same section (without seeing any response)
                         */}
                        <Card.Body>
                            < Button variant="secondary" onClick={() =>
                                navigate(`/${modality}`)
                            }>
                                Close responses
                            </Button>

                        </Card.Body>
                    </Card>

                </Container>
            }
        </>

    );
};


function ResponseForm(props) {

    /* -- COSTANTS DEFINITION -- */
    const navigate = useNavigate();

    /* -- STATES -- */
    const [response, setResponse] = useState('');

    /* -- SUBMIT HANDLER -- */
    const submitHandler = (event) => {
        event.preventDefault();

        const responseToSend =
            new Response(
                undefined,
                response.trim().toLowerCase(),
                props.user.id,
                props.user.username,
                props.riddle.id
            );


        props.sendResponse(responseToSend);
        navigate('/open');
    };

    return (
        <Form onSubmit={submitHandler}>

            {/* If for the specific riddle card, the responded state is true, the input element will be disabled and a message will be
                shown to the user 
            */}
            <Form.Group className="mb-3" controlId="formcontroltext">
                <Form.Label>What do you think is the correct response?</Form.Label>
                <Form.Control
                    type="text"
                    placeholder={props.responded === true ? "You have already sent a response to this riddle" : "Insert your response"}
                    value={response}
                    disabled={props.responded === true ? true : false}
                    onChange={(event) => setResponse(event.target.value)}
                />
            </Form.Group>

            {/* Close button */}
            <Button id="modalbtncancel" variant="secondary" onClick={() => navigate('/open')}>
                Close
            </Button>

            {/* Submit button */}
            <Button
                id="modalbtnsubmit"
                variant="primary"
                type="submit"
                disabled={props.responded === true ? true : false}>
                    
                Send response
            </Button>

        </Form>
    );
};

function ResponsesList(props) {
    return (
        <ListGroup.Item
            id={props.response.text === props.riddle.correctResponse ? "winner" : "normal"}>
            <Row>
                <Col md={3} sm={4} xs={5}>
                    {props.response.userUsername}
                </Col>
                <Col>
                    {props.response.text}
                </Col>
            </Row>
        </ListGroup.Item>

    );
};

export default RiddleCard;