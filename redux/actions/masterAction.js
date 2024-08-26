import { isArray } from "lodash";
import Api from "../../util/Api";
import GetIntlMessages from '../../util/GetIntlMessages';

const getBusinessTypes = async () => {
    const { data } = await Api.get(`/master/businessType?sort=order_by&order=desc&status=default`);
    return data.data
}
const getNametitle = async () => {
    const { data } = await Api.get(`/master/nameTitle?sort=order_by&order=desc&status=default`);
    return data.data
}
const getDocumentTypeGroup = async () => {
    const { data } = await Api.get(`/master/documentTypeGroup?sort=code_id&order=desc&status=default`);
    return data.data
}
const getDocumentTypes = async () => {
    const { data } = await Api.get(`/master/documentTypes?sort=code_id&order=asc&status=active`);
    return data.data
}
const getBankNameList = async () => {
    const { data } = await Api.get(`/master/bankNameList?sort=code_id&order=desc&status=active`);
    return data.data
}
const getBankTaxTypes = async () => {
    const { data } = await Api.get(`/master/taxTypes?sort=code_id&order=asc`);
    return data.data
}
const getProductPurchaseUnitTypes = async () => {
    const { data } = await Api.get(`/master/productPurchaseUnitTypes?sort=code_id&order=asc&status=active`);
    return data.data
}
const getVehicleType = async () => {
    const { data } = await Api.get(`/master/vehicleType?sort=type_name.th&order=asc&status=active`);
    return data.data
}
const getVehicleBrand = async () => {
    const { data } = await Api.get(`/master/vehicleBrand?sort=brand_name.th&order=asc&status=active`);
    return data.data
}
const getVehicleModelType = async () => {
    const { data } = await Api.get(`/master/vehicleModelType?sort=model_name.th&order=asc&status=active`);
    return data.data
}
const getVehicleColors = async () => {
    const { data } = await Api.get(`/master/vehicleColor?sort=vehicle_color_name.th&order=desc&status=active`);
    return data.status === "success" ? data.data ?? [] : []
}
const getDepartments = async () => {
    const { data } = await Api.get(`/master/departments?sort=code_id&order=asc&status=active`);
    return data.data
}
const getRegion = async () => {
    const { data } = await Api.get(`/master/region?sort=reg_code&order=asc&status=active`);
    return data.data
}
const getProductBrand = async () => {
    const { data } = await Api.get(`/productBrand?sort=code_id&order=asc`);
    return data.data
}
const getProductTypeGroup = async () => {
    const { data } = await Api.get(`/productTypeGroup?sort=code_id&order=asc`);
    return data.data
}
const getProductType = async () => {
    const { data } = await Api.get(`/productType?sort=code_id&order=asc&status=active`);
    return data.status === "success" ? data.data.data ??[] : []
}
const getProductModelType = async () => {
    const { data } = await Api.get(`/productModelType?sort=code_id&order=asc`);
    return data.data
}
const getProductCompleteSize = async () => {
    const { data } = await Api.get(`/productCompleteSize?sort=code_id&order=asc`);
    return data.data
}
const getProvince = async () => {
    const { data } = await Api.get(`/master/province?sort=prov_name_th&order=asc`);
    return data.data
}
const getShopInCorporate = async () => {
    const { data } = await Api.get(`/shopsProfiles/all?byHq=true&limit=10000`);
    return data.data.data
}

const getPaymentStatus = async () => {
    const data = [
        {
            key: GetIntlMessages("cancel-payment"),
            value: "0",
        },
        {
            key: GetIntlMessages("not-paid"),
            value: "1",
        },
        {
            key: GetIntlMessages("overdue"),
            value: "2",
        },
        {
            key: GetIntlMessages("paid"),
            value: "3",
        },
        {
            key: GetIntlMessages("overpay"),
            value: "4",
        },
        {
            key: GetIntlMessages("debt"),
            value: "5",
        },
    ]
    return data
}


export const getAllMasterData = async (dispatch) => {
    try {
        const [
          BusinessTypes,
          Nametitle,
          DocumentTypeGroup,
          DocumentTypes,
          bankNameList,
          TaxTypes,
          ProductPurchaseUnitTypes,
          VehicleType,
          VehicleBrand,
          VehicleModelType,
          VehicleColors,
          Departments,
          Region,
          ProductBrand,
          ProductTypeGroup,
          ProductType,
          ProductModelType,
          ProductCompleteSize,
          Province,
          ShopInCorporate,
          PaymentStatus
        ] = await Promise.all([
          getBusinessTypes(),
          getNametitle(),
          getDocumentTypeGroup(),
          getDocumentTypes(),
          getBankNameList(),
          getBankTaxTypes(),
          getProductPurchaseUnitTypes(),
          getVehicleType(),
          getVehicleBrand(),
          getVehicleModelType(),
          getVehicleColors(),
          getDepartments(),
          getRegion(),
          getProductBrand(),
          getProductTypeGroup(),
          getProductType(),
          getProductModelType(),
          getProductCompleteSize(),
          getProvince(),
          getShopInCorporate(),
          getPaymentStatus()
        ]);
        if (isArray(BusinessTypes)) dispatch(setMasterDataBusinessType(BusinessTypes))
        if (isArray(Nametitle)) dispatch(setMasterDataNameTitle(Nametitle))
        if (isArray(DocumentTypeGroup)) dispatch(setMasterDataDocumentTypeGroup(DocumentTypeGroup))
        if (isArray(DocumentTypeGroup)) dispatch(setMasterDataDocumentTypes(DocumentTypes))
        if (isArray(bankNameList)) dispatch(setMasterDataBankNameList(bankNameList))
        if (isArray(TaxTypes)) dispatch(setMasterDataTaxTypes(TaxTypes))
        if (isArray(ProductPurchaseUnitTypes)) dispatch(setMasterDataProductPurchaseUnitTypes(ProductPurchaseUnitTypes))
        if (isArray(VehicleType)) dispatch(setMasterDataVehicleType(VehicleType))
        if (isArray(VehicleBrand)) dispatch(setMasterDataVehicleBrand(VehicleBrand))
        if (isArray(VehicleModelType)) dispatch(setMasterDataVehicleModelType(VehicleModelType))
        if (isArray(VehicleColors)) dispatch(setMasterDataVehicleColors(VehicleColors))
        if (isArray(Departments)) dispatch(setMasterDataDepartments(Departments))
        if (isArray(Region)) dispatch(setMasterDataRegion(Region))
        if (isArray(ProductBrand)) dispatch(setMasterDataProductBrand(ProductBrand))
        if (isArray(ProductTypeGroup)) dispatch(setMasterDataProductTypeGroup(ProductTypeGroup))
        if (isArray(ProductType)) dispatch(setMasterDataProductType(ProductType))
        if (isArray(ProductModelType)) dispatch(setMasterDataProductModelType(ProductModelType))
        if (isArray(ProductCompleteSize)) dispatch(setMasterDataProductCompleteSize(ProductCompleteSize))
        if (isArray(Province)) dispatch(setMasterDataProvince(Province))
        if (isArray(ShopInCorporate)) dispatch(setMasterDataShopInCorporate(ShopInCorporate))
        if (isArray(PaymentStatus)) dispatch(setMasterDataPaymentStatus(PaymentStatus))
    } catch (error) {
        console.log('error', error)
    }
}

export const setMasterDataBusinessType = (data) => {
    return {
        type: "SET_MASTER_DATA_BUSINESS_TYPE",
        payload: data,
    }
};
export const setMasterDataNameTitle = (data) => {
    return {
        type: "SET_MASTER_DATA_NAME_TITLE",
        payload: data,
    }
};
export const setMasterDataDocumentTypeGroup = (data) => {
    return {
        type: "SET_MASTER_DATA_DOCUMENT_TYPE_GROUP",
        payload: data,
    }
};
export const setMasterDataDocumentTypes = (data) => {
    return {
        type: "SET_MASTER_DATA_DOCUMENT_TYPES",
        payload: data,
    }
};
export const setMasterDataBankNameList = (data) => {
    return {
        type: "SET_MASTER_DATA_BANK_NAME_LIST",
        payload: data,
    }
};
export const setMasterDataTaxTypes = (data) => {
    return {
        type: "SET_MASTER_DATA_TAX_TYPES",
        payload: data,
    }
};
export const setMasterDataProductPurchaseUnitTypes = (data) => {
    return {
        type: "SET_MASTER_DATA_PRODUCT_PURCHASE_UNIT_TYPES",
        payload: data,
    }
};
export const setMasterDataVehicleType = (data) => {
    return {
        type: "SET_MASTER_DATA_VEHICLE_TYPE",
        payload: data,
    }
};
export const setMasterDataVehicleBrand = (data) => {
    return {
        type: "SET_MASTER_DATA_VEHICLE_BRAND",
        payload: data,
    }
};
export const setMasterDataVehicleModelType = (data) => {
    return {
        type: "SET_MASTER_DATA_VEHICLE_MODEL_TYPE",
        payload: data,
    }
};
export const setMasterDataVehicleColors = (data) => {
    return {
        type: "SET_MASTER_DATA_VEHICLE_COLORS",
        payload: data,
    }
};
export const setMasterDataDepartments = (data) => {
    return {
        type: "SET_MASTER_DATA_DEPARTMENTS",
        payload: data,
    }
};
export const setMasterDataRegion = (data) => {
    return {
        type: "SET_MASTER_DATA_REGINO",
        payload: data,
    }
};
export const setMasterDataProductBrand = (data) => {
    return {
        type: "SET_MASTER_DATA_PRODUCT_BRAND",
        payload: data,
    }
};
export const setMasterDataProductTypeGroup = (data) => {
    return {
        type: "SET_MASTER_DATA_PRODUCT_TYPE_GROUP",
        payload: data,
    }
};
export const setMasterDataProductType = (data) => {
    return {
        type: "SET_MASTER_DATA_PRODUCT_TYPE",
        payload: data,
    }
};
export const setMasterDataProductModelType = (data) => {
    return {
        type: "SET_MASTER_DATA_PRODUCT_MODEL_TYPE",
        payload: data,
    }
};
export const setMasterDataProductCompleteSize = (data) => {
    return {
        type: "SET_MASTER_DATA_PRODUCT_COMPLETE_SIZE",
        payload: data,
    }
};
export const setMasterDataProvince = (data) => {
    return {
        type: "SET_MASTER_DATA_PROVINCE",
        payload: data,
    }
};
export const setMasterDataShopInCorporate = (data) => {
    return {
        type: "SET_MASTER_DATA_SHOP_IN_CORPORATE",
        payload: data,
    }
};
export const setMasterDataPaymentStatus = (data) => {
    return {
        type: "SET_MASTER_DATA_PAYMENT_STATUS",
        payload: data,
    }
};


