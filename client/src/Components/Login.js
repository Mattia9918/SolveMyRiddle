import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useState } from 'react';

function Login(props) {

  /* -- INPUT STATE MANAGEMENT -- */
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  /* -- SUBMIT HANDLER --  */
  const submitHandler = (event) => {
    event.preventDefault();

    const credentials = {
      username,
      password
    }
    
    props.handleLogin(credentials);
    
  };

  /* -- RENDERING -- */
  return (
        <>
          <Modal show={props.show} onHide={() => props.hideModals()}>

            {/* Modal header */}
            <Modal.Header closeButton>
              <Modal.Title>Login now!</Modal.Title>
            </Modal.Header>


            {/* Modal body */}
            <Modal.Body>

                {/* Error message (conditional) */}
                {props.message &&
                  <Alert variant={props.message.type}>
                      {props.message.msg}
                  </Alert>
                }

              <Form onSubmit={submitHandler}>

                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Username"
                    value={username}
                    required={true}
                    autoFocus
                    onChange={(event) => setUsername(event.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="exampleForm.ControlInput2">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    required={true}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </Form.Group>

                <Row align="right">
                  <Col>
                    <Button id="modalbtncancel" variant="secondary" onClick={() => props.hideModals()}>
                      Close
                    </Button>

                    <Button id="modalbtnsubmit" variant="primary" type="submit">
                      Login
                    </Button>
                  </Col>
                </Row>

              </Form>

            </Modal.Body>
          </Modal>
        </>
  );
};


export default Login;