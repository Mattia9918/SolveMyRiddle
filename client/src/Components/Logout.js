import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Logout(props) {

    const navigate = useNavigate();

    /* Rendering */
    return (
        <>
            <Modal show={props.show} onHide={() => props.hideModals()}>

                {/* Modal header */}
                <Modal.Header closeButton>
                    <Modal.Title>Logout</Modal.Title>
                </Modal.Header>

                {/* Modal body */}
                <Modal.Body>Are you sure you want to logout from solveMyRiddle?</Modal.Body>

                {/* Modal footer */}
                <Modal.Footer>
                    
                    <Button variant="secondary" onClick={() => props.hideModals()}>
                        Close
                    </Button>

                    {/* In case of logout, the user is forced to go to the root path */}
                    <Button variant="primary" onClick={() => {
                        props.handleLogout();
                        navigate('/');
                    }}>
                        Logout
                    </Button>
                </Modal.Footer>

            </Modal>
        </>
    );
}


export default Logout;