import PropTypes from "prop-types";
import { useAuthToken, checkingScreen } from "../../util/AppHooks";

const AuthRoutes = ({ children }) => {
    useAuthToken();
    checkingScreen()
    return <>{children}</>;
};

export default AuthRoutes;

AuthRoutes.propTypes = {
    children: PropTypes.node.isRequired
};
