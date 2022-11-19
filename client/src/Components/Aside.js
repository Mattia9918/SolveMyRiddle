import { Container, Card, ListGroup, Alert } from "react-bootstrap";
import RankingRow from "./RankingRow";

function Aside(props) {

    /**
     *  
     * -- ASIDE: composed of
     * - Login success message
     * - User details
     * - User ranking
     * 
     * */

    return (
        <Container fluid >
            

            {/* Login success / correct/wrong response alert */}
            {props.message && props.message.msg !== 'Wrong credentials!' &&
                <Alert id = "asidealert" variant={props.message.type} onClose={() => props.writeMessage('')} dismissible>{props.message.msg}</Alert>
            }

            {/* User details container (or anonymous)*/}
            <Card id = "dashboard" className="shadow-sm p-2" body>
                {(props.user &&
                    <UserDetails user={props.user} />) ||
                    <>
                        <b>Anonymous:</b> login to solve the riddles!
                    </>
                }
            </Card>
            

            {/* User ranking component */}
            <UserRanking userRanking={props.userRanking} user={props.user} />
            
        </Container>
    );
};

function UserDetails(props) {
    return (
        <>
            <img id="userpic" src="http://localhost:3000/user.svg" alt="play" />
            <b>Username: </b> {props.user.username}
            <br />
            <img id="scorepic" src="http://localhost:3000/score.svg" alt="play" />
            <b>Score: </b> {props.user.score}
        </>
    )
};


function UserRanking(props) {
    return (
        <Card id = "dashboard" className="shadow-sm p-2" body>
            <h6><center> Best riddle solvers: </center></h6>
            <ListGroup variant="flush">
                {props.userRanking.map((rankedUser) => <RankingRow key={rankedUser.id} rankedUser={rankedUser} user={props.user}/>)}
            </ListGroup>
        </Card>
    )
};

export default Aside;