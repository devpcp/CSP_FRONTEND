import { useEffect, useState } from "react";
import Link from "next/link";
import { classList, isMobile } from "../../../@gull/@utils";
import Srcollbar from "react-perfect-scrollbar";
import DropDownMenu from "./DropDownMenu";

import ScrollBar from "react-perfect-scrollbar";
import { setPathName, setSidebar, updateWindowWidth } from "../../../../redux/actions/settingsActions";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { get } from "lodash";

const LayoutSidenav = () => {

    let windowListener = null;

    const [selectedItem, setSelectedItem] = useState(null)
    const [hoverItem, setHoverItem] = useState(null)
    const [routerPathname, setRouterPathname] = useState("/")
    const dispatch = useDispatch();
    const router = useRouter()

    const { menu, locale, sidebar } = useSelector(({ settings }) => settings);

    useEffect(() => {
        dispatch(setPathName(router.pathname))
        setRouterPathname(router.pathname)

    }, [router.pathname]);

    const onMainItemMouseEnter = (item) => {
        if (item.type === "dropDown") {
            setSelected(item);
            setHoverItem(item);
            openSecSidenav();
        } else {
            setSelected(item);
            setHoverItem(item);
            closeSecSidenav();
        }
    };

    const onMainItemMouseLeave = () => {
        setHoverItem(null)
        // setSelectedItem(null)
        // closeSecSidenav();
    };

    const setSelected = (selectedItem) => {
        setSelectedItem(selectedItem)
        // console.log(selectedItem);
    };

    const removeSelected = () => {
        setSelectedItem(null)
        // console.log('removed');
    };

    const openSecSidenav = () => {
        dispatch(setSidebar({
            ...sidebar,
            secondaryNavOpen: true
        }))
    };

    const closeSecSidenav = () => {
        // console.log("closing sec sidenav", isMobile());
        dispatch(setSidebar({
            open: true,
            secondaryNavOpen: false
        }))
    };

    const closeSidenav = () => {
        // console.log("closing sidenav");
        dispatch(setSidebar({
            open: false,
            secondaryNavOpen: false,
        }));
    };

    const openSidenav = () => {
        // console.log("opening sidenav");
        dispatch(setSidebar({
            ...sidebar,
            open: true,
        }));
    };

    useEffect(() => {
        // console.log('selectedItem', selectedItem)
        if (selectedItem === null) closeSecSidenav();

        if (window) {
            if (window.innerWidth < 1200) {
                // console.log('window.innerWidth 1', window.innerWidth)
                closeSidenav();
            } else {
                openSidenav();
            }
        }
        windowListener = window.addEventListener("resize", ({ target }) => {
            if (window.innerWidth < 1200) {
                // console.log('window.innerWidth 2', window.innerWidth)
                closeSidenav();
            } else {
                openSidenav();
            }
            dispatch(updateWindowWidth(window.innerWidth))
        });
    }, [])

    useEffect(() => {
        if (windowListener) {
            window.removeEventListener("resize", windowListener);
        }
    }, [windowListener])

    const setStyleImg = (itemId) => {
        // {width : "60%" , height : "auto"}
        // "3609a9a2-7dcf-41b6-8bae-156e9b8b2a7d",-> Dashboard
        // "eda30635-d171-4708-94e8-3c9433151698",-> My Data
        // "fac14580-bdfa-4d33-a85c-e0fa99bab763",-> Data Management
        // "bf748a39-f3e1-468b-865a-0599d33d4ec0",-> Connect Data
        // "4ff473c7-d82c-4a07-98aa-cdcfc2e7e82c" -> ตั้งค่าทั่วไป
        // "3f7447fb-a863-4cbf-bb3f-881da8b54a20" -> การจัดการระบบ

        if (itemId === "eda30635-d171-4708-94e8-3c9433151698"
            || itemId === "fac14580-bdfa-4d33-a85c-e0fa99bab763"
            || itemId === "bf748a39-f3e1-468b-865a-0599d33d4ec0"
            || itemId === "4ff473c7-d82c-4a07-98aa-cdcfc2e7e82c"
            || itemId === "3f7447fb-a863-4cbf-bb3f-881da8b54a20") {
            return null
        } else {
            return { width: "40%", height: "auto" }
        }
    }

    return (
        <div className="side-content-wrap">
            <Srcollbar
                className={classList({
                    "sidebar-left o-hidden rtl-ps-none": true,
                    open: sidebar.open,
                })}
            // id="mainsidenav"
            >
                <ul className="navigation-left">
                    {menu.map((item, i) => {

                        if (item.read === 1) {
                            return (
                                <li
                                    className={classList({
                                        "nav-item": true,
                                        active: item?.sub?.find(x => x.path === router.pathname) !== undefined || router.pathname === item.path,
                                        hover: hoverItem === item
                                    })}
                                    onMouseEnter={() => {
                                        onMainItemMouseEnter(item);
                                    }}

                                    onMouseLeave={onMainItemMouseLeave}
                                    key={i}
                                >
                                    {item.path && item.type !== "extLink" && (
                                        <>
                                            <Link href={item.path}>
                                                <a className="nav-item-hold">
                                                    <img style={setStyleImg(item.id)} className="nav-icon" src={`/assets/images/icon/${item.id}.svg`} />
                                                    <span className="nav-text">{item.application_name[locale.locale]}</span>
                                                </a>
                                            </Link>
                                            {/* <div className={`triangle ${routerPathname === item.path ? "selected" : ""}`} /> */}
                                        </>
                                    )}
                                    {!item.path && (
                                        <>
                                            <div className="nav-item-hold" >
                                                <img style={setStyleImg(item.id)} className="nav-icon" src={`/assets/images/icon/${item.id}.svg`} />
                                                <span className="nav-text">{item.application_name[locale.locale]}</span>
                                            </div>
                                            {/* <div className={`triangle`} /> */}
                                        </>
                                    )}
                                    <div className={`triangle`} />
                                </li>
                            )
                        }
                    }
                    )}
                </ul>
            </Srcollbar>

            <ScrollBar
                className={classList({
                    "sidebar-left-secondary o-hidden rtl-ps-none": true,
                    open: sidebar.secondaryNavOpen
                })}
            >
                {selectedItem && selectedItem.sub && (
                    <DropDownMenu
                        menu={selectedItem.sub}
                        closeSecSidenav={closeSecSidenav}
                        locale={locale.locale}
                        router={routerPathname}
                    />
                )}
                <span></span>
            </ScrollBar>
            <div
                onMouseEnter={closeSecSidenav}
                className={classList({
                    "sidebar-overlay": true,
                    open: sidebar.secondaryNavOpen
                })}
            />


            <style jsx global>
                {`
                    .main-content-wrap.sidenav-open {
                        width: ${sidebar.open ? "calc(100% - 120px)" : "100%"} ;
                    }  

                   .layout-sidebar-large .sidebar-left-secondary {
                        width: ${sidebar.open ? "280px" : "220px"};
                    }                  
                `}
            </style>
        </div>
    )
}

export default LayoutSidenav
