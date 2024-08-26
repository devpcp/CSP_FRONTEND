import { UploadOutlined } from '@ant-design/icons';
import { Form, Button, Upload } from 'antd';
import { isArray, isFunction } from 'lodash';
import { useEffect } from 'react';
import { useState } from 'react';
import GetIntlMessages from '../../../../util/GetIntlMessages';

const ImageSingleShares = ({ name, extra, rules, label, accept, ButtonUpload, callback, setFile, value,previewPicture }) => {

    // const [file, setFile] = useState(null);
    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        if (isArray(value)) {
            setFileList(value)
        }
    }, [value]);


    const handleChange = (info) => {
        // delete info.file.originFileObj
        console.log('info', info)

        // const newFile =  info.file
        // console.log('newFile', newFile)
        // if (info.file && info.file.status == "done") {
        //     const previewPic = URL.createObjectURL(info.file.originFileObj)
        //     console.log('previewPic', `${previewPic}.jpeg`)
        //   }



        const fileList = [...info.fileList];
        // 1. Limit the number of uploaded files
        // Only to show two recent uploaded files, and old ones will be replaced by the new
        fileList = fileList.slice(-1);

        if (fileList.length > 0) {
            const infoFileList = fileList[0];
            if (infoFileList.status === "done") {
                fileList = fileList.map((file) => {
                    if (file.response) {
                        // console.log(`file`, file)
                    }
                    return file;
                });
                if(previewPicture){
                    const reader = new FileReader()
                    reader.onload = function () {
                        imgIcon.src = reader.result;
                    };
                    // const previewPic = URL.createObjectURL(infoFileList)
                    // console.log('previewPic',new Blob([infoFileList]) )
                    const blobPic = new Blob([infoFileList.originFileObj])
                    // const newPreviewPic = `${previewPic}.jpeg`
                    reader.readAsDataURL(blobPic);
                }
             
            }else if(fileList.length <= 0){
                imgIcon.src = ""
            }
        }

        // console.log('fileList :>> ', fileList);
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
            callback(fileList[0])
        }
    };


    return (
        <>
            <Form.Item
                name={name}
                label={label}
                rules={rules}
                extra={extra}
            >
                <Upload
                    onChange={handleChange}
                    action={`${process.env.NEXT_PUBLIC_SERVICE}/post`}
                    fileList={fileList}
                    multiple={false}
                    accept={accept}

                >
                    {ButtonUpload ?? <Button icon={<UploadOutlined />}>{GetIntlMessages("upload")}</Button>}
                </Upload>

            </Form.Item>
        </>
    );
}

export default ImageSingleShares;
