import { useState } from "react";
import { Dropdown } from "react-bootstrap";
import UserInfo from "./UserInfo";
import AppNotification from "./AppNotification";
import { useDispatch, useSelector } from "react-redux";
import languageData from "./LanguageData";
import { setSidebar, switchLanguage } from "../../../../redux/actions/settingsActions";

const LayoutHeader = () => {
    const dispatch = useDispatch();
    const { locale, sidebar } = useSelector(({ settings }) => settings);
    const { authUser } = useSelector(({ auth }) => auth);
    // console.log("authUser", authUser)
    const onClickSwitchLanguage = (language) => {
        if (language) {
            dispatch(switchLanguage(language))
        }
    }

    const handleMenuClick = () => {
        dispatch(setSidebar({
            open: sidebar.secondaryNavOpen ? true : !sidebar.open,
            secondaryNavOpen: false,
        }));
    };

    const toggleFullScreen = () => {
        if (document.fullscreenEnabled) {
            if (!document.fullscreen) document.documentElement.requestFullscreen();
            else document.exitFullscreen();
        }
    };

    return (
        <div className="main-header">
            <div className="logo">
                <img style={{ width: "100%" }} src="/assets/images/csp/csp_logo_ver_2_horizon.svg" alt="" />
                {/* <img src="/assets/images/csp/csp_logo.svg" alt="" /> */}
            </div>

            <div className="menu-toggle" onClick={handleMenuClick}>
                <div />
                <div />
                <div />
            </div>

            <div className="d-none d-lg-flex align-items-center" style={{ fontSize: "1.3rem" }}>

                {authUser?.UsersProfile?.ShopsProfile?.shop_name[locale.locale] ? authUser?.UsersProfile?.ShopsProfile.shop_name.shop_local_name ?
                    `${authUser?.UsersProfile?.ShopsProfile?.shop_name[locale.locale]} (${authUser?.UsersProfile?.ShopsProfile?.shop_name.shop_local_name})`
                    :
                    `${authUser?.UsersProfile?.ShopsProfile?.shop_name[locale.locale]} ` : `Car Service Plateform`}



            </div>

            <div style={{ margin: "auto" }}></div>

            <div className="header-part-right">
                <i
                    className="i-Full-Screen header-icon d-none d-sm-inline-block"
                    data-fullscreen
                    onClick={toggleFullScreen}
                />

                <Dropdown>
                    <Dropdown.Toggle as="span" className="toggle-hidden">
                        <img src={`/assets/images/flags/${locale.icon}.png`} height={25} style={{ cursor: "pointer" }} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <div className="menu-icon-grid">
                            {languageData.map((language) => (
                                <a key={language.icon} onClick={() => onClickSwitchLanguage(language)} className={locale.icon == language.icon ? "active" : ""}> <img src={`/assets/images/flags/${language.icon}.png`} height={25} />{language.name}</a>
                            ))}
                        </div>
                    </Dropdown.Menu>
                </Dropdown>

                {/* <AppNotification /> */}

                <UserInfo />
            </div>
        </div>
    )
}

export default LayoutHeader
