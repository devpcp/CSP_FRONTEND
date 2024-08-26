import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Button, Upload, Modal, Image } from 'antd';
import { isArray, isFunction } from 'lodash';
import { useEffect } from 'react';
import { useState } from 'react';
// import GetIntlMessages from '../../../../util/GetIntlMessages';

export const ImageMulti = ({ name, extra, rules, label, accept, ButtonUpload, lengthUpload, callback, setFile, value, previewPicture, previewImgId, isfile, listType = "picture-card", className = "avatar-uploader", isShowRemoveIcon = true, isMultiple = false, form, disabled, mode, disabledWhenDeliveryDocActive }) => {
    // const [file, setFile] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [imgUrl, setImgUrl] = useState("");
    const [visibleImgModal, setVisibleImgModal] = useState(false);
    const [uploadRemoveList, setUploadRemoveList] = useState([])

    useEffect(() => {
        if (isArray(value)) {
            setFileList(value)
            form.setFieldsValue({ [name]: value })
        }
    }, [value]);


    const handleChange = (info) => {
        // delete info.file.originFileObj

        let fileList = [...info.fileList];
        // 1. Limit the number of uploaded files
        // Only to show two recent uploaded files, and old ones will be replaced by the new
        // fileList = fileList.slice(-1);

        if (fileList.length > 0) {
            const infoFileList = fileList[0];
            if (infoFileList.status === "done") {
                fileList = fileList.map((file) => {
                    if (file.response) {
                    }
                    return file;
                });
                if (previewPicture) {
                    if (infoFileList.originFileObj.type == "application/pdf") {
                        previewImgId ? previewImgId.src = `/img/pdf.png` : null;
                    } else {
                        const reader = new FileReader()

                        reader.onload = function () {
                            previewImgId ? previewImgId.src = reader.result : null;
                        };

                        const blobPic = new Blob([infoFileList.originFileObj])
                        reader.readAsDataURL(blobPic);
                    }
                }
            }
        }

        setFileList(fileList);
        if (fileList.length > 0) {
            if (isFunction(setFile)) {
                setFile(fileList[0]);
            }
        } else {
            if (isFunction(setFile)) {
                setFile(null);
            }
        }

        if (isFunction(callback)) {
            let previewImageId
            if (previewImgId) {
                previewImageId = previewImgId ? previewImgId : null
            }
            callback(fileList[0], previewImageId)
        }
    };

    const onPreview = async (file) => {
        let src

        if (file.url) {
            src = file.url
        } else {
            src = await new Promise((resolve) => {
                const reader = new FileReader();

                const previewImg = new Blob([file.originFileObj])

                reader.readAsDataURL(previewImg);

                reader.onload = () => resolve(reader.result);
            });
        }

        if (isfile) {
            setImgUrl(src)
            setVisibleImgModal(true)
        } else {
            const image = new Image();
            image.src = src;
            const imgWindow = window.open(src);
            imgWindow?.document.write(image.outerHTML);
        }
    }

    const handleCancleImgModal = () => {
        setImgUrl("")
        setVisibleImgModal(false)
    }

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div
                style={{
                    marginTop: 8,
                }}
            >
                อัพโหลด
            </div>
        </div>
    )

    const handleRemoveImage = async (image) => {
        const { upload_remove_list } = form.getFieldValue()
        await upload_remove_list.push(image)
        form.setFieldsValue({
            upload_remove_list: await upload_remove_list
        })
    }

    return (
        <>
            <Form.Item
                name={name}
                label={label}
                rules={rules}
                extra={extra}
                style={{ width: "100%" }}
            >
                <Upload
                    onChange={handleChange}
                    action={`${process.env.NEXT_PUBLIC_SERVICE}/post`}
                    fileList={fileList}
                    multiple={isMultiple}
                    accept={accept}
                    listType="picture-card"
                    onPreview={onPreview}
                    className="avatar-uploader"
                    showUploadList={{ showRemoveIcon: isShowRemoveIcon }}
                    disabled={disabled}
                    onRemove={handleRemoveImage}
                // className="upload-list-inline"
                >
                    {fileList.length < lengthUpload ? uploadButton : null}
                </Upload>

            </Form.Item>
            <Form.Item
                hidden={true}
                name={"upload_remove_list"}
            >

            </Form.Item>

            <Modal
                // style={{ top: 10 }}
                centered
                // title={`รูปภาพ`}
                open={visibleImgModal}
                onCancel={handleCancleImgModal}
                // okButtonProps={{ style: { display: 'none' } }}
                footer={null}
            >
                <Image src={imgUrl} style={{ width: "100%" }}/>
            </Modal>

        </>

    );
}

export default {
    ImageMulti
};
