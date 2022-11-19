import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import RiddleCard from './RiddleCard';

function RiddleLayout(props) {

    const { modality } = useParams();
    const { riddleId } = useParams();

    /* -- USER RANKING REHYDRATION -- */
    /**
     * This effect refreshes the userRanking state:
     * - During the first hydration
     * - Whenever the mode prop changes, i.e. whenever I change route (including whenever I send a response to a riddle)
     * - Whenever the user state/prop changes, i.e. whenever I login/logout/update the user (ex. after sending a correct response)
     */

    useEffect(() => {
        props.loadRanking();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.user, props.mode]);



    /* -- RIDDLE LIST REHYDRATION -- */
    /**
     * - According to the route, props.loadRiddles() can call: loadOpenRiddles(), loadClosedRiddles(), loadMyOpenRiddles(), loadMyClosedRiddles()
     * 
     * This effect refreshes the riddle list:
     *      - During the first hydration
     *      - Whenever the user state changes (from anonymous to logged-in user and viceversa)
     *      - Whenever the timeout is switched (every 1000ms only if "type" = "reply" (i.e open riddles))
     *      - Whenever the "mode" changes (mode is the filter associated to the specific route, ex. mode = "closed" if path = "/closed")
     *      - Whenever the riddleId url param changes
     * 
     * The effect refreshes the riddle state every second in case we are in the routes '/open' or '/reply', so type = reply
     * or '/myopen', so mode = myopen.
     * 
     * The effect doesn't refresh the riddle list only in case we are looking to the responses of closed/myclosed riddles, 
     * while in case of responses to myopen riddles (modality = "myopen"), the prop refreshMyRiddles will be used to refresh "my open riddles" every second.
     */

    useEffect(() => {
        
        props.loadRiddles && props.loadRiddles();

        if (props.type === "reply" || props.mode === "myopen") {
            props.switchTimeUpdate();
        }

        if (modality === "myopen") {
            props.refreshMyRiddles();
            props.loadResponses(riddleId);
            props.switchTimeUpdate();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.user, props.timeUpdate, props.mode, riddleId]);




    /* -- RENDERING -- */
    return (
        <>
            {(props.riddles.length === 0 && <h5><br /><center>Nothing to show</center></h5>) ||
                props.riddles.map((riddle) => <RiddleCard
                    key={riddle.id}
                    riddle={riddle}
                    user={props.user}
                    sendResponse={props.sendResponse}
                    mode={props.mode}
                    type={props.type}
                    loadResponses={props.loadResponses}
                    responses={props.responses}
                />)
            }
        </>
    );

};

export default RiddleLayout;