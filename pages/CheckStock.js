import React from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import Page from "../components/Hoc/securedPage";
import Preloader from "../components/_App/Preloader";
const CheckStock = dynamic(() => import("../routes/CheckStock"), { loading: () => <Preloader /> });

export default Page(() => (
    <React.Fragment>
        <Head>
            <title>CheckStock</title>
        </Head>
        <React.Fragment>
            <CheckStock />
        </React.Fragment>
    </React.Fragment>
));
 