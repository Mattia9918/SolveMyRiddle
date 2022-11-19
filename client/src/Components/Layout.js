import { Outlet } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import Aside from "./Aside";
import Navigation from "./Navigation";


function Layout(props) {
    return (
        <>

            {/* -- LAYOUT STRUCTURE -- */}

            <Row>
                {/* -- NAVIGATION BAR -- */}
                <Navigation show={props.show} hideModals={props.hideModals} showLogin={props.showLogin} showLogout={props.showLogout} showCreate={props.showCreate} createRiddle={props.createRiddle} handleLogin={props.handleLogin} handleLogout={props.handleLogout} message = {props.message} user = {props.user}/>
            </Row>

            <Row>

                {/* -- ASIDE (left)  -- */}
                <Col className="shadow-sm p-2 col-3 d-none d-xl-block" id="aside" >
                    <Aside userRanking={props.userRanking} user={props.user} writeMessage = {props.writeMessage} message = {props.message} />
                </Col>

                {/* -- BODY  -- */}
                <Col id = "body" xl={9} className="d-block">
                    <Outlet />
                </Col>

            </Row>

        </>
    );
};

export default Layout;
