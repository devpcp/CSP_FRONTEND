const INIT_STATE = {
    businessType: [],
    nameTitle: [],
    documentTypeGroup: [],
    documentTypes: [],
    bankNameList: [],
    taxTypes: [],
    productPurchaseUnitTypes: [],
    vehicleType:[],
    vehicleBrand:[],
    vehicleModelType:[],
    vehicleColors:[],
    departments:[],
    region:[],
    productBrand:[],
    productTypeGroup:[],
    productType:[],
    productModelType:[],
    productCompleteSize:[],
    province:[],
    shopInCorporate:[],
    paymentStatus:[],
  };
  
  const masterReducer = (state = INIT_STATE, action) => {
    switch (action.type) {
      case "SET_MASTER_DATA_BUSINESS_TYPE": {
        return {
          ...state,
          businessType: action.payload,
        };
      }
      case "SET_MASTER_DATA_NAME_TITLE": {
        return {
          ...state,
          nameTitle: action.payload,
        };
      }
      case "SET_MASTER_DATA_DOCUMENT_TYPE_GROUP": {
        return {
          ...state,
          documentTypeGroup: action.payload,
        };
      }
      case "SET_MASTER_DATA_DOCUMENT_TYPES": {
        return {
          ...state,
          documentTypes: action.payload,
        };
      }
      case "SET_MASTER_DATA_BANK_NAME_LIST": {
        return {
          ...state,
          bankNameList: action.payload,
        };
      }
      case "SET_MASTER_DATA_TAX_TYPES": {
        return {
          ...state,
          taxTypes: action.payload,
        };
      }
      case "SET_MASTER_DATA_PRODUCT_PURCHASE_UNIT_TYPES": {
        return {
          ...state,
          productPurchaseUnitTypes: action.payload,
        };
      }
      case "SET_MASTER_DATA_VEHICLE_TYPE": {
        return {
          ...state,
          vehicleType: action.payload,
        };
      }
      case "SET_MASTER_DATA_VEHICLE_BRAND": {
        return {
          ...state,
          vehicleBrand: action.payload,
        };
      }
      case "SET_MASTER_DATA_VEHICLE_MODEL_TYPE": {
        return {
          ...state,
          vehicleModelType: action.payload,
        };
      }
      case "SET_MASTER_DATA_VEHICLE_COLORS": {
        return {
          ...state,
          vehicleColors: action.payload,
        };
      }
      case "SET_MASTER_DATA_DEPARTMENTS": {
        return {
          ...state,
          departments: action.payload,
        };
      }
      case "SET_MASTER_DATA_REGINO": {
        return {
          ...state,
          region: action.payload,
        };
      }
      case "SET_MASTER_DATA_PRODUCT_BRAND": {
        return {
          ...state,
          productBrand: action.payload,
        };
      }
      case "SET_MASTER_DATA_PRODUCT_TYPE_GROUP": {
        return {
          ...state,
          productTypeGroup: action.payload,
        };
      }
      case "SET_MASTER_DATA_PRODUCT_TYPE": {
        return {
          ...state,
          productType: action.payload,
        };
      }
      case "SET_MASTER_DATA_PRODUCT_MODEL_TYPE": {
        return {
          ...state,
          productModelType: action.payload,
        };
      }
      case "SET_MASTER_DATA_PRODUCT_COMPLETE_SIZE": {
        return {
          ...state,
          productCompleteSize: action.payload,
        };
      }
      case "SET_MASTER_DATA_PROVINCE": {
        return {
          ...state,
          province: action.payload,
        };
      }
      case "SET_MASTER_DATA_SHOP_IN_CORPORATE": {
        return {
          ...state,
          shopInCorporate: action.payload,
        };
      }
      case "SET_MASTER_DATA_PAYMENT_STATUS": {
        return {
          ...state,
          paymentStatus: action.payload,
        };
      }

      default:
        return {
          ...state
        }
    }
  }
  
  export default masterReducer;