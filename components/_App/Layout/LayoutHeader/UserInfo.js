import { Dropdown } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { logout } from '../../../../redux/actions/authActions';
import GetIntlMessages from "../../../../util/GetIntlMessages";
import MyProfile from './MyProfile'

const UserInfo = () => {
    const dispatch = useDispatch();
    const { imageProfile } = useSelector(({ auth }) => auth);

    return (
        <div className="user col px-3">
            <Dropdown>
                <Dropdown.Toggle
                    as="span"
                    className="toggle-hidden cursor-pointer"
                >
                    <img
                        src={imageProfile}
                        id="userDropdown"
                        alt=""
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                    />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <MyProfile />
                    <a onClick={() => logout(dispatch)} className="dropdown-item cursor-pointer">
                        {GetIntlMessages('logout')}
                    </a>
                </Dropdown.Menu>
            </Dropdown>
        </div>
    )
};

export default UserInfo;
