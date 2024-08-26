import React from "react";
import dynamic from "next/dynamic";
import Page from "../../../components/Hoc/securedPage";
import Preloader from "../../../components/_App/Preloader";
import { Card } from 'antd';
import Head from "next/head";
import GetHeadTitlePermission from "../../../util/GetHeadTitlePermission";
import { useSelector } from "react-redux";
const ProductTypeGroup = dynamic(() => import("../../../routes/Admin/MasterLookUp/ProductTypeGroup"), { loading: () => <Preloader /> });

export default Page(() => (
    <React.Fragment>
        <Head>
            <title>{GetHeadTitlePermission(useSelector)}</title>
        </Head>
        <React.Fragment>
            <Card className="mb-5">
                <ProductTypeGroup />
            </Card>
        </React.Fragment>
    </React.Fragment>
));