module.exports = {
  productionBrowserSourceMaps: true,
  exportPathMap: async function (defaultPathMap, { dev, dir, outDir, distDir, buildId }) {
    return {

      '/Admin/OAuthSetting': { page: '/Admin/OAuthSetting' },
      '/Admin/Permission': { page: '/Admin/Permission' },
      '/Admin/SystemFeature': { page: '/Admin/SystemFeature' },
      '/Admin/UserGroup': { page: '/Admin/UserGroup' },
      '/Admin/Users': { page: '/Admin/Users' },
      '/Admin/MasterLookUp/ProductTypes': { page: '/Admin/MasterLookUp/ProductTypes' },
      '/Admin/MasterLookUp/ProductBrandsAndModels': { page: '/Admin/MasterLookUp/ProductBrandsAndModels' },
      '/Admin/MasterLookUp/BankList': { page: '/Admin/MasterLookUp/BankList' },
      '/Admin/MasterLookUp/BusinessTypes': { page: '/Admin/MasterLookUp/BusinessTypes' },
      '/Admin/MasterLookUp/CompleteSize': { page: '/Admin/MasterLookUp/CompleteSize' },
      '/Admin/MasterLookUp/Departments': { page: '/Admin/MasterLookUp/Departments' },
      '/Admin/MasterLookUp/DocumentTypeGroups': { page: '/Admin/MasterLookUp/DocumentTypeGroups' },
      '/Admin/MasterLookUp/DocumentTypes': { page: '/Admin/MasterLookUp/DocumentTypes' },
      '/Admin/MasterLookUp/NameTitle': { page: '/Admin/MasterLookUp/NameTitle' },
      '/Admin/MasterLookUp/ProductPurchaseUnitTypes': { page: '/Admin/MasterLookUp/ProductPurchaseUnitTypes' },
      '/Admin/MasterLookUp/ProductTypeGroup': { page: '/Admin/MasterLookUp/ProductTypeGroup' },
      '/Admin/MasterLookUp/Region': { page: '/Admin/MasterLookUp/Region' },
      '/Admin/MasterLookUp/TaxTypes': { page: '/Admin/MasterLookUp/TaxTypes' },
      '/Admin/MasterLookUp/VehicleBrandAndModel': { page: '/Admin/MasterLookUp/VehicleBrandAndModel' },
      '/Admin/MasterLookUp/VehicleType': { page: '/Admin/MasterLookUp/VehicleType' },
      '/Admin/MasterLookUp/VehicleColors': { page: '/Admin/MasterLookUp/VehicleColors' },
      '/Admin/ThirdPartyApiManagement/ApiListManagement': { page: '/Admin/ThirdPartyApiManagement/ApiListManagement' },
      '/Admin/ThirdPartyApiManagement/ConfigThirdPartyApiConnectData': { page: '/Admin/ThirdPartyApiManagement/ConfigThirdPartyApiConnectData' },
      '/ConnectData/WyzAutoManagement': { page: '/ConnectData/WyzAutoManagement' },
      '/MichelinDataManagement/Customers': { page: '/MichelinDataManagement/Customers' },
      '/MichelinDataManagement/Dealers': { page: '/MichelinDataManagement/Dealers' },
      '/MichelinDataManagement/MichelinDealersInventoryList': { page: '/MichelinDataManagement/MichelinDealersInventoryList' },
      '/MichelinDataManagement/MichelinDealersPointMovementList': { page: '/MichelinDataManagement/MichelinDealersPointMovementList' },
      '/MichelinDataManagement/MichelinDealersSalesList': { page: '/MichelinDataManagement/MichelinDealersSalesList' },
      '/MichelinDataManagement/Products': { page: '/MichelinDataManagement/Products' },
      '/MichelinDataManagement/ShopHq': { page: '/MichelinDataManagement/ShopHq' },
      '/MyData/CustomersData': { page: '/MyData/CustomersData' },
      '/MyData': { page: '/MyData' },
      // '/MyData/MichelinInventoryList': { page: '/MyData/MichelinInventoryList' },
      '/Inventory/Balances': { page: '/Inventory/Balances' },
      '/Inventory/BalancesAllBranch': { page: '/Inventory/BalancesAllBranch' },
      '/Inventory/ImportDocuments': { page: '/Inventory/ImportDocuments' },
      '/Inventory/PurchaseOrder': { page: '/Inventory/PurchaseOrder' },
      '/Inventory/TranferInventoryDoc': { page: '/Inventory/TranferInventoryDoc' },
      '/Inventory/ReceiveTranferInventoryDoc': { page: '/Inventory/ReceiveTranferInventoryDoc' },
      '/Inventory/ProductReturnDoc': { page: '/Inventory/ProductReturnDoc' },
      '/Inventory/ProductReturnReceiptDoc': { page: '/Inventory/ProductReturnReceiptDoc' },
      '/Inventory/AdjustIncreaseDocuments': { page: '/Inventory/AdjustIncreaseDocuments' },

      '/MyData/MichelinSalesList': { page: '/MyData/MichelinSalesList' },
      '/MyData/MyPointMovementList': { page: '/MyData/MyPointMovementList' },
      '/MyData/ProductsData': { page: '/MyData/ProductsData' },
      '/MyData/BusinessPartnersData': { page: '/MyData/BusinessPartnersData' },
      '/MyData/PersonalCustomersData': { page: '/MyData/PersonalCustomersData' },
      '/MyData/BusinessCustomersData': { page: '/MyData/BusinessCustomersData' },
      '/MyData/EmployeeData': { page: '/MyData/EmployeeData' },
      '/MyData/BankAccountData': { page: '/MyData/BankAccountData' },
      '/MyData/ChequeData': { page: '/MyData/ChequeData' },
      '/MyData/TransportVehicleData': { page: '/MyData/TransportVehicleData' },
      '/MyData/Reports/ReportShopLegacySalesOut': { page: '/MyData/Reports/ReportShopLegacySalesOut' },
      '/MyData/Reports/ReportCustomerDept': { page: '/MyData/Reports/ReportCustomerDept' },
      '/MyData/Reports/ReportSalesTax': { page: '/MyData/Reports/ReportSalesTax' },
      '/MyData/Reports/ReportPurchaseTax': { page: '/MyData/Reports/ReportPurchaseTax' },

      '/MyData/Reports/ReportSalesOut': { page: '/MyData/Reports/ReportSalesOut' },
      '/MyData/Reports/ReportInventory/': { page: '/MyData/Reports/ReportInventory' },
      '/MyData/Reports/ReportProductMovement/': { page: '/MyData/Reports/ReportProductMovement' },

      '/Setting/PointsActivities': { page: '/Setting/PointsActivities' },
      '/Setting/PointsActivitiesOptions': { page: '/Setting/PointsActivitiesOptions' },
      '/Sales/ServicePlans': { page: '/Sales/ServicePlans' },
      '/Sales/Quotation': { page: '/Sales/Quotation' },
      '/Sales/TemporaryInvoices': { page: '/Sales/TemporaryInvoices' },
      '/Sales/ShopTemporaryDeliveryOrderDoc': { page: '/Sales/ShopTemporaryDeliveryOrderDoc' },
      '/Sales/ShopTemporaryDeliveryOrderDocWholeSale': { page: '/Sales/ShopTemporaryDeliveryOrderDocWholeSale' },
      '/Sales/ShopTaxInvoiceDoc': { page: '/Sales/ShopTaxInvoiceDoc' },
      '/Sales/ShopTaxInvoiceDocWholeSale': { page: '/Sales/ShopTaxInvoiceDocWholeSale' },
      '/Sales/DebtorDoc': { page: '/Sales/DebtorDoc' },
      '/Sales/DebtorBillingDoc': { page: '/Sales/DebtorBillingDoc' },
      '/Sales/DebtCreditNoteDoc': { page: '/Sales/DebtCreditNoteDoc' },
      '/Sales/DebtDebitNoteDoc': { page: '/Sales/DebtDebitNoteDoc' },
      '/Sales/ShopPartnerDebtDebitNoteDoc': { page: '/Sales/ShopPartnerDebtDebitNoteDoc' },
      '/Sales/ShopPartnerDebtCreditNoteDoc': { page: '/Sales/ShopPartnerDebtCreditNoteDoc' },
      '/Sales/PaymentVoucherDoc': { page: '/Sales/PaymentVoucherDoc' },
      '/Sales/DebtCreditNoteNoVatDoc': { page: '/Sales/DebtCreditNoteNoVatDoc' },
      '/Sales/TransportDoc': { page: '/Sales/TransportDoc' },

      '/LineOA/GateWay': { page: '/LineOA/GateWay' },
      '/LineOA/InventoryBalance': { page: '/LineOA/InventoryBalance' },
      '/LineOA/ShopWholeSaleDoc': { page: '/LineOA/ShopWholeSaleDoc' },
      '/LineOA/Register': { page: '/LineOA/Register' },
      '/LineOA/TranferStatus': { page: '/LineOA/TranferStatus' },
      '/LineOA/Promotion': { page: '/LineOA/Promotion' },
      '/LineOA/InventoryBalanceSTT': { page: '/LineOA/InventoryBalanceSTT' },
      '/LineOA/Holiday': { page: '/LineOA/Holiday' },

      '/LineOAInside/GateWay': { page: '/LineOAInside/GateWay' },
      '/LineOAInside/InventoryAll': { page: '/LineOAInside/InventoryAll' },
      '/LineOAInside/InventoryWarehouseDetail': { page: '/LineOAInside/InventoryWarehouseDetail' },

      '/Reports/ReportShopPartnerDebt': { page: '/Reports/ReportShopPartnerDebt' },
      '/Reports/ReportProductReturnReceipt': { page: '/Reports/ReportProductReturnReceipt' },
      '/Reports/ReportReceiveTranferInventoryDoc': { page: '/Reports/ReportReceiveTranferInventoryDoc' },
      '/Reports/ReportReturnProduct': { page: '/Reports/ReportReturnProduct' },
      '/Reports/ReportTranferInventory': { page: '/Reports/ReportTranferInventory' },
      '/Reports/ReportFinance': { page: '/Reports/ReportFinance' },
      '/Reports/ReportTarget': { page: '/Reports/ReportTarget' },
      '/Reports/ReportShopCustomerCreditNote': { page: '/Reports/ReportShopCustomerCreditNote' },
      '/Reports/ReportShopCustomerCreditNoteNoVat': { page: '/Reports/ReportShopCustomerCreditNoteNoVat' },

      '/401': { page: '/401' },
      '/Dashboard': { page: '/Dashboard' },
      '/': { page: '/' },
      '/login': { page: '/login' },
      '/register': { page: '/register' },
      '/ComingSoon': { page: '/ComingSoon' },
      '/CRM/AppointmentSchedule': { page: '/CRM/AppointmentSchedule' },
      '/CRM/Promotion': { page: '/CRM/Promotion' },
      '/Setting/TagsData': { page: '/Setting/TagsData' },
      '/CheckStock': { page: '/CheckStock' },
      '/pdfview': { page: '/pdfview' },
    }
  },
  images: {
    loader: "imgix",
    path: "https://noop/",
  },
  trailingSlash: true,
  reactStrictMode: true,
}
