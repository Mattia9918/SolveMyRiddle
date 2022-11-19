import { useEffect } from "react";

function PageNotFound(props) {

    /**
     * useEffect used for rehydrating at least the user ranking in the aside
     * even if the path isn't correct
     * - only first hydration
     */
    useEffect(() => {
        props.loadRanking();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <br />
            <center><h1>Page not found!</h1></center>
        </>
    );
};

export default PageNotFound;