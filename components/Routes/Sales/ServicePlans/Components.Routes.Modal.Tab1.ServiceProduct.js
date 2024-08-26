import { useEffect, useState } from 'react'
import { Input, Select, Form, Row, Col, Button, message, Popconfirm, Switch } from 'antd';
import GetIntlMessages from '../../../../util/GetIntlMessages';
import Fieldset from '../../../shares/Fieldset';
import SortingData from '../../../shares/SortingData';
import { MinusCircleOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import API from '../../../../util/Api'
import { find, get, isArray, isFunction, isPlainObject, debounce } from 'lodash';
import { useSelector } from 'react-redux';
import Swal from "sweetalert2";
import ModalViewShopStock from '../../ModalViewShopStock';

/**
 * type 
 *  - 1 = ใบสั่งซ่อม
 *  - 2 = ใบเสร็จรับเงิน/ใบกำกับภาษี
 *  - 3 = ใบกํากับภาษีเต็มรูปแบบ
 * @param {object} obj 
 * @param {import('antd').FormInstance} obj.form 
 * @returns 
 */
const Tab1ServiceProduct = ({ handleOk, mode, form, onFinish, onFinishFailed, calculateResult, type = 1, checkTaxId, isTableNoStyle = false, isShowShopStockBtn = true }) => {
   const { locale } = useSelector(({ settings }) => settings);
   const { taxTypes, productPurchaseUnitTypes } = useSelector(({ master }) => master);
   const { permission_obj } = useSelector(({ permission }) => permission);
   const [shelfDataAll, setShelfDataAll] = useState([]); //รายการคลังสินค้าทั้งหมด

   const purchaseUnitTypeService = "af416ec2-c8f0-4c20-90a4-29487fecb315" //-> หน่วยซื้อ -> รายการ
   const purchaseUnitTypeTire = "103790b2-e9ab-411b-91cf-a22dbf624cbc" //-> หน่วยซื้อ -> เส้น
   const purchaseUnitTypeBattery = "a7192601-316d-438e-a69e-f978d8445ae7" //-> หน่วยซื้อ -> ลูก
   const productTypeBattery = "5d82fef5-8267-4aea-a968-92a994071621" //-> Battery

   useEffect(() => {
      init()
   }, [])

   /**
    * It calls the getShelfData function and then sets the shelfDataAll variable to the value returned
    * by the getShelfData function.
    */
   const init = async () => {
      try {

         const [value1] = await Promise.all([getShelfData()])

         if (isArray(value1)) setShelfDataAll(value1)

      } catch (error) {
         console.log('error', error)
      }
   }

   /**
    * Given a value and index, select the product at that index in the products array.
    * @param {string} value - The value of the selected option.
    * @param {number} index - The index of the selected product.
    */
   const selectProduct = async (value, index) => {
      try {
         const shopStock = await getShopStockByid(value);
         const shopProductPrice = get(shopStock, `ShopProduct.price`, null);

         const dot_mfd_list = []
         if (isArray(shopStock.warehouse_detail)) {
            shopStock.warehouse_detail.forEach(e => {
               let dot_mfd
               if (e.shelf.balance != 0) {
                  dot_mfd = get(e, `shelf.dot_mfd`, "-");
               }

               if (dot_mfd) {
                  const _find = dot_mfd_list.find(where => where == dot_mfd)
                  if (!_find) dot_mfd_list.push(dot_mfd)
               }
            });
         }
         const { list_service_product } = form.getFieldsValue();

         if (dot_mfd_list.length === 0) {
            Swal.fire('รายการสินค้าคงเหลือเป็น 0', '', 'warning')
            list_service_product[index] = {}
         } else {
            list_service_product[index].dot_mfd_list = dot_mfd_list;
            list_service_product[index].price = get(shopProductPrice, `suggasted_re_sell_price.retail`, 0);
            list_service_product[index].product_cost = shopStock.product_cost;
            list_service_product[index].price_text = Number(get(shopProductPrice, `suggasted_re_sell_price.retail`, 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            list_service_product[index].product_id = shopStock.product_id;
            list_service_product[index].shelf_list = []
            list_service_product[index].warehouse_list = []

            list_service_product[index].shelf_code = null
            list_service_product[index].amount = null
            list_service_product[index].warehouse_id = null
            list_service_product[index].balance = null
            list_service_product[index].dot_mfd = null

            list_service_product[index].purchase_unit_list = []
            list_service_product[index].purchase_unit_id = null

            list_service_product[index].is_service = shopStock?.ShopProduct?.Product?.ProductType?.type_group_id === "a613cd37-8725-4c0e-ba5f-2ea021846dc7" ? true : false
            list_service_product[index].changed_product_name = null
         }
         // console.log("slist_service_product",list_service_product)
         form.setFieldsValue({
            list_service_product
         })

      } catch (error) {
         console.log('error', error)
      }
   }

   const isOnChangeProductName = (bool, index) => {
      try {
         const { list_service_product } = form.getFieldsValue();
         const _find = isArray(list_service_product[index]?.list_shop_stock) ? list_service_product[index]?.list_shop_stock.find(where => where.id === list_service_product[index].shop_stock_id) : null
         list_service_product[index].changed_product_name = mode !== "add" && bool === true ? list_service_product[index].changed_product_name ?? get(_find, `ShopProduct.Product.product_name.${locale.locale}`, null) : null
         list_service_product[index].changed_name_status = bool
         form.setFieldsValue({ list_service_product })
      } catch (error) {

      }
   }

   /**
    * This function is used to set the value of the dot_mfd field in the form.
    * @param _value - the value of the dot_mfd field
    * @param index - the index of the service product in the list of service products
    */
   const selectDotMfd = (_value, index) => {
      const value = _value !== "-" ? _value : null;
      const { list_service_product } = form.getFieldsValue();
      const { list_shop_stock, shop_stock_id } = list_service_product[index];
      const shelf_list = [];
      const purchase_unit_list = [];

      if (isArray(list_shop_stock) && list_shop_stock.length > 0) {
         const findIndex = list_shop_stock.findIndex(where => where.id == shop_stock_id)
         if (findIndex != -1) {
            const { warehouse_detail, ShopProduct } = list_shop_stock[findIndex];
            if (isArray(warehouse_detail)) {
               const _filter = warehouse_detail.filter(where => where.shelf.dot_mfd == value);

               const warehouse_list = []
               if (_filter.length > 1) {
                  _filter.forEach(e => {
                     const { warehouse, shelf } = e;
                     const _where = whereIdArray(shelfDataAll, warehouse);

                     if (_where && isPlainObject(shelf)) {
                        if (!whereIdArray(warehouse_list, _where.id)) warehouse_list.push(_where)
                        // if (!whereIdArray(filterPurchaseUnitList, shelf.purchase_unit_id) && shelf?.balance != 0) filterPurchaseUnitList.push({id : shelf.purchase_unit_id})
                     }
                  });

                  // if(ShopProduct?.Product?.ProductType?.ProductPurchaseUnitTypes.length > 0){
                  //    filterPurchaseUnitList.map(e=>{
                  //       if(whereIdArray(ShopProduct?.Product?.ProductType?.ProductPurchaseUnitTypes, e.id)) purchase_unit_list.push(whereIdArray(ShopProduct?.Product?.ProductType?.ProductPurchaseUnitTypes, e.id))
                  //    })
                  // }
                  const _wherePurchaseUnit = ShopProduct?.Product?.ProductType?.ProductPurchaseUnitTypes.filter(where => _filter.find(whereValue => whereValue.shelf.purchase_unit_id === where.id))
                  purchase_unit_list = _wherePurchaseUnit
                  if (warehouse_list.length === 1) {
                     _filter.forEach(e => {
                        const { warehouse, shelf } = e;

                        const _where = whereIdArray(shelfDataAll, warehouse);

                        _where.shelf.forEach(e => { if (shelf.item === e.code) !shelf_list.find(where => where.code === e.code) ? shelf_list.push(e) : null });

                     });
                  }

                  list_service_product[index].warehouse_list = warehouse_list;
                  list_service_product[index].shelf_code = shelf_list.length === 1 ? shelf_list[0].code : null;
                  list_service_product[index].warehouse_id = (warehouse_list.length === 1) ? warehouse_list[0]?.id : null;
                  list_service_product[index].balance = null;

                  if (shelf_list.length === 1) {
                     list_service_product[index].purchase_unit_list = purchase_unit_list ?? [];
                     const _find = purchase_unit_list.find(where => { return where.id === purchaseUnitTypeService || where.id === purchaseUnitTypeTire || (ShopProduct.Product?.ProductType.id === productTypeBattery && where.id === purchaseUnitTypeBattery) })
                     list_service_product[index].purchase_unit_id = (purchase_unit_list.length === 1) ? purchase_unit_list[0]?.id ?? null : isPlainObject(_find) ? _find?.id ?? null : null;
                     let _findBalance = null
                     if (!!value) {
                        _findBalance = _filter.find(where => where.warehouse === warehouse_list[0]?.id && where.shelf.item === shelf_list[0].code && where.shelf?.purchase_unit_id === (purchase_unit_list[0]?.id ?? isPlainObject(_find) ? _find?.id ?? null : null) && where.shelf.dot_mfd === value)
                     } else {
                        _findBalance = _filter.find(where => where.warehouse === warehouse_list[0]?.id && where.shelf.item === shelf_list[0].code && where.shelf?.purchase_unit_id === (purchase_unit_list[0]?.id ?? isPlainObject(_find) ? _find?.id ?? null : null))
                     }

                     list_service_product[index].balance = isPlainObject(_findBalance) ? _findBalance.shelf.balance : null
                  } else {
                     list_service_product[index].purchase_unit_list = [];
                     list_service_product[index].purchase_unit_id = null
                  }



               } else if (_filter.length === 1) {
                  // console.log('_filter.length === 1 selectDotMfd :>> ', _filter);
                  if (isPlainObject(_filter[0])) {
                     const { warehouse, shelf } = _filter[0];
                     const _where = whereIdArray(shelfDataAll, warehouse);
                     const _wherePurchaseUnit = whereIdArray(ShopProduct?.Product?.ProductType?.ProductPurchaseUnitTypes, _filter[0]?.shelf?.purchase_unit_id);
                     if (_where && isPlainObject(shelf)) {
                        _where.shelf.forEach(e => { if (shelf.item === e.code) shelf_list.push(e); });
                        ShopProduct?.Product?.ProductType?.ProductPurchaseUnitTypes.forEach(e => { if (_wherePurchaseUnit?.id === e.id) purchase_unit_list.push(e); });
                        list_service_product[index].warehouse_list = [_where];
                        list_service_product[index].shelf_code = shelf.item;
                        list_service_product[index].warehouse_id = _where.id;
                        list_service_product[index].balance = shelf.balance;
                        list_service_product[index].purchase_unit_list = purchase_unit_list ?? [];
                        list_service_product[index].purchase_unit_id = (purchase_unit_list.length === 1) ? purchase_unit_list[0]?.id ?? null : null;
                     }
                  }
               }
            }
         }
      }
      list_service_product[index].shelf_list = shelf_list
      form.setFieldsValue({
         list_service_product
      })
   }


   const selectWarehouse = (value, index) => {
      const { list_service_product } = form.getFieldsValue();
      const { list_shop_stock, dot_mfd, warehouse_id, shop_stock_id } = list_service_product[index];
      const shelf_list = [];
      const purchase_unit_list = [];
      const warehouse = whereIdArray(shelfDataAll, warehouse_id)

      if (isArray(list_shop_stock) && list_shop_stock.length > 0) {
         const findIndex = list_shop_stock.findIndex(where => where.id == shop_stock_id)
         if (findIndex != -1) {
            const { warehouse_detail, ShopProduct } = list_shop_stock[findIndex];
            let _filter
            if (dot_mfd !== "-") {
               _filter = warehouse_detail.filter(where => where.shelf.dot_mfd == dot_mfd && warehouse_id === where.warehouse);
            } else {
               _filter = warehouse_detail.filter(where => warehouse_id === where.warehouse);
            }

            if (_filter.length > 1) {
               _filter.forEach(e => {
                  // console.log('e :>> ', e);
                  if (isArray(ShopProduct?.Product?.ProductType?.ProductPurchaseUnitTypes)) {
                     const _findPurchaseUnitId = ShopProduct?.Product?.ProductType?.ProductPurchaseUnitTypes.find(where => where.id === e.shelf.purchase_unit_id)
                     // console.log('_findPurchaseUnitId :>> ', _findPurchaseUnitId);
                     if (_findPurchaseUnitId) {
                        const checkDuplicatePurchaseUnit = purchase_unit_list.find(where => where.id === _findPurchaseUnitId.id)
                        if (!isPlainObject(checkDuplicatePurchaseUnit)) purchase_unit_list.push(_findPurchaseUnitId)
                     }
                  }
                  const _find = warehouse.shelf.find(where => where.code === e.shelf.item)

                  if (_find) {
                     const checkDuplicate = shelf_list.find(where => where.code === _find.code)
                     if (!isPlainObject(checkDuplicate)) shelf_list.push(_find)
                  }
               });
               if (shelf_list.length > 1) {
                  purchase_unit_list = []
               }
               list_service_product[index].shelf_code = (shelf_list.length === 1) ? shelf_list[0].code : null
               list_service_product[index].balance = null

               list_service_product[index].purchase_unit_list = purchase_unit_list ?? []
               list_service_product[index].purchase_unit_id = (purchase_unit_list.length === 1) ? purchase_unit_list[0]?.id : null
            } else if (_filter.length === 1) {
               const e = _filter[0]
               const _find = warehouse.shelf.find(where => where.code === e.shelf.item)
               if (_find) shelf_list.push(_find);

               if (isArray(ShopProduct?.Product?.ProductType?.ProductPurchaseUnitTypes)) {
                  const _findPurchaseUnitId = ShopProduct?.Product?.ProductType?.ProductPurchaseUnitTypes.find(where => where.id === e.shelf.purchase_unit_id)
                  if (_findPurchaseUnitId) {
                     const checkDuplicatePurchaseUnit = purchase_unit_list.find(where => where.id === _findPurchaseUnitId.id)
                     if (!isPlainObject(checkDuplicatePurchaseUnit)) purchase_unit_list.push(_findPurchaseUnitId)
                  }
               }

               list_service_product[index].shelf_code = e.shelf.item
               list_service_product[index].balance = e.shelf.balance

               list_service_product[index].purchase_unit_list = purchase_unit_list ?? []
               list_service_product[index].purchase_unit_id = (purchase_unit_list.length === 1) ? purchase_unit_list[0]?.id : null
            }

         }
      }
      // console.log('shelf_list :>> ', shelf_list);
      list_service_product[index].shelf_list = shelf_list
      form.setFieldsValue({
         list_service_product
      })
   }

   const selectShelfCode = (value, index) => {
      const { list_service_product } = form.getFieldsValue();
      const { list_shop_stock, dot_mfd, warehouse_id, shop_stock_id } = list_service_product[index];
      const purchase_unit_list = []
      if (isArray(list_shop_stock) && list_shop_stock.length > 0) {
         const findIndex = list_shop_stock.findIndex(where => where.id == shop_stock_id)
         if (findIndex != -1) {
            const { warehouse_detail, ShopProduct } = list_shop_stock[findIndex];
            const _filter = warehouse_detail.filter(where => where.shelf.dot_mfd == (dot_mfd != "-" ? dot_mfd : null) && warehouse_id === where.warehouse);
            // const _find = _filter.find(where => where.shelf.item === value);
            const _filterShelf = _filter.filter(where => where.shelf.item === value);

            if (_filterShelf.length === 1) {
               const e = _filterShelf[0]
               list_service_product[index].balance = _filterShelf[0].shelf.balance
               const _findPurchaseUnitId = ShopProduct?.Product?.ProductType?.ProductPurchaseUnitTypes.find(where => where.id === e.shelf.purchase_unit_id)

               if (_findPurchaseUnitId) {
                  const checkDuplicatePurchaseUnit = purchase_unit_list.find(where => where.id === _findPurchaseUnitId.id)
                  if (!isPlainObject(checkDuplicatePurchaseUnit)) purchase_unit_list.push(_findPurchaseUnitId)
               }

               list_service_product[index].purchase_unit_list = purchase_unit_list ?? [];
               const _find = purchase_unit_list.find(where => { return where.id === purchaseUnitTypeService || where.id === purchaseUnitTypeTire || (ShopProduct.Product?.ProductType.id === productTypeBattery && where.id === purchaseUnitTypeBattery) })
               list_service_product[index].purchase_unit_id = (purchase_unit_list.length === 1) ? purchase_unit_list[0]?.id ?? null : isPlainObject(_find) ? _find?.id ?? null : null;
               // list_service_product[index].purchase_unit_list = purchase_unit_list ?? []
               // list_service_product[index].purchase_unit_id = (purchase_unit_list.length === 1) ? purchase_unit_list[0]?.id : null
            } else if (_filterShelf.length > 1) {
               // const _findBalance = _filterShelf.find(where => where?.shelf?.item === value)
               // list_service_product[index].balance = (_findBalance) ? _findBalance?.shelf?.balance : null
               const _wherePurchaseUnit = ShopProduct?.Product?.ProductType?.ProductPurchaseUnitTypes.filter(where => _filter.find(whereValue => whereValue.shelf.purchase_unit_id === where.id))
               purchase_unit_list = _wherePurchaseUnit
               if (isArray(ShopProduct?.Product?.ProductType?.ProductPurchaseUnitTypes)) {

                  const _wherePurchaseUnit = ShopProduct?.Product?.ProductType?.ProductPurchaseUnitTypes.filter(where => _filter.find(whereValue => whereValue.shelf.purchase_unit_id === where.id))
                  purchase_unit_list = _wherePurchaseUnit
                  // _filterShelf.forEach(e => {
                  //    if (isArray(ShopProduct?.Product?.ProductType?.ProductPurchaseUnitTypes)) {
                  //       const _findPurchaseUnitId = ShopProduct?.Product?.ProductType?.ProductPurchaseUnitTypes.find(where => where.id === e.shelf.purchase_unit_id)
                  //       if (_findPurchaseUnitId) {
                  //          const checkDuplicatePurchaseUnit = purchase_unit_list.find(where => where.id === _findPurchaseUnitId.id)
                  //          if (!isPlainObject(checkDuplicatePurchaseUnit)) purchase_unit_list.push(_findPurchaseUnitId)
                  //       }
                  //    }
                  // });
               }
               const _find = purchase_unit_list.find(where => { return where.id === purchaseUnitTypeService || where.id === purchaseUnitTypeTire || (ShopProduct.Product?.ProductType.id === productTypeBattery && where.id === purchaseUnitTypeBattery) })
               list_service_product[index].purchase_unit_list = purchase_unit_list ?? []
               list_service_product[index].purchase_unit_id = (purchase_unit_list.length === 1) ? purchase_unit_list[0]?.id ?? null : isPlainObject(_find) ? _find?.id ?? null : null;
               list_service_product[index].balance = _filterShelf.find(where => { return where?.warehouse === warehouse_id && where?.shelf?.item === value && where?.shelf?.dot_mfd === dot_mfd && where?.shelf?.purchase_unit_id === (purchase_unit_list[0]?.id ?? isPlainObject(_find) ? _find?.id ?? null : null) })?.shelf?.balance ?? null
            }

            // if (_find) list_service_product[index].balance = _find.shelf.balance
         }
      }

      form.setFieldsValue({
         list_service_product
      })
   }

   const selectPurchaseUit = (value, index) => {
      try {
         const { list_service_product } = form.getFieldValue()
         const { warehouse_id, shelf_code, dot_mfd } = list_service_product[index]

         let _filterBalance = 0
         if (!!dot_mfd && dot_mfd !== "-") {
            _filterBalance = list_service_product[index].list_shop_stock[0].warehouse_detail.find(where => { return where.warehouse === warehouse_id && where.shelf.item === shelf_code && where.shelf.dot_mfd === dot_mfd && where.shelf.purchase_unit_id === value })
         } else {
            _filterBalance = list_service_product[index].list_shop_stock[0].warehouse_detail.find(where => { return where.warehouse === warehouse_id && where.shelf.item === shelf_code && where.shelf.purchase_unit_id === value })
         }

         list_service_product[index].balance = isPlainObject(_filterBalance) ? _filterBalance.shelf?.balance ?? null : null
         form.setFieldsValue({ list_service_product })
      } catch (error) {
         // console.log('error :>> ', error);
      }
   }

   /**
    * Given an array of objects, return the index or value of the object where the id property matches
    * the given id
    * @param arr - the array you want to search
    * @param id - The id of the object you want to find.
    * @param type - "index" or "value"
    * @returns The index of the array element that matches the id.
    */
   const whereIdArray = (arr, id, type) => {
      return type === "index" ? arr.findIndex(where => where.id === id) : arr.find(where => where.id === id)
   }

   /**
    * Get the value of the array field at the specified index
    * @param {number} index - The index of the array.
    * @param {string} type - The type of the field.
    * @returns The `getArrListValue` function returns an array of values.
    */
   const getArrListValue = (index, type) => {
      try {
         const { list_service_product } = form.getFieldsValue();
         if (list_service_product && !isPlainObject(list_service_product[index])) list_service_product = {};
         return isArray(list_service_product) ? list_service_product[index][type] ?? [] : []
      } catch (error) {
         // console.log('error :>> ', error);
      }
   }

   const getValue = (index, type) => {
      const { list_service_product } = form.getFieldsValue();
      if (list_service_product && !isPlainObject(list_service_product[index])) list_service_product = {};
      return isArray(list_service_product) ? list_service_product[index][type] ?? "" : ""
   }

   /**
    * It gets the shop stock by id.
    * เรียกข้อมูล ประเภทสินค้าตาม Id ที่ส่งเข้ามา
    * @param {UUID} id - The id of the shopStock you want to get.
    * @returns The `getShopStockByid` function returns a Promise.
    */
   const getShopStockByid = async (id) => {
      const { data } = await API.get(`/shopStock/byid/${id}`)
      return data.status == "success" ? isArray(data.data) ? data.data[0] : null : null
   }

   /**
    * It gets all the warehouses from the API and returns them as an array.
    * เรียกข้อมูล คลังสินค้า ทั้งหมด
    * @returns An array of objects.
    */
   const getShelfData = async () => {
      const { data } = await API.get(`/shopWarehouses/all?limit=9999&page=1&sort=code_id&order=asc`)
      return data.data.data
   }

   const debounceOnSearch = debounce((value, index) => handleSearchShopStock(value, index), 600)
   /**
    * It searches for the shop stock based on the search value.
    * @param {UUID} value - The value of the input field.
    * @param {number} index - the index of the service product in the list of service products
    */
   const handleSearchShopStock = async (value, index) => {
      const { list_service_product } = form.getFieldsValue();
      if (isPlainObject(list_service_product[index])) {
         if (!!value) {
            const { data } = await API.get(`/shopStock/all?limit=50&page=1&search=${value}&status=active&filter_available_balance=true&min_balance=1&max_balance=99999999`);

            const newData = data.data.data.map(e => {
               const _model = {
                  ...e,
                  warehouse_detail: e.warehouse_detail.filter(where => where.shelf.balance != 0)
               }
               return _model

            })
            list_service_product[index].list_shop_stock = data.status == "success" ? SortingData(newData, `ShopProduct.Product.product_name.${locale.locale}`) : []
         }
      } else {
         list_service_product[index] = {}
      }

      form.setFieldsValue({
         list_service_product
      })
   };


   /**
    * It removes the service product from the list of service products.
    * @param remove - A function that removes the field from the form.
    * @param fieldName - The name of the field that you want to remove.
    * @param index - The index of the array element to be removed.
    */
   const changeListServiceProduct = async (remove, fieldName, index) => {
      try {
         const { list_service_product, change_list_service_product } = form.getFieldsValue();
         if (isPlainObject(list_service_product[index])) {

            if (list_service_product[index].id) {

               if (!!change_list_service_product) {
                  change_list_service_product = [...change_list_service_product, list_service_product[index].id]
               } else {
                  change_list_service_product = [list_service_product[index].id]
               }
               list_service_product[index] = {};
               calculateResult()
            } else {
               calculateResult()
            }

         } else {
            // remove(fieldName)
            calculateResult()
         }
         form.setFieldsValue({ change_list_service_product })
         // remove(fieldName)
      } catch (error) {
         console.log('error', error)
      }
   }
   /**
    * It removes the service product from the list of service products.
    * @param remove - A function that removes the field from the form.
    * @param fieldName - The name of the field that you want to remove.
    * @param index - The index of the array element to be removed.
    */
   const removeListServiceProduct = async (remove, fieldName, index) => {
      try {
         const { list_service_product } = form.getFieldsValue();
         if (isPlainObject(list_service_product[index])) {
            if (list_service_product[index].id) {
               const { data } = await API.put(`/shopSalesOrderPlanLogs/put/${list_service_product[index].id}`, {
                  status: 0,
                  amount: 0
               });
               if (data.status == "success") {
                  list_service_product[index].amount = 0;
                  remove(fieldName)
                  calculateResult()
                  form.submit()
               } else {
                  message.warning(data.data)
               }
            } else {
               remove(fieldName)
               calculateResult()
            }

         } else {
            remove(fieldName)
            calculateResult()
         }
         // remove(fieldName)
      } catch (error) {
         console.log('error', error)
      }
   }

   /**
    * 
    * @param value - The value of the input.
    * @param index - The index of the item in the array.
    */
   const onBlurAmount = async (value, index) => {
      try {
         if (!!value && value != 0) {
            const { id, shop_id, list_service_product } = form.getFieldValue();
            const product_data = list_service_product[index];
            const amount = Number(value)
            const model = {
               shop_id,
               product_id: product_data.product_id,
               warehouse_detail: {
                  warehouse: product_data.warehouse_id,
                  shelf: [
                     {
                        item: product_data.shelf_code, // num shelf 1,
                        dot_mfd: product_data.dot_mfd != "-" ? product_data.dot_mfd : null, // UUID ของหน่อยซื้อ,
                        purchase_unit_id: product_data.purchase_unit_id,
                        // purchase_unit_id: "103790b2-e9ab-411b-91cf-a22dbf624cbc",
                        amount, // จำนวนสินค้า
                        discount: product_data.discount, // ส่วนลด
                        repairman: product_data.repairman, // ช่างซ่อม
                     }
                  ]
               },
               amount,
               doc_sale_id: id,
               details: product_data
            }

            if (isArray(model.details.list_shop_stock)) {
               model.details.list_shop_stock = model.details.list_shop_stock.filter(where => where.id === model.details.shop_stock_id)
            }

            // console.log('model :>> ', model);

            if (!product_data.id) {
               const { data } = await API.post(`/shopSalesOrderPlanLogs/add`, model);
               if (data.status == "success") {
                  list_service_product[index].id = data.data.id;
                  list_service_product[index].amount_old = value;
               } else {
                  list_service_product[index].amount = null;
                  message.warning(data.data)
               }

            } else {
               const { data } = await API.put(`/shopSalesOrderPlanLogs/put/${product_data.id}`, model);
               if (data.status == "success") {
                  list_service_product[index].amount_old = value;
               } else {
                  list_service_product[index].amount = list_service_product[index].amount_old;
                  message.warning(data.data)
               }
            }
            calculateResult(index)
            form.setFieldsValue({
               list_service_product
            })
            onFinish(form.getFieldValue(), true)
         }else{
            if(!!value && value == 0 ){
               Swal.fire('ไม่สามารถใส่จำนวนเป็น 0 หรือน้อยกว่าได้ !!','','warning')
               const fieldValue = form.getFieldValue("list_service_product")
               fieldValue[index].amount = null
               form.setFieldValue(`list_service_product`, fieldValue)
            } 
         }

      } catch (error) {
         console.log('error', error)
      }
   }

   const [discountBathValue, setDiscountBathValue] = useState("")
   const [discountPercentValue, setDiscountPercentValue] = useState("")

   const onBlurDiscount = async (value, index, type) => {
      try {
         // debugger
         const newValue = value.replaceAll(",", "")
         const { id, shop_id, list_service_product } = form.getFieldValue();
         const product_data = list_service_product[index];

         Number.prototype.toFixedNoRounding = function (n) {
            const reg = new RegExp("^-?\\d+(?:\\.\\d{0," + n + "})?", "g")
            const a = this.toString().match(reg)[0];
            const dot = a.indexOf(".");
            if (dot === -1) { // integer, insert decimal dot and pad up zeros
               return a + "." + "0".repeat(n);
            }
            const b = n - (a.length - dot) + 1;
            return b > 0 ? (a + "0".repeat(b)) : a;
         }

         let discount = 0, discount_text = 0, discount_percent = 0, discount_percent_text = 0;
         // const discount = Number(newValue)
         // const discount_text = newValue

         switch (type) {
            case "bath":
               discount = Number(newValue)
               discount_text = newValue
               break;
            case "percent":
               discount_percent = Number(newValue)
               discount_percent_text = newValue
               break;

            default:
               break;
         }

         const validate = newValue.match(new RegExp(/^\d+(\.\d+)*$/)) //match แค่ตัวเลขกับจุด(.) เท่านั้น
         const model = {
            shop_id,
            product_id: product_data.product_id,
            warehouse_detail: {
               warehouse: product_data.warehouse_id,
               shelf: [
                  {
                     item: product_data.shelf_code, // num shelf 1,
                     dot_mfd: product_data.dot_mfd != "-" ? product_data.dot_mfd : null, // UUID ของหน่อยซื้อ,
                     purchase_unit_id: product_data.purchase_unit_id,
                     // purchase_unit_id: "103790b2-e9ab-411b-91cf-a22dbf624cbc",
                     amount: product_data.amount, // จำนวนสินค้า
                     repairman: product_data.repairman, // ช่างซ่อม
                     discount, // ส่วนลด
                     discount_text, // ส่วนลดที่มีทศนิยม
                     discount_percent,
                     discount_percent_text
                  }
               ]
            },
            amount: product_data.amount,
            doc_sale_id: id,
            details: product_data
         }

         // console.log('model :>> ', model);

         function convertData(value, type) {
            let resultCovertData
            switch (type) {
               case "bath":
                  resultCovertData = (((Number(value) / Number(list_service_product[index]?.price)) * 100).toFixedNoRounding(2)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  // console.log('resultCovertData :>> ', resultCovertData);
                  if (Number(resultCovertData) < 0.01) {
                     Swal.fire({
                        icon: 'warning',
                        title: GetIntlMessages("warning"),
                        text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01"),
                     });
                     setDiscountBathValue("")
                     setDiscountPercentValue("")
                     return null
                  } else {
                     return resultCovertData ?? null
                  }

               // return (Number(value) / Number(list_service_product[index]?.price)) * 100

               case "percent":
                  resultCovertData = ((Number(list_service_product[index]?.price) * (Number(value) / 100)).toFixedNoRounding(2)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  return resultCovertData ?? null


               default:
                  break;
            }
         }
         // console.log('product_data.id :>> ', product_data.id);
         // console.log('validate :>> ', validate);
         if (validate != null) {
            if (!product_data.id) {
               const { data } = await API.post(`/shopSalesOrderPlanLogs/add`, model);
               if (data.status == "success") {
                  list_service_product[index].id = data.data.id;

                  switch (type) {
                     case "bath":
                        list_service_product[index].discount_old = newValue;
                        list_service_product[index].discount_text_old = newValue;
                        break;
                     case "bath":
                        list_service_product[index].discount_percent_old = newValue;
                        list_service_product[index].discount_percent_text_old = newValue;
                        break;

                     default:
                        list_service_product[index].discount_old;
                        list_service_product[index].discount_text_old;
                        list_service_product[index].discount_percent_old;
                        list_service_product[index].discount_percent_text_old;
                        break;
                  }
               } else {
                  list_service_product[index].discount = null;
                  list_service_product[index].discount_text = null;
                  list_service_product[index].discount_percent = null;
                  list_service_product[index].discount_percent_text = null;
                  message.warning(data.data)
               }

            } else {

               switch (type) {
                  case "bath":
                     if (newValue != discountBathValue) {
                        const resultReturnValue = convertData(newValue, type)
                        if (resultReturnValue != null) {
                           list_service_product[index].discount_old = Number(newValue).toFixedNoRounding(2).replaceAll(",", "");
                           list_service_product[index].discount_text_old = Number(newValue).toFixedNoRounding(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                           list_service_product[index].discount = Number(newValue).toFixedNoRounding(2).replaceAll(",", "");
                           list_service_product[index].discount_text = Number(newValue).toFixedNoRounding(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                           setDiscountBathValue(Number(newValue).toFixedNoRounding(2).replaceAll(",", ""))

                           list_service_product[index].discount_percent_old = resultReturnValue.replaceAll(",", "");
                           list_service_product[index].discount_percent_text_old = resultReturnValue;
                           list_service_product[index].discount_percent = resultReturnValue.replaceAll(",", "");
                           list_service_product[index].discount_percent_text = resultReturnValue;
                           setDiscountPercentValue(resultReturnValue.replaceAll(",", ""))
                        } else {
                           list_service_product[index].discount_percent_old = null;
                           list_service_product[index].discount_percent_text_old = null;
                           list_service_product[index].discount_percent = null;
                           list_service_product[index].discount_percent_text = null;

                           list_service_product[index].discount_old = null;
                           list_service_product[index].discount_text_old = null;
                           list_service_product[index].discount = null;
                           list_service_product[index].discount_text = null;
                           setDiscountBathValue("")
                           setDiscountPercentValue("")
                        }

                     }

                     break;
                  case "percent":
                     if (newValue != discountPercentValue) {
                        list_service_product[index].discount_percent_old = Number(newValue).toFixedNoRounding(2).replaceAll(",", "");
                        list_service_product[index].discount_percent_text_old = Number(newValue).toFixedNoRounding(2);
                        list_service_product[index].discount_percent = Number(newValue).toFixedNoRounding(2).replaceAll(",", "");
                        list_service_product[index].discount_percent_text = Number(newValue).toFixedNoRounding(2);
                        setDiscountPercentValue(Number(newValue).toFixedNoRounding(2).replaceAll(",", ""))

                        list_service_product[index].discount_old = convertData(newValue, type).replaceAll(",", "");
                        list_service_product[index].discount_text_old = convertData(newValue, type);
                        list_service_product[index].discount = convertData(newValue, type).replaceAll(",", "");
                        list_service_product[index].discount_text = convertData(newValue, type);
                        setDiscountBathValue(convertData(newValue, type).replaceAll(",", ""))
                     }
                     break;

                  default:
                     break;
               }
            }
         } else {
            list_service_product[index].discount = null;
            list_service_product[index].discount_text = null;

            list_service_product[index].discount_percent = null;
            list_service_product[index].discount_percent_text = null;
            setDiscountBathValue("")
            setDiscountPercentValue("")
         }


         /**
          * function เก่าเผื่อใช้
          */
         // if (validate != null) {
         //    if (!product_data.id) {
         //       const { data } = await API.post(`/shopSalesOrderPlanLogs/add`, model);
         //       if (data.status == "success") {
         //          list_service_product[index].id = data.data.id;

         //          switch (type) {
         //             case "bath":
         //                list_service_product[index].discount_old = newValue;
         //                list_service_product[index].discount_text_old = newValue;
         //                break;
         //             case "bath":
         //                list_service_product[index].discount_percent_old = newValue;
         //                list_service_product[index].discount_percent_text_old = newValue;
         //                break;

         //             default:
         //                list_service_product[index].discount_old;
         //                list_service_product[index].discount_text_old;
         //                list_service_product[index].discount_percent_old;
         //                list_service_product[index].discount_percent_text_old;
         //                break;
         //          }
         //       } else {
         //          list_service_product[index].discount = null;
         //          list_service_product[index].discount_text = null;
         //          list_service_product[index].discount_percent = null;
         //          list_service_product[index].discount_percent_text = null;
         //          message.warning(data.data)
         //       }

         //    } else {
         //       const { data } = await API.put(`/shopSalesOrderPlanLogs/put/${product_data.id}`, model);
         //       if (data.status == "success") {
         //          switch (type) {
         //             case "bath":
         //                list_service_product[index].discount_old = newValue;
         //                list_service_product[index].discount_text_old = newValue;
         //                list_service_product[index].discount = newValue;
         //                list_service_product[index].discount_text = Number(newValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });



         //                list_service_product[index].discount_percent_old = convertData(newValue,type);
         //                list_service_product[index].discount_percent_text_old = convertData(newValue,type);
         //                list_service_product[index].discount_percent = convertData(newValue,type);
         //                list_service_product[index].discount_percent_text = Number(convertData(newValue,type )).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
         //                break;
         //             case "percent":
         //                list_service_product[index].discount_percent_old = newValue;
         //                list_service_product[index].discount_percent_text_old = newValue;
         //                list_service_product[index].discount_percent = newValue;
         //                list_service_product[index].discount_percent_text = Number(newValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

         //                list_service_product[index].discount_old = convertData(newValue,type);
         //                list_service_product[index].discount_text_old = convertData(newValue,type);
         //                list_service_product[index].discount = convertData(newValue,type);
         //                list_service_product[index].discount_text = Number(convertData(newValue,type)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
         //                break;

         //             default:
         //                break;
         //          }

         //       } else {
         //          list_service_product[index].discount = list_service_product[index].discount_old;
         //          list_service_product[index].discount_text = Number(list_service_product[index].discount_text_old).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
         //          list_service_product[index].discount_percent = list_service_product[index].discount_percent_old;
         //          list_service_product[index].discount_percent_text = Number(list_service_product[index].discount_percent_old_text).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
         //          message.warning(data.data)
         //       }
         //    }
         // } else {
         //    switch (type) {
         //       case "bath":
         //          list_service_product[index].discount = null;
         //          list_service_product[index].discount_text = null;
         //          break;
         //       case "percent":
         //          list_service_product[index].discount_percent = null;
         //          list_service_product[index].discount_percent_text = null;
         //          break;

         //       default:
         //          break;
         //    }
         //    // list_service_product[index].discount_text = null;
         //    // list_service_product[index].discount_percent_text = null;
         // }


         calculateResult(index)
         form.setFieldsValue({
            list_service_product
         })
         // onFinish(form.getFieldValue(), true)
      } catch (error) {
         console.log('error', error)
      }
   }

   const onBlurRepairman = async (value, index) => {
      try {
         const { id, shop_id, list_service_product } = form.getFieldValue();
         const product_data = list_service_product[index];
         const repairman = value;
         const model = {
            shop_id,
            product_id: product_data.product_id,
            warehouse_detail: {
               warehouse: product_data.warehouse_id,
               shelf: [
                  {
                     item: product_data.shelf_code, // num shelf 1,
                     dot_mfd: product_data.dot_mfd != "-" ? product_data.dot_mfd : null, // UUID ของหน่อยซื้อ,
                     purchase_unit_id: product_data.purchase_unit_id,
                     // purchase_unit_id: "103790b2-e9ab-411b-91cf-a22dbf624cbc",
                     amount: product_data.amount, // จำนวนสินค้า
                     discount: product_data.discount, // ส่วนลด
                     repairman, // ช่างซ่อม
                  }
               ]
            },
            amount: product_data.amount,
            doc_sale_id: id,
            details: product_data
         }
         if (!product_data.id) {
            const { data } = await API.post(`/shopSalesOrderPlanLogs/add`, model);
            if (data.status == "success") {
               // console.log('data', data.data.id)
               list_service_product[index].id = data.data.id;
               list_service_product[index].repairman_old = value;
            } else {
               list_service_product[index].repairman = null;
               message.warning(data.data)
            }

         } else {
            const { data } = await API.put(`/shopSalesOrderPlanLogs/put/${product_data.id}`, model);
            if (data.status == "success") {
               list_service_product[index].repairman_old = value;
            } else {
               list_service_product[index].repairman = list_service_product[index].repairman_old;
               message.warning(data.data)
            }
         }

         form.setFieldsValue({
            list_service_product
         })
         onFinish(form.getFieldValue(), true)
      } catch (error) {
         console.log('error', error)
      }
   }

   const onBlurPrice = (value, index, type) => {
      const newValue = value.replaceAll(",", "")
      const { list_service_product, price } = form.getFieldValue();

      const validate = newValue.match(new RegExp(/^\d+(\.\d+)*$/)) //match แค่ตัวเลขกับจุด(.) เท่านั้น

      if (index >= 0 && list_service_product[index] && validate != null) {
         price = Number(newValue)
         list_service_product[index][type] = price.toString()
         list_service_product[index][`${type}_text`] = price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
         calculateResult(index, "each_total_price", type)
         let discountValue
         let dicountType

         if (list_service_product[index]["discount_percent"]) {
            discountValue = list_service_product[index]["discount_percent"]
            dicountType = "percent"
         } else {
            discountValue = list_service_product[index]["discount"]
            dicountType = "bath"
         }
         onBlurDiscount(discountValue ?? 0, index, dicountType ?? "percent")
      } else {
         list_service_product[index][type] = null
         list_service_product[index][`${type}_text`] = null
      }

   }


   const addTable = async (add) => {
      try {
         if (mode === "add" && isFunction(handleOk)) {
            Swal.fire({
               title: GetIntlMessages("ต้องการเพิ่มรายการสินค้าหรือไม่ ? (สถานะจะมีการเปลี่ยนแปลง) "),
               text: GetIntlMessages(`ถ้ากด "ตกลง" จะเป็นการสร้าง ${permission_obj.id === "8a5e3ee8-fe25-4d40-a8c2-6cb9a2314343" ? `"ใบสั่งขาย"` : `"ใบสั่งซ่อม"`} ทันที และสถานะจะเปลี่ยนไป "แก้ไขข้อมูล" , ถ้ากด "ยกเลิก" ใบสั่งขายจะไม่ถูกสร้าง !!`),
               showDenyButton: true,
               showCancelButton: false,
               confirmButtonText: GetIntlMessages("ตกลง"),
               denyButtonText: GetIntlMessages("ยกเลิก"),
            }).then((result) => {
               /* Read more about isConfirmed, isDenied below */
               if (result.isConfirmed) {
                  handleOk(-1)
               }
               // else if (result.isDenied) {
               //   Swal.fire('Changes are not saved', '', 'info')
               // }
            })
            // handleOk(-1)
         } else {
            const { list_service_product } = form.getFieldValue()
            if (isArray(list_service_product) && list_service_product.length > 0) {
               if (!!list_service_product[list_service_product.length - 1].id) {
                  if (isFunction(add)) add({})
               } else {
                  Swal.fire(`รายการสินค้าที่ ${list_service_product.length} ยังกรอกข้อมูลไม่ครับถ้วน!!`, 'กรุณากรอกข้อมูลให้ครบถ้วนก่อนเพิ่มรายการต่อไป', 'error')
               }
               // if (isFunction(add)) add({})
            } else {
               if (isFunction(add)) add({})
            }

         }
      } catch (error) {
         console.log('error', error)
      }
   }

   const MatchRound = (value) => (Math.round(+value * 100) / 100).toFixed(2)
   
   return (
      <>
         <Form
            form={form}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
         >
            <Form.Item name="change_list_service_product" hidden />
            <Form.List name="list_service_product">
               {(fields, { add, remove }) => (

                  <>

                     {mode != "view" && type != 2 && type != 3 ?
                        <div className="pb-3" id="add-plus-outlined">
                           <div style={{ textAlign: "end" }}>
                              <Button onClick={() => addTable(add)} icon={<PlusOutlined />}>
                                 เพิ่มรายการ
                              </Button>
                           </div>
                        </div>
                        : null}

                     <div id='data-table'>
                        <div className='table-responsive'>
                           <table className="table table-bordered">
                              <thead>
                                 <tr>
                                    <th>{GetIntlMessages(`ลำดับ`)}</th>
                                    <th>{GetIntlMessages(`รหัสสินค้า`)}</th>
                                    <th>{GetIntlMessages(`ชื่อสินค้า`)}</th>
                                    {isShowShopStockBtn ? <th>{GetIntlMessages(`ดูคลังสินค้า`)}</th> : null}
                                    {/* <th>{GetIntlMessages(`หน่วยสินค้า`)}</th> */}
                                    <th>{GetIntlMessages(`ราคาทุน/หน่วย`)}</th>
                                    <th>{GetIntlMessages(`ราคาขาย/หน่วย`)}</th>
                                    <th>{GetIntlMessages(`DOT/MFD`)}</th>
                                    <th>{GetIntlMessages(`คลังที่อยู่`)}</th>
                                    <th>{GetIntlMessages(`ชั้นวางสินค้า`)}</th>
                                    <th>{GetIntlMessages(`หน่วยซื้อ`)}</th>
                                    <th>{GetIntlMessages(`จำนวนคงคลัง`)}</th>
                                    <th>{GetIntlMessages(`จำนวน`)}</th>
                                    <th>{GetIntlMessages(`ส่วนลด(บาท)/หน่วย`)}</th>
                                    <th>{GetIntlMessages(`ส่วนลด(%)/หน่วย`)}</th>
                                    <th>{GetIntlMessages(`ยอดรวม`)}</th>
                                    {/* {type != 4 ? <th>{GetIntlMessages(`ช่างซ่อม`)}</th> : null} */}
                                    <th>{GetIntlMessages(`remark`)}</th>
                                    {mode != "view" && type != 2 && type != 3 ? <th>{GetIntlMessages(`แก้ไขข้อมูล`)}</th> : null}
                                    {mode != "view" && type != 2 && type != 3 ? <th>{GetIntlMessages(`manage`)}</th> : null}
                                 </tr>
                              </thead>
                              <tbody>
                                 {
                                    fields.length > 0 ?
                                       fields.map((field, index) => (
                                          <tr key={`key-${index}`}>
                                             <td>{index + 1}</td>
                                             <td>
                                                <Form.Item
                                                   {...field}
                                                   validateTrigger={['onChange', 'onBlur']}
                                                   name={[field.name, "shop_stock_id"]}
                                                   fieldKey={[field.fieldKey, "shop_stock_id"]}
                                                   noStyle={isTableNoStyle}
                                                >
                                                   <Select
                                                      showSearch
                                                      showArrow={false}
                                                      onSearch={(value) => debounceOnSearch(value, index)}
                                                      onChange={(value) => selectProduct(value, index)}
                                                      filterOption={(inputValue, option) => option?.children.toLowerCase().search(inputValue?.toLowerCase()) !== -1}
                                                      notFoundContent={null}
                                                      style={{ width: "100%" }}
                                                      disabled={getValue(index, "id") || mode == "view"}
                                                   >
                                                      {getArrListValue(index, "list_shop_stock").map((e, i) => <Select.Option value={e.id} key={`product-code-${i}-${e.id}`}>{get(e, `ShopProduct.Product.master_path_code_id`, "-")}</Select.Option>)}
                                                   </Select>
                                                </Form.Item>
                                             </td>
                                             <td>
                                                <Row gutter={[20, 10]}>
                                                   <Col span={!!form.getFieldValue().list_service_product[index]?.shop_stock_id ? 17 : 24}>
                                                      {/* {checkInputChangedName(index)} */}
                                                      {!!form.getFieldValue().list_service_product[index]?.shop_stock_id && form.getFieldValue().list_service_product[index]?.changed_name_status === true ?
                                                         <Form.Item
                                                            {...field}
                                                            validateTrigger={['onChange', 'onBlur']}
                                                            name={[field.name, "changed_product_name"]}
                                                            fieldKey={[field.fieldKey, "changed_product_name"]}
                                                            noStyle={isTableNoStyle}
                                                         >
                                                            <Input placeholder={GetIntlMessages('ชื่อที่เปลี่ยน')} disabled={mode === "view"} style={{ width: "100%", height: "auto", wordWrap: "break-word" }} />
                                                         </Form.Item>

                                                         :
                                                         <Form.Item
                                                            {...field}
                                                            validateTrigger={['onChange', 'onBlur']}
                                                            name={[field.name, "shop_stock_id"]}
                                                            fieldKey={[field.fieldKey, "shop_stock_id"]}
                                                            noStyle={isTableNoStyle}
                                                         >
                                                            <Select
                                                               showSearch
                                                               showArrow={false}
                                                               onSearch={(value) => debounceOnSearch(value, index)}
                                                               // onSearch={(value) => handleSearchShopStock(value, index)}
                                                               onChange={(value) => selectProduct(value, index)}
                                                               filterOption={false}
                                                               notFoundContent={null}
                                                               style={{ width: "100%", height: "auto", wordWrap: "break-word" }}
                                                               disabled={getValue(index, "id") || mode == "view"}
                                                               dropdownMatchSelectWidth={false}
                                                            >
                                                               {getArrListValue(index, "list_shop_stock").map(e => <Select.Option value={e.id} key={`product-name-${e.id}`}>{get(e, `ShopProduct.Product.product_name.${[locale.locale]}`, "-")}</Select.Option>)}
                                                            </Select>
                                                         </Form.Item>
                                                      }

                                                   </Col>
                                                   {!!form.getFieldValue().list_service_product[index]?.shop_stock_id ?
                                                      <Col span={7}>
                                                         <Form.Item
                                                            {...field}
                                                            validateTrigger={['onChange', 'onBlur']}
                                                            name={[field.name, "changed_name_status"]}
                                                            fieldKey={[field.fieldKey, "changed_name_status"]}
                                                            noStyle={isTableNoStyle}
                                                         >
                                                            <Switch disabled={mode === "view"} unCheckedChildren={GetIntlMessages("ไม่เปลี่ยนชื่อ")} checkedChildren={GetIntlMessages("เปลี่ยนชื่อ")} checked={form.getFieldValue()?.list_service_product[index]?.changed_name_status} onChange={(bool) => isOnChangeProductName(bool, index)} />
                                                         </Form.Item>
                                                      </Col>
                                                      : null}
                                                </Row>



                                             </td>
                                             {/* <td>
                                                {getValue(index, "unit")}
                                             </td> */}
                                             {isShowShopStockBtn ?
                                                <td>
                                                   <ModalViewShopStock shopStockId={form.getFieldValue(["list_service_product"])[index]?.shop_stock_id ?? null} />
                                                </td>
                                                : null}

                                             <td style={{ textAlign: "end" }}>
                                                {Number(getValue(index, "product_cost")) != 0 ? Number(getValue(index, "product_cost")).toLocaleString() : null}
                                             </td>
                                             <td style={{ textAlign: "end" }}>
                                                {/* {Number(getValue(index, "price")).toLocaleString()} */}
                                                <Form.Item
                                                   {...field}
                                                   validateTrigger={['onChange', 'onBlur']}
                                                   name={[field.name, "price_text"]}
                                                   fieldKey={[field.fieldKey, "price_text"]}
                                                   rules={[{ pattern: /^(?!,$)[\d,.]+$/, message: GetIntlMessages("ตัวเลขเท่านั้น") }]} //pattern -> match แค่ตัวเลข,จุด(.)และ comma(,) เท่านั้น
                                                   noStyle={isTableNoStyle}
                                                >
                                                   <Input style={{ textAlign: "end", border: form.getFieldValue()?.list_service_product[index]?.price_text == "0.00" ? "1px solid #ffcc00" : "" }} onBlur={(event) => onBlurPrice(event.target.value, index, "price")} disabled={mode === "view" || type == 2 || type == 3} />
                                                </Form.Item>
                                             </td>

                                             <td>
                                                <Form.Item
                                                   {...field}
                                                   validateTrigger={['onChange', 'onBlur']}
                                                   name={[field.name, "dot_mfd"]}
                                                   fieldKey={[field.fieldKey, "dot_mfd"]}
                                                   noStyle={isTableNoStyle}
                                                >
                                                   <Select
                                                      showArrow={false}
                                                      showSearch
                                                      filterOption={(input, option) =>
                                                         option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                      }
                                                      style={{ width: "100%" }}
                                                      onChange={(value) => selectDotMfd(value, index)}
                                                      disabled={getValue(index, "id") || mode == "view"}
                                                   >
                                                      {getArrListValue(index, "dot_mfd_list").map(e => <Select.Option value={e} key={`dot-mfd-${index}-${e}`}>{e}</Select.Option>)}
                                                   </Select>
                                                </Form.Item>
                                             </td>
                                             <td>
                                                <Form.Item
                                                   {...field}
                                                   validateTrigger={['onChange', 'onBlur']}
                                                   name={[field.name, "warehouse_id"]}
                                                   fieldKey={[field.fieldKey, "warehouse_id"]}
                                                   noStyle={isTableNoStyle}
                                                >
                                                   <Select onChange={(value) => selectWarehouse(value, index)} style={{ width: "100%" }} disabled={getValue(index, "id") || mode == "view"}>
                                                      {getArrListValue(index, "warehouse_list").map(e => <Select.Option value={e.id} key={`warehouse-${index}-${e.id}`}>{e.name[locale.locale]}</Select.Option>)}
                                                   </Select>
                                                </Form.Item>
                                             </td>
                                             <td>
                                                <Form.Item
                                                   {...field}
                                                   validateTrigger={['onChange', 'onBlur']}
                                                   name={[field.name, "shelf_code"]}
                                                   fieldKey={[field.fieldKey, "shelf_code"]}
                                                   noStyle={isTableNoStyle}
                                                >
                                                   <Select onChange={(value) => selectShelfCode(value, index)} style={{ width: "100%" }} disabled={getValue(index, "id") || mode == "view"}>
                                                      {getArrListValue(index, "shelf_list").map(e => <Select.Option value={e.code} key={`shelf-${index}-${e.code}`}>{e.name[locale.locale]}</Select.Option>)}
                                                   </Select>
                                                </Form.Item>
                                             </td>
                                             <td>
                                                <Form.Item
                                                   {...field}
                                                   validateTrigger={['onChange', 'onBlur']}
                                                   name={[field.name, "purchase_unit_id"]}
                                                   fieldKey={[field.fieldKey, "purchase_unit_id"]}
                                                   noStyle={isTableNoStyle}
                                                >
                                                   <Select style={{ width: "100%" }} disabled={getValue(index, "id") || mode == "view"} onChange={(value) => selectPurchaseUit(value, index)}>
                                                      {getArrListValue(index, "purchase_unit_list").map(e => <Select.Option value={e.id} key={`purchase-unit-${index}-${e.id}`}>{e.type_name[locale.locale]}</Select.Option>)}
                                                   </Select>
                                                </Form.Item>
                                             </td>

                                             <td style={{ textAlign: "end" }}>
                                                {/* {console.log('Number(getValue(index, "balance")).toLocaleString()', Number(getValue(index, "balance"))) } */}
                                                {Number(getValue(index, "balance")) != 0 ? Number(getValue(index, "balance")).toLocaleString() : null}
                                             </td>
                                             <td>
                                                <Form.Item
                                                   {...field}
                                                   validateTrigger={['onChange', 'onBlur']}
                                                   name={[field.name, "amount"]}
                                                   fieldKey={[field.fieldKey, "amount"]}
                                                   noStyle={isTableNoStyle}
                                                >
                                                   <Input style={{ textAlign: "end" }} min={1} type={"number"} onBlur={(event) => onBlurAmount(event.target.value, index)} onChange={(e) => (calculateResult(index))} disabled={mode === "view" || type == 2 || type == 3} />
                                                </Form.Item>
                                             </td>
                                             <td style={{ textAlign: "end" }}>
                                                <Form.Item
                                                   {...field}
                                                   validateTrigger={['onChange', 'onBlur']}
                                                   name={[field.name, "discount_text"]}
                                                   fieldKey={[field.fieldKey, "discount_text"]}
                                                   rules={[{ pattern: /^(?!,$)[\d,.]+$/, message: GetIntlMessages("ตัวเลขเท่านั้น") }]} //pattern -> match แค่ตัวเลข,จุด(.)และ comma(,) เท่านั้น
                                                   noStyle={isTableNoStyle}
                                                >
                                                   <Input style={{ textAlign: "end" }} onBlur={(event) => onBlurDiscount(event.target.value, index, "bath")} disabled={mode === "view" || type == 2 || type == 3} />
                                                </Form.Item>
                                             </td>
                                             <td style={{ textAlign: "end" }}>
                                                <Form.Item
                                                   {...field}
                                                   validateTrigger={['onChange', 'onBlur']}
                                                   name={[field.name, "discount_percent_text"]}
                                                   fieldKey={[field.fieldKey, "discount_percent_text"]}
                                                   rules={[{ pattern: /^(?!,$)[\d,.]+$/, message: GetIntlMessages("ตัวเลขเท่านั้น") }]} //pattern -> match แค่ตัวเลข,จุด(.)และ comma(,) เท่านั้น
                                                   noStyle={isTableNoStyle}
                                                >
                                                   <Input style={{ textAlign: "end" }} onBlur={(event) => onBlurDiscount(event.target.value, index, "percent")} disabled={mode === "view" || type == 2 || type == 3} />
                                                </Form.Item>
                                             </td>
                                             {/* <td style={{ textAlign: "end" }}>
                                                <Form.Item
                                                   {...field}
                                                   validateTrigger={['onChange', 'onBlur']}
                                                   name={[field.name, "discount"]}
                                                   fieldKey={[field.fieldKey, "discount"]}
                                                >
                                                   <Input style={{textAlign : "end"}} type={"number"} onBlur={(event) => onBlurDiscount(event.target.value, index)} disabled={mode === "view" || type == 2 || type == 3} />
                                                </Form.Item>
                                             </td> */}
                                             <td style={{ textAlign: "end" }}>
                                                {Number(getValue(index, "each_total_price")) != 0 ? Number(getValue(index, "each_total_price")).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : null}
                                             </td>
                                             {/* {type != 4 ? <td>
                                                <Form.Item
                                                   {...field}
                                                   validateTrigger={['onChange', 'onBlur']}
                                                   name={[field.name, "repairman"]}
                                                   fieldKey={[field.fieldKey, "repairman"]}
                                                >
                                                   <Input onBlur={(event) => onBlurRepairman(event.target.value, index)} disabled={mode === "view" || type == 2 || type == 3} />
                                                </Form.Item>
                                             </td> : null} */}
                                             <td style={{ textAlign: "end" }}>
                                                <Form.Item
                                                   {...field}
                                                   validateTrigger={['onChange', 'onBlur']}
                                                   name={[field.name, "each_remark_list_service_product"]}
                                                   fieldKey={[field.fieldKey, "each_remark_list_service_product"]}
                                                   // rules={[{ pattern: /^(?!,$)[\d,.]+$/, message: GetIntlMessages("ตัวเลขเท่านั้น") }]} //pattern -> match แค่ตัวเลข,จุด(.)และ comma(,) เท่านั้น
                                                   noStyle={isTableNoStyle}
                                                >
                                                   <Input style={{ textAlign: "start" }} disabled={mode === "view" || type == 2 || type == 3} />
                                                </Form.Item>
                                             </td>
                                             {mode != "view" && type != 2 && type != 3 ?
                                                <td style={{ textAlign: "center" }}>
                                                   <Popconfirm disabled={!form.getFieldValue().list_service_product[index].id} title={`ต้องการที่จะแก้ไขข้อมูลนี้หรือไม่ !?`} onConfirm={() => changeListServiceProduct(remove, field.name, index)} okText={'ตกลง'} cancelText={'ยกเลิก'}>
                                                      <Button disabled={!form.getFieldValue().list_service_product[index].id} icon={<EditOutlined style={{ fontSize: 18 }} />}>
                                                         แก้ไขรายการ
                                                      </Button>
                                                   </Popconfirm>
                                                </td>
                                                : null}
                                             {mode != "view" && type != 2 && type != 3 ?
                                                <td style={{ textAlign: "center" }}>
                                                   <Popconfirm title={`ต้องการที่จะลบข้อมูลนี้หรือไม่ !?`} onConfirm={() => removeListServiceProduct(remove, field.name, index)} okText={'ตกลง'} cancelText={'ยกเลิก'}>
                                                      <Button icon={<MinusCircleOutlined />}>
                                                         ลบรายการ
                                                      </Button>
                                                   </Popconfirm>
                                                </td>
                                                : null}
                                          </tr>
                                       )) :
                                       <tr>
                                          <td colSpan="13">ไม่มีข้อมูล กดเพิ่มรายการ</td>
                                       </tr>
                                 }
                              </tbody>
                           </table>
                        </div>
                     </div>
                  </>
               )}
            </Form.List>
         </Form>

         <Fieldset legend={GetIntlMessages("สรุปรายการ")} className="pb-3">
            <Form
               form={form}
               onFinish={onFinish}
               onFinishFailed={onFinishFailed}
               labelCol={{ span: 12 }}
               wrapperCol={{ span: 18 }}
            >
               <Row>
                  <Col lg={16} md={10} sm={10} xs={24}>
                     <Row>
                        <Col lg={12} xs={24}>
                           <Form.Item
                              labelCol={4}
                              name="remark"
                              label="หมายเหตุ"
                           >
                              <Input.TextArea rows={12} disabled={mode == "view" || type == 2 || type == 3} />
                           </Form.Item>
                        </Col>

                        <Col lg={12} xs={24}>
                           <Form.Item
                              labelCol={4}
                              name="remark_inside"
                              label="หมายเหตุ (ภายใน)"
                           >
                              <Input.TextArea rows={12} disabled={mode == "view" || type == 2 || type == 3} />
                           </Form.Item>
                        </Col>
                     </Row>

                  </Col>

                  {/* <Col lg={4} md={4} sm={4} xs={24} /> */}

                  <Col lg={{ offset: 1, span: 7 }} md={{ offset: 4, span: 10 }} sm={{ offset: 4, span: 10 }} xs={24}>
                     {/* <div> */}
                     <Form.Item name="tailgate_discount" label="ส่วนลดท้ายบิล" >
                        <Input style={{ textAlign: "end" }} onBlur={calculateResult} disabled={mode == "view" || type == 2 || type == 3} />
                     </Form.Item>
                     {/* </div> */}
                     <Form.Item name="total_text" label="รวมเป็นเงิน">
                        <Input style={{ textAlign: "end" }} disabled />
                     </Form.Item>
                     <Form.Item name="discount_text" label="ส่วนลดรวม">
                        <Input style={{ textAlign: "end" }} disabled />
                     </Form.Item>
                     <Form.Item name="total_after_discount_text" label="ราคาหลังหักส่วนลด">
                        <Input style={{ textAlign: "end" }} disabled />
                     </Form.Item>

                     {checkTaxId == "8c73e506-31b5-44c7-a21b-3819bb712321" ?
                        <Form.Item name="total_before_vat_text" label="ราคาก่อนรวมภาษี">
                           <Input style={{ textAlign: "end" }} disabled />
                        </Form.Item>
                        : null}


                     <Form.Item name="vat_text" label={`ภาษีมูลค่าเพิ่ม ${taxTypes.find(where => where.id === checkTaxId)?.detail?.tax_rate_percent ?? "7"}%`}>
                        <Input style={{ textAlign: "end" }} disabled />
                     </Form.Item>

                     <Form.Item name="net_total_text" label="จำนวนเงินรวมทั้งสิ้น">
                        <Input style={{ textAlign: "end" }} disabled />
                     </Form.Item>

                     {/* <Form.Item name="discount_text" label="ส่วนลด">
                        <Input disabled />
                     </Form.Item>
                     <Form.Item name="vat_text" label="ภาษี">
                        <Input disabled />
                     </Form.Item>
                     <Form.Item name="total_text" label="ทั้งหมด">
                        <Input disabled />
                     </Form.Item>
                     <Form.Item name="net_total_text" label="ยอดรวมสุทธิ">
                        <Input disabled />
                     </Form.Item> */}

                  </Col>
               </Row>
            </Form>

         </Fieldset>

         <style jsx global>
            {`
                   .ant-select-show-search.ant-select:not(.ant-select-customize-input)
                   .ant-select-selector {
                   height: auto;
                 }
                 .ant-select-single.ant-select-show-arrow .ant-select-selection-item {
                   white-space: normal;
                   word-break: break-all;
                 }

                `}
         </style>
      </>
   )
}

export default Tab1ServiceProduct