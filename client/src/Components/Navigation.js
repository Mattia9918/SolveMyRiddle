import { useNavigate } from 'react-router-dom';
import { Navbar, Container, Nav, NavDropdown, Col } from 'react-bootstrap';
import Login from './Login';
import Logout from './Logout';
import CreateRiddle from './CreateRiddle';

function Navigation(props) {

    const navigate = useNavigate();

    return (
        <>

            {/* -- NAVBAR -- */}

            <Navbar bg="light" expand="lg">
                <Container fluid className="shadow-sm p-2" id="topbar">

                    <Col className="col-3" align="center">
                        {/* Logo and brand */}
                        <Navbar.Brand>
                            <i className="font1">Solve</i>
                            <i className="font2">My</i>
                            <i className="font3">Riddle</i>
                            <img id="pic" src="http://localhost:3000/puzzle.svg" alt="play" />
                        </Navbar.Brand>
                    </Col>

                    {/* Aria controls */}
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />

                    {/* Dropdowns and links */}
                    <Navbar.Collapse id="basic-navbar-nav" >
                        <Nav className="ms-auto">

                            {/* Riddles dropdown */}
                            <NavDropdown title="Riddles" id="basic-nav-dropdown">

                                <NavDropdown.Item onClick={() => {
                                    navigate("/open");
                                }}> Open
                                </NavDropdown.Item>


                                <NavDropdown.Item onClick={() => {
                                    navigate("/closed");
                                }}>Closed
                                </NavDropdown.Item>

                            </NavDropdown>

                            {/* MyRiddles dropdown */}
                            {props.user &&
                                <NavDropdown title="My Riddles" id="basic-nav-dropdown">

                                    <NavDropdown.Item onClick={() => {
                                        navigate("/myopen");
                                    }}> My open riddles
                                    </NavDropdown.Item>

                                    <NavDropdown.Item onClick={() => {
                                        navigate("/myclosed");
                                    }}> My closed riddles
                                    </NavDropdown.Item>

                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={() => {
                                        navigate("/myopen");
                                        props.showCreate();
                                    }}>Create new riddle</NavDropdown.Item>
                                </NavDropdown>
                            }

                            {/* Login/Logout link */}
                            <Nav.Link onClick={() => {
                                if (props.user)
                                    props.showLogout();
                                else
                                    props.showLogin();
                            }}>{(props.user && "Logout") || "Login"}

                            </Nav.Link>

                        </Nav>
                    </Navbar.Collapse>

                </Container>
            </Navbar>


            {/* -- LOGIN MODAL -- */}
            {props.show === "login" && <Login show={props.show} hideModals={props.hideModals} handleLogin={props.handleLogin} message={props.message} />}

            {/* -- LOGOUT MODAL -- */}
            {props.show === "logout" && <Logout show={props.show} hideModals={props.hideModals} handleLogout={props.handleLogout} />}

            {/* -- CREATE NEW RIDDLE MODAL -- */}
            {props.show === "create" && <CreateRiddle show={props.show} hideModals={props.hideModals} createRiddle={props.createRiddle} user={props.user} />}

        </>
    );
};

export default Navigation;