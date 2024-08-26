import { Modal, Row, Col, Button, Dropdown, Menu, Divider } from "antd";
import { isPlainObject } from "lodash";
import moment from "moment";
// import 'antd/dist/antd.css';
// import 'bootstrap/dist/css/bootstrap.css'

export const Underline = () => {
  return (
    <div className="underline"></div>
  );
}


const Detail = ({ props, ImgLogo, mainColor, locale, authUser, ReportName }) => {

  const {tableData} = props 
  const phoneNumberToArray = (phoneType) => {
    const newArrMoblie = [];
    if (isPlainObject(props.tableData) && phoneType == "mobile") {
      newArrMoblie = Object.values(props.tableData.ShopsProfiles.mobile_no);
      return newArrMoblie ?? [];
    } else if (isPlainObject(props.tableData) && phoneType == "telephone") {
      newArrMoblie = Object.values(props.tableData.ShopsProfiles.tel_no);
      return newArrMoblie ?? [];
    }
    return [];
  };

  //#region  Check Value
  const CheckArray = (val = [], val2 = null) => {
    return val.length ? val[0].ShopSalesTransactionDocRef?.code_id ?? val2 : val2;
  }

  const CheckProps = (val, val2 = null) => {
    return isPlainObject(props.tableData) ? val : val2;
  }

  const CheckValue = (val, val2 = null) => {
    return val ? val[locale.locale] ?? val2 : val2;
  };
  //#endregion
  return (
    <Row>
      <Col span={16}>
        <img style={{ width: "150px", height: "150px" }} src={ImgLogo} />
        {isPlainObject(props.tableData) ? (
          <Row>
            <Col span={24}>
              {CheckValue(props.tableData.ShopsProfiles.shop_name)}
            </Col>
            <Col span={24}>
              {`ที่อยู่ ${CheckValue(props.tableData.ShopsProfiles.address, "-")}
                  ขวง/ตำบล ${CheckValue(props.tableData.ShopsProfiles.District, "-")}
                  เขต/อำเภอ ${CheckValue(props.tableData.ShopsProfiles.District, "-")}
                  จังหวัด ${CheckValue(props.tableData.ShopsProfiles.Province, "-")}
                  รหัสไปรษณีย์ ${CheckValue(props.tableData.ShopsProfiles.SubDistrict, "-")}`}
            </Col>
            <Col span={24}>
              {`เลขประจำตัวผู้เสียภาษี :${CheckValue(props.tableData.ShopsProfiles.tax_code_id, "-")}`}
            </Col>
            <Col span={24}>
              <Row>
                <Col span={8}>
                  โทร :{" "}
                  {phoneNumberToArray("telephone")
                    .map((e, index) => {
                      return e;
                    })
                    .join(",")}
                </Col>
                <Col span={8}>
                  เบอร์มือถือ :{" "}
                  {phoneNumberToArray("mobile")
                    .map((e, index) => {
                      return e;
                    })
                    .join(",")}
                </Col>
              </Row>
            </Col>
            <Underline />
            <Col span={24}>
              ลูกค้า
            </Col>
            <Col span={24}>
              {
                tableData.ShopBusinessCustomers ?
              `ที่อยู่ ${CheckValue(tableData.ShopBusinessCustomers.address, "-")}
                  ขวง/ตำบล ${CheckValue(tableData.ShopBusinessCustomers.District, "-")}
                  เขต/อำเภอ ${CheckValue(tableData.ShopBusinessCustomers.District, "-")}
                  จังหวัด ${CheckValue(tableData.ShopBusinessCustomers.Province, "-")}
                  รหัสไปรษณีย์ ${CheckValue(tableData.ShopBusinessCustomers.SubDistrict, "-")}`
                  : 
                  `ที่อยู่ ${CheckValue(tableData.ShopPersonalCustomers.address, "-")}
                  ขวง/ตำบล ${CheckValue(tableData.ShopPersonalCustomers.District, "-")}
                  เขต/อำเภอ ${CheckValue(tableData.ShopPersonalCustomers.District, "-")}
                  จังหวัด ${CheckValue(tableData.ShopPersonalCustomers.Province, "-")}
                  รหัสไปรษณีย์ ${CheckValue(tableData.ShopPersonalCustomers.SubDistrict, "-")}`
                  }
            </Col>
            <Col span={24}>
              {`เลขประจำตัวผู้เสียภาษี :${CheckValue( tableData.ShopBusinessCustomers ? tableData.ShopBusinessCustomers?.tax_code_id : tableData.ShopPersonalCustomers?.tax_code_id, "-")}`}
            </Col>
          </Row>

        ) : null}
      </Col>
      <Col span={8}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ textAlign: "center", fontSize: "35px", color: mainColor }}>
            {ReportName}
          </div>
          <div style={{ display: "flex", justifyContent: "center", color: mainColor }}>
            ต้นฉบับ
          </div>
        </div>
        <Underline />
        <Row>
          <Col span={8} style={{ color: mainColor }}>
            เลขที่
          </Col>
          <Col span={16}>
            {CheckProps(props.tableData.code_id)}
          </Col>
          <Col span={8} style={{ color: mainColor }}>
            วันที่{" "}
          </Col>
          <Col span={16}>{moment(new Date()).format("DD/MM/YYYY")}</Col>

          <Col span={8} style={{ color: mainColor }}>
            พนักงานขาย
          </Col>
          <Col span={16}>{`${CheckValue(authUser.UsersProfile.fname)} ${CheckValue(authUser.UsersProfile.lname)}`}</Col>

          <Col span={8} style={{ color: mainColor }}>
            อ้างอิง
          </Col>
          <Col span={16}>
            {CheckProps(CheckArray(props.tableData.ShopSalesTransactionOuts))}
            {/* {CheckProps(CheckArray(props.tableData.ShopSalesTransactionOuts))} */}
          </Col>
        </Row>
        <Underline />
        <Row>
          <Col span={8} style={{ color: mainColor }}>
            *ชื่องาน*
          </Col>
          <Col span={16}> *ชุดกล้อง Reolink RLKB-B00B4 (POE)*</Col>
        </Row>
      </Col>
    </Row>
  );
};

export default Detail;
