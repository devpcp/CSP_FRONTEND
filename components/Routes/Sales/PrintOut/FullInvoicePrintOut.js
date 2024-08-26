import { Button, Form } from 'antd';
import { useCallback, useRef, useState } from 'react'
import { get, isPlainObject } from 'lodash';
import Api from '../../../../util/Api';
import { useSelector } from 'react-redux';
import { useReactToPrint } from "react-to-print";

const FullInvoicePrintOut = ({ id }) => {
    const [form] = Form.useForm();
    const [model, setModel] = useState({});
    const { authUser } = useSelector(({ auth }) => auth);
    const { taxTypes } = useSelector(({ master }) => master);

    const printOut = async (id) => {
        try {
            console.log('id', id)
            if (id) {
                const { data } = await Api.get(`/shopSalesTransactionDoc/byid/${id}`)
                if (data.status == "success") {
                    // console.log('data :>> ', data.data);
                    data.data.doc_type_id = "e67f4a64-52dd-4008-9ef0-0121e7a65d48"
                    data.data.status = "4"
                    setFormValueData(data.data)
                }
            }
        } catch (error) {
            console.log(`error`, error)
        }
    }

    const setFormValueData = (value) => {
        // console.log('code_id', value.code_id)
        // console.log('value', value)

        const list_service_product = [];
        get(value, `details.list_service_product`, []).forEach(e => {
            // ShopSalesTransactionOuts
            const find = get(value, `details.list_service_product`, []).find(where => where.id == e.id && where.amount == e.amount);
            if (isPlainObject(find)) list_service_product.push(e)
        })


        const model = {
            id: value.id,
            code_id: value.code_id,
            search_status_2: value.code_id,
            purchase_status: value.purchase_status,
            customer_type: null, //ประเภทลูกค้า
            customer_id: null, //ชื่อลูกค้า
            customer_phone: get(value, `details.customer_phone`, null), //หมายเลขโทรศัพท์
            vehicles_customers_id: value.vehicles_customers_id, //หมายเลขโทรศัพท์
            mileage: get(value, `details.mileage`, null),
            mileage_old: get(value, `details.mileage_old`, null),
            tax_id: get(value, `details.tax_id`, null), //ประเภทภาษี
            doc_type_id: value.doc_type_id,
            status: value.status.toString(),
            user_id: authUser.id,
            shop_id: value.shop_id,
            list_service_product,
            avg_registration_day: get(value, `details.avg_registration_day`, 0),
            avg_registration_month: get(value, `details.avg_registration_day`, 0) * 30,
            remark: get(value, `details.remark`, null), //หมายเหตุ
            remark_inside: get(value, `details.remark_inside`, null), //หมายเหตุ (ภายใน)
            tailgate_discount: get(value, `details.tailgate_discount`, 0), //ส่วนลดท้ายบิล
            payment: get(value, `details.payment`, ""),
        }
        if (value.bus_customer_id) {
            model.customer_type = "business"
            model.customer_id = value.bus_customer_id
        } else if (value.per_customer_id) {
            model.customer_type = "person"
            model.customer_id = value.per_customer_id
        }
        // console.log('value', value)
        // console.log('model', model)
        form.setFieldsValue(model)
        calculateResult()
    }


    const calculateResult = async () => {
        const { list_service_product, tax_id, tailgate_discount } = form.getFieldValue();

        let total = 0, discount = 0, vat = 0, net_total = 0, total_amount = 0;

        list_service_product.forEach(e => {
            total += ((Number(e.amount ?? 0) * Number(e.price ?? 0)));
            discount += Number(e.discount ?? 0)
            total_amount += Number(e.amount ?? 0)
        });
        // console.log('list_service_product', list_service_product)
        total = total - discount

        if (tax_id && tax_id !== "fafa3667-55d8-49d1-b06c-759c6e9ab064") {
            const { detail } = whereIdArray(taxTypes.length > 0 ? taxTypes : await getTaxTypes(), tax_id);
            if (isPlainObject(detail)) {
                vat = ((total * Number(detail.tax_rate_percent)) / 100)
                total = total - vat
            }
        }

        net_total = total - Number(tailgate_discount ?? 0)

        form.setFieldsValue({
            total,
            total_text: total.toLocaleString(),

            discount,
            discount_text: discount ? discount.toLocaleString() : 0,

            net_total,
            net_total_text: net_total ? net_total.toLocaleString() : 0,

            vat,

            total_amount,
        })

        const _model = form.getFieldValue();
        console.log('_model', _model)
        setModel(_model)
    }

    const whereIdArray = (arr, id, type) => {
        return type === "index" ? arr.findIndex(where => where.id === id) : arr.find(where => where.id === id)
    }


    const componentRef = useRef(null);
    const [dataSendToComponeteToPrint, setDataSendToComponeteToPrint] = useState([]);

    const reactToPrintContent = useCallback(() => {
        return componentRef.current;
    }, [componentRef.current]);

    const handlePrint = useReactToPrint({
        content: reactToPrintContent,
    });

    return (
        <>
            <Button className='button-print' onClick={() => printOut(id)}>Print</Button>
            <div className='page-a4'>
                A4-1
            </div>
            <div className='page-a4'>
                A4-2
            </div>
            <div className='page-a4'>
                A4-3
            </div>
            <div className='page-a4'>
                A4-4
            </div>
            <div className='page-a4'>
                A4-5
            </div>


            <style jsx global>
                {`
                    .body {
                        background: rgb(204,204,204); 
                    }
                `}
            </style>
        </>
    )
}

export default FullInvoicePrintOut