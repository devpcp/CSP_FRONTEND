import { useSelector } from "react-redux";
import { Tooltip, Popconfirm, Button } from "antd"
import { CheckCircleOutlined, CloseCircleOutlined, StopOutlined } from '@ant-design/icons';

const ChangeStatusComponents = ({ isuse, changeStatus, id }) => {

    const { permission_obj } = useSelector(({ permission }) => permission);
    return (
        <>
            {permission_obj.update ?
                isuse == 0 ? (

                    <Tooltip placement="bottom" title={`สถานะปิดกั้น`}>
                        <Popconfirm placement="top" title={"ยืนยันการเปลี่ยนสถานะเป็น 'สถานะปกติ' !?"} onConfirm={() => changeStatus(1, id)} okText="ตกลง" cancelText="ยกเลิก">
                            <Button type="link"><StopOutlined style={{ color: 'orange', fontSize: 27 }} /></Button>
                        </Popconfirm>
                    </Tooltip>

                ) : isuse == 1 ? (

                    <Tooltip placement="bottom" title={`สถานะปกติ`}>
                        <Popconfirm placement="top" title={"ยืนยันการเปลี่ยนสถานะเป็น 'สถานะปิดกั้น' !?"} onConfirm={() => changeStatus(0, id)} okText="ตกลง" cancelText="ยกเลิก">
                            <Button type="link"><CheckCircleOutlined style={{ color: 'green', fontSize: 27 }} /></Button>
                        </Popconfirm>
                    </Tooltip>

                ) : isuse == 2 ? (

                    <Tooltip placement="bottom" title={`ถังขยะ`}>
                        <Popconfirm placement="top" title={"ยืนยันการเปลี่ยนสถานะเป็น 'สถานะปกติ' !?"} onConfirm={() => changeStatus(1, id)} okText="ตกลง" cancelText="ยกเลิก">
                            <Button type="link"><CloseCircleOutlined style={{ color: 'red', fontSize: 27 }} /></Button>
                        </Popconfirm>
                    </Tooltip>

                ) : null
                :
                isuse == 0 ? (
                    <Button type="link"><StopOutlined style={{ color: 'orange', fontSize: 27 }} /></Button>
                ) : isuse == 1 ? (
                    <Button type="link"><CheckCircleOutlined style={{ color: 'green', fontSize: 27 }} /></Button>
                ) : isuse == 2 ? (
                    <Button type="link"><CloseCircleOutlined style={{ color: 'red', fontSize: 27 }} /></Button>
                ) : null}
        </>
    )
}

export default ChangeStatusComponents
