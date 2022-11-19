import { useState } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { Riddle } from '../Classes/riddle';

function CreateRiddle(props) {

    /* -- CONSTANTS DECLARATION -- */
    const userId = props.user.id;
    const defaultStatus = "OPEN";
    const defaultDuration = 30;
    const defaultDifficulty = "Easy"

    /* -- INPUT STATE MANAGEMENT -- */
    const [question, setQuestion] = useState('');
    const [correctResponse, setCorrectResponse] = useState('');
    const [firstHint, setFirstHint] = useState('');
    const [secondHint, setSecondHint] = useState('');
    const [duration, setDuration] = useState(defaultDuration);
    const [difficulty, setDifficulty] = useState(defaultDifficulty);

    /* -- SUBMIT HANDLER -- */
    const submitHandler = (event) => {
        event.preventDefault();

        const defaultResidualTime = duration;

        const riddle =
            new Riddle(
                undefined,
                defaultStatus,
                duration,
                defaultResidualTime,
                difficulty,
                question,
                firstHint,
                secondHint,
                correctResponse.trim().toLowerCase(),
                userId,
            );

        props.createRiddle(riddle);
        props.hideModals();
    };

    /* -- RENDERING -- */
    return (
        <>
            <Modal show={props.show} onHide={() => props.hideModals()}>

                {/* Modal header */}
                <Modal.Header closeButton>
                    <Modal.Title>Create a new riddle!</Modal.Title>
                </Modal.Header>


                {/* Modal body */}
                <Modal.Body>

                    <Form onSubmit={submitHandler}>

                        <p id = "note"> You have been redirected to "my open riddles" section </p>

                        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                            <Form.Label>Question</Form.Label>
                            <Form.Control
                                as="textarea"
                                placeholder="What riddle are you thinking of? (max 100 words)"
                                value={question}
                                rows={2}
                                maxLength="100"
                                required={true}
                                autoFocus
                                onChange={(event) => setQuestion(event.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                            <Form.Label>Correct response</Form.Label>
                            <Form.Control
                                as="textarea"
                                placeholder="Enter the correct response"
                                value={correctResponse}
                                maxLength="50"
                                rows={1}
                                required={true}
                                onChange={(event) => setCorrectResponse(event.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea2">
                            <Form.Label>First hint</Form.Label>
                            <Form.Control
                                as="textarea"
                                placeholder="Enter a hint for the users"
                                value={firstHint}
                                rows={2}
                                maxLength="50"
                                required={true}
                                onChange={(event) => setFirstHint(event.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea3">
                            <Form.Label>Second hint</Form.Label>
                            <Form.Control
                                as="textarea"
                                placeholder="Enter another hint for the users"
                                value={secondHint}
                                rows={2}
                                maxLength="50"
                                required={true}
                                onChange={(event) => setSecondHint(event.target.value)}
                            />
                        </Form.Group>


                        <Form.Label>Duration and difficulty</Form.Label>
                        <Row className="mb-3">

                            <Col>
                                <Form.Group controlId="exampleForm.ControlInput1">
                                    <Form.Control
                                        type="number"
                                        placeholder="Duration"
                                        value={duration}
                                        min={30}
                                        max={600}
                                        required={true}
                                        onChange={(event) => setDuration(event.target.value)}
                                    />
                                </Form.Group>
                            </Col>

                            <Col>
                                <Form.Select
                                    aria-label="Difficulty"
                                    onChange={(event) => setDifficulty(event.target.value)}>
                                    <option>Easy</option>
                                    <option value="Easy">Easy</option>
                                    <option value="Average">Average</option>
                                    <option value="Difficult">Difficult</option>
                                </Form.Select>
                            </Col>

                        </Row>

                        <Row align="right">
                            <Col>
                                <Button id="modalbtncancel" variant="secondary" onClick={() => props.hideModals()}>
                                    Close
                                </Button>

                                <Button id="modalbtnsubmit" variant="primary" type="submit">
                                    Create
                                </Button>
                            </Col>
                        </Row>

                    </Form>

                </Modal.Body>

            </Modal>

        </>
    );
};

export default CreateRiddle;
