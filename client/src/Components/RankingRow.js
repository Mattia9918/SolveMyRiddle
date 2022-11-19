import { Badge, Row, Col, ListGroup } from "react-bootstrap";

function RankingRow(props) {
 
    /* -- CONSTANTS DEFINITION */
    /**
     * - classify: user property coming from DENSE_RANK() query (column defining the user's position in ranking)
     * classify will be used for defining the badge variant (bg) and the user ranking (3rd column of the rankingrow component)
     */ 
    const rank = props.rankedUser.classify; 
    const myusername = (props.user && props.user.username) || undefined;
    const rankedUsername = props.rankedUser.username;
    const rankedScore = props.rankedUser.score;

    /* -- RENDERING -- */
    return (
        <ListGroup.Item id = "dashboardlist">
            <Row>
                <Col id = {(myusername && myusername === rankedUsername) ? "you" : "normal"}>
                    {rankedUsername}
                </Col>

                <Col className="col-3" id = {(myusername && myusername === rankedUsername) ? "you" : "normal"}>
                    {rankedScore}
                </Col>

                <Col className="col-2 d-none d-xxl-block">
                    <Badge bg={
                        (rank === 1 && "warning") ||
                        (rank === 2 && "secondary") ||
                        (rank === 3 && "danger")}>
                        {
                            (rank === 1 && "1st") ||
                            (rank === 2 && "2nd") ||
                            (rank === 3 && "3rd")
                        }
                    </Badge>
                </Col>

            </Row>
        </ListGroup.Item>

    )
};

export default RankingRow;