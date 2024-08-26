import React from "react";
import { ConfigProvider, Layout } from "antd";
import { IntlProvider } from 'react-intl';
import { useSelector } from "react-redux";

import LayoutHeader from "./LayoutHeader";
import LayoutSidenav from "./LayoutSidenav";
import { classList } from "../../@gull/@utils";

import AppLocale from "../../../lngProvider";

const LayoutPage = ({ children }) => {
    const { locale } = useSelector(({ settings }) => settings)
    const currentAppLocale = AppLocale[locale.locale];

    return (
        <ConfigProvider locale={currentAppLocale.antd}>
            <IntlProvider
                locale={currentAppLocale.locale}
                messages={currentAppLocale.messages}
            >
                <div>
                    <div className={`app-admin-wrap layout-sidebar-large`}>
                        <LayoutHeader />

                        <LayoutSidenav />
                    
                        <div
                            className={classList({
                                "main-content-wrap d-flex flex-column": true,
                                "sidenav-open": true,
                            })}
                        >

                            <div className="main-content">

                                {children}

                            </div>

                            {/* {true && <Footer />} */}
                        </div>
                    </div>
                </div >
            </IntlProvider>
        </ConfigProvider>
    )
}

export default LayoutPage

