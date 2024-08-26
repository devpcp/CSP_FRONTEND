import { CheckCircleOutlined, CloseCircleOutlined, StopOutlined, ClockCircleOutlined, PrinterOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Table, Tooltip, Popover } from "antd";
import { isArray, isFunction, isPlainObject } from "lodash";
import moment from "moment";
import { useEffect, useState, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import GetIntlMessages from "../../../util/GetIntlMessages";
import ButtonMoreOutlined from "../ButtonMoreOutlined";
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { v4 as uuidv4 } from 'uuid';
import PrintOut from "../PrintOut";

const TableListSharesComponents = ({ className, columns, data, loading, configTable, callbackSearch, addEditViewModal, changeStatus, isUseHandleBlockOnManage = false, objId = "id", callbackMove, isUseSwalFireOnDel, docTypeId, docStatus, specificFunction, showPrintOutButton = { status: false, morePrintOuts: {} }, hideManagement = false }) => {

    const { permission_obj } = useSelector(({ permission }) => permission);
    const [columnTable, setColumnTable] = useState([])
    const { authUser } = useSelector(({ auth }) => auth);

    if (isPlainObject(specificFunction)) var { onClickPayment, callBackInvoices } = specificFunction

    if (authUser?.UsersProfile?.ShopsProfile?.shop_config?.enable_ShopSalesTransaction_legacyStyle) var { enable_ShopSalesTransaction_legacyStyle } = authUser?.UsersProfile?.ShopsProfile?.shop_config

    useEffect(() => {
        /* created_by */
        if (isPlainObject(configTable.column) && configTable.column.created_by) {
            if (isArray(columns)) {
                columns[columns.length] = {
                    title: GetIntlMessages("created-by"),
                    dataIndex: 'created_by',
                    key: 'created_by',
                    width: 150,
                }
            }
        }

        /* created_date */
        if (isPlainObject(configTable.column) && configTable.column.created_date) {
            if (isArray(columns)) {
                columns[columns.length] = {
                    title: GetIntlMessages("created-date"),
                    dataIndex: 'created_date',
                    key: 'created_date',
                    width: 150,
                    render: (text, record) => text ? moment(text).format("DD/MM/YYYY HH:mm:ss") : "-",
                }
            }
        }

        /* updated_by */
        if (isPlainObject(configTable.column) && configTable.column.updated_by) {
            if (isArray(columns)) {
                columns[columns.length] = {
                    title: GetIntlMessages("updated-by"),
                    dataIndex: 'updated_by',
                    key: 'updated_by',
                    width: 150,
                    render: (text, record) => text ? text : "-",
                }
            }
        }

        /* updated_date */
        if (isPlainObject(configTable.column) && configTable.column.updated_date) {
            if (isArray(columns)) {
                columns[columns.length] = {
                    title: GetIntlMessages("updated-date"),
                    dataIndex: 'updated_date',
                    key: 'updated_date',
                    width: 150,
                    render: (text, record) => text ? moment(text).format("DD/MM/YYYY HH:mm:ss") : "-",
                }
            }
        }

        /* สถานะ */
        if (isPlainObject(configTable.column) && configTable.column.status) {
            if (isArray(columns)) {
                columns[columns.length] = {
                    title: GetIntlMessages("status"),
                    dataIndex: 'isuse',
                    key: 'isuse',
                    width: 100,
                    align: "center",
                    render: (item, obj, index) => (
                        <>
                            {item == 0 ? (

                                permission_obj.update && isFunction(changeStatus) ? (
                                    <Tooltip placement="bottom" title={configTable?.title?.not_use_system ? configTable.title.not_use_system : `สถานะปิดกั้น`}>
                                        <Popconfirm disabled={(configTable?.disabled?.active_btn ?? false) || (obj?.disabled_change_status ?? false)} placement="top" title={configTable.title ? `ยืนยันการเปลี่ยนสถานะเป็น '${configTable.title.use_system}' !?` : "ยืนยันการเปลี่ยนสถานะเป็น 'สถานะปกติ' !?"} onConfirm={() => changeStatus(1, obj[objId])} okText="ตกลง" cancelText="ยกเลิก">
                                            <Button type="link"><StopOutlined style={{ color: 'orange', fontSize: 27 }} /></Button>
                                        </Popconfirm>
                                    </Tooltip>
                                ) : <StopOutlined style={{ color: 'orange', fontSize: 27 }} />

                            ) : item == 1 ? (

                                permission_obj.update && isFunction(changeStatus) ? (
                                    <Tooltip placement="bottom" title={configTable?.title?.use_system ? configTable.title.use_system : `สถานะปกติ`}>
                                        <Popconfirm disabled={(configTable?.disabled?.active_btn ?? false) || (obj?.disabled_change_status ?? false)} placement="top" title={configTable.title ? `ยืนยันการเปลี่ยนสถานะเป็น '${configTable.title.not_use_system}' !?` : "ยืนยันการเปลี่ยนสถานะเป็น 'สถานะปิดกั้น' !?"} onConfirm={() => changeStatus(0, obj[objId])} okText="ตกลง" cancelText="ยกเลิก">
                                            <Button type="link"><CheckCircleOutlined style={{ color: 'green', fontSize: 27 }} /></Button>
                                        </Popconfirm>
                                    </Tooltip>
                                ) : <CheckCircleOutlined style={{ color: 'green', fontSize: 27 }} />

                            ) : item == 2 ? (

                                permission_obj.update && isFunction(changeStatus) ? (
                                    <Tooltip placement="bottom" title={`ถังขยะ`}>
                                        <Popconfirm disabled={(configTable?.disabled?.active_btn ?? false) || (obj?.disabled_change_status ?? false)} placement="top" title={configTable?.title?.use_system ? `ยืนยันการเปลี่ยนสถานะเป็น '${configTable.title.use_system}' !?` : "ยืนยันการเปลี่ยนสถานะเป็น 'สถานะปกติ' !?"} onConfirm={() => changeStatus(1, obj[objId])} okText="ตกลง" cancelText="ยกเลิก">
                                            <Button type="link"><CloseCircleOutlined style={{ color: 'red', fontSize: 27 }} /></Button>
                                        </Popconfirm>
                                    </Tooltip>
                                ) : <CloseCircleOutlined style={{ color: 'red', fontSize: 27 }} />

                            ) : null}
                        </>
                    )
                }
            }
        }

        if ((permission_obj.read || permission_obj.update || permission_obj.delete) && configTable.hide_manage !== true) {
            /* จัดการ */
            if (isArray(columns)) {
                // if (isArray(data)) {
                //     if (docTypeId === "67c45df3-4f84-45a8-8efc-de22fef31978" || docTypeId === "7ef3840f-3d7f-43de-89ea-dce215703c16") {
                //         if(docStatus.status === "default" || docStatus.status === "2" || docStatus.status === "3" || enable_ShopSalesTransaction_legacyStyle){
                //             columns[columns.length] = {
                //                 title: GetIntlMessages("การชำระเงิน"),
                //                 dataIndex: '',
                //                 key: '',
                //                 fixed: 'right',
                //                 align: 'center',
                //                 width: 150,
                //                 render: (text, record) => text.status == 2 || text.status == 3 || text.status == 4 ? text.purchase_status ? <span className='color-green font-16'>ชำระแล้ว</span> : <span className='color-red font-16 cursor-pointer' onClick={() => isFunction(onClickPayment) ? onClickPayment(record) : null}>ยังไม่ชำระ</span> : text.status == 1 ? <Popover content={GetIntlMessages("อยู่ระหว่างดำเนินการ")}> <ClockCircleOutlined style={{ color: 'orange', fontSize: 27 }} /></Popover> : <Popover content={GetIntlMessages("cancel")}> <CloseCircleOutlined style={{ color: 'red', fontSize: 27 }} /></Popover>,
                //             }
                //             columns[columns.length] = {
                //               title: GetIntlMessages("print"),
                //               dataIndex: "",
                //               key: "",
                //               fixed: "right",
                //               align: "center",
                //               width: 250,
                //               // render : (text, record) => console.log('text :>> ', text),
                //               render: (text, record) =>
                //                 text.status == 3 || text.status == 4 ? (
                //                   <Button
                //                     type="primary"
                //                     onClick={() =>
                //                       isFunction(callBackInvoices)
                //                         ? callBackInvoices(
                //                             record.id,
                //                             record.status,
                //                             record
                //                           )
                //                         : null
                //                     }
                //                   >
                //                     <PrinterOutlined
                //                       style={{ fontSize: "20px" }}
                //                     />
                //                     {text.purchase_status === false
                //                       ? GetIntlMessages(
                //                         enable_ShopSalesTransaction_legacyStyle === true ? `ใบส่งสินค้าชั่วคราว` :`ใบส่งสินค้า/ใบแจ้งหนี้`
                //                         )
                //                       : authUser?.UsersProfile?.ShopsProfile
                //                           ?.id ===
                //                         "1a523ad4-682e-4db2-af49-d54f176a84ad"
                //                       ? GetIntlMessages(
                //                           `ใบส่งสินค้า`
                //                         )
                //                       : GetIntlMessages(
                //                         enable_ShopSalesTransaction_legacyStyle === true ? `ใบกำกับภาษี` : `ใบเสร็จรับเงิน/ใบกำกับภาษี`
                //                         )}
                //                   </Button>
                //                 ) : text.status == 2 ? (
                //                   <Button
                //                     type="primary"
                //                     onClick={() =>
                //                       isFunction(callBackInvoices)
                //                         ? callBackInvoices(
                //                             record.id,
                //                             record.status,
                //                             record
                //                           )
                //                         : null
                //                     }
                //                   >
                //                     <PrinterOutlined
                //                       style={{ fontSize: "20px" }}
                //                     />
                //                     {GetIntlMessages(enable_ShopSalesTransaction_legacyStyle ? `ใบส่งสินค้าชั่วคราว` :`ใบส่งสินค้า/ใบแจ้งหนี้`)}
                //                   </Button>
                //                 ) : text.status == 1 ? (
                //                   <Popover
                //                     content={GetIntlMessages(
                //                       "อยู่ระหว่างดำเนินการ"
                //                     )}
                //                   >
                //                     {" "}
                //                     <ClockCircleOutlined
                //                       style={{ color: "orange", fontSize: 27 }}
                //                     />
                //                   </Popover>
                //                 ) : (
                //                   <Popover content={GetIntlMessages("cancel")}>
                //                     {" "}
                //                     <CloseCircleOutlined
                //                       style={{ color: "red", fontSize: 27 }}
                //                     />
                //                   </Popover>
                //                 ),
                //             };
                //         }

                //     }
                // }

                {
                    if (isPlainObject(showPrintOutButton) && showPrintOutButton.status === true) {
                        columns[columns.length] = {
                            title: GetIntlMessages("print"),
                            dataIndex: '',
                            key: '',
                            fixed: 'right',
                            align: 'center',
                            width: 200,
                            render: (item, obj, index) => <PrintOut documentId={obj[objId]} morePrintOuts={showPrintOutButton.morePrintOuts} />
                        }
                    }
                }

                hideManagement === false ? columns[columns.length] = {
                    title: GetIntlMessages("manage"),
                    dataIndex: '',
                    key: '',
                    fixed: 'right',
                    align: 'center',
                    width: 100,
                    render: (item, obj, index) =>
                        <ButtonMoreOutlined item={obj}
                            handleView={() => addEditViewModal("view", obj[objId])}
                            handleEdit={() => addEditViewModal("edit", obj[objId])}
                            handleDel={isFunction(changeStatus) ? () => changeStatus(2, obj[objId]) : null}
                            isUseSwalFireOnDel={isUseSwalFireOnDel}
                            handleBlock={isFunction(changeStatus) && isUseHandleBlockOnManage ? () => changeStatus(0, obj[objId]) : null}
                        />
                } : null
            }
        }
        setColumnTable(columns)
    }, [columns])

    // Drag Drop Table -----------------------------------------------------------------
    const type = 'DraggableBodyRow';
    const DraggableBodyRow = ({ index, moveRow, className, style, ...restProps }) => {
        const ref = useRef();
        const [{ isOver, dropClassName }, drop] = useDrop({
            accept: type,
            collect: monitor => {
                const { index: dragIndex } = monitor.getItem() || {};
                if (dragIndex === index) {
                    return {};
                }
                return {
                    isOver: monitor.isOver(),
                    dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
                };
            },
            drop: item => {
                moveRow(item.index, index);
            },
        });
        const [, drag] = useDrag({
            type,
            item: { index },
            collect: monitor => ({
                isDragging: monitor.isDragging(),
            }),
        });
        drop(drag(ref));

        return (
            <tr
                ref={ref}
                className={`${className}${isOver ? dropClassName : ''}`}
                style={{ cursor: 'move', ...style }}
                {...restProps}
            />
        );
    };

    const components = {
        body: {
            row: DraggableBodyRow,
        },
    };
    const moveRow = useCallback((dragIndex, hoverIndex) => {
        const arr = [];

        function loop_push(_data, _arr) {
            _data.forEach(e => {
                if (isArray(e.children)) {
                    _arr.push(e)
                    loop_push(e.children, _arr)
                }
                else if (isArray(_arr)) _arr.push(e)
            });
        }

        loop_push(data, arr);
        const dragRow = arr.find(where => where.id == dragIndex) //ข้อมูลที่คลิกลาก
        const hoverRow = arr.find(where => where.id == hoverIndex) //ข้อมูลที่ลากวาง
        if (isPlainObject(dragRow) && isPlainObject(hoverRow)) {
            const result = [
                {
                    id: dragRow.id,
                    sort: hoverRow.sort_order,
                },
                {
                    id: hoverRow.id,
                    sort: dragRow.sort_order,
                },
            ]
            if (isFunction(callbackMove)) callbackMove(result)
        }
    }, [data]);



    const onChangeTable = async (pagination, filters, sorter) => {
        if (sorter.order !== undefined) {
            callbackSearch({
                page: pagination.current,
                limit: pagination.pageSize,
                order: sorter.order === "descend" ? "desc" : "asc",
                sort: sorter.columnKey
            })
        } else {
            callbackSearch({
                page: pagination.current,
                limit: pagination.pageSize,
            })
        }
    }


    return (
        <div id={`table-list`} className={`${className}`}>
            {configTable.move ?
                <DndProvider backend={HTML5Backend}>
                    <Table dataSource={data} columns={columnTable} rowKey={(row) => row.id ?? Math.random()} loading={loading} onRow={(record, index) => ({
                        index: record.id,
                        moveRow,
                    })} components={components} scroll={{ x: "100%", y: "100%" }}
                        pagination={{
                            showSizeChanger: true,
                            current: configTable.page,
                            total: configTable.total,
                            pageSize: configTable.limit,
                            showTotal: (total, range) => `${GetIntlMessages("data")} ${range[0]} - ${range[1]} ${GetIntlMessages("total")} ${total} ${GetIntlMessages("items")}`,
                            // onChange: async (e, _limit) => {
                            //     await callbackSearch({
                            //         page: e,
                            //         limit: _limit,
                            //     });
                            // }
                        }}
                        onChange={onChangeTable}
                    />
                </DndProvider>
                :
                <Table dataSource={data} columns={columnTable} rowKey={(row) => row?.use_fake_uuid === true ? uuidv4() : row.id ?? Math.random()} loading={loading} scroll={{ x: "100%", y: "100%" }}
                    pagination={{
                        showSizeChanger: true,
                        current: configTable.page,
                        total: configTable.total,
                        pageSize: configTable.limit,
                        showTotal: (total, range) => `${GetIntlMessages("data")} ${range[0]} - ${range[1]} ${GetIntlMessages("total")} ${total} ${GetIntlMessages("items")}`,
                        // onChange: async (e, _limit) => {
                        //     await callbackSearch({
                        //         page: e,
                        //         limit: _limit,
                        //     });
                        // }
                    }}
                    onChange={onChangeTable}
                />
            }

            <style jsx global>
                {
                    `
                    .ant-table-cell{
                        padding : 8px !important;
                    }
                    `
                }
            </style>
        </div>
    )
}

export default TableListSharesComponents
