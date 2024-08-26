import axios from 'axios';
import { logout, refreshToken } from '../../../../redux/actions/authActions';
import { Cookies } from 'react-cookie'
import { isFunction } from 'lodash';
import API from '../../../../util/Api'

const cookies = new Cookies();

export const CheckImage = async ({ directory, name, fileDirectoryId, type = "jpeg" }, setState) => {
    try {
        const url = `${process.env.NEXT_PUBLIC_DIRECTORY}/assets/${directory}/${name}/${fileDirectoryId}.${type}`
        await axios.get(url)
        if (isFunction(setState)) setState(url)
        return url
    } catch (error) {
        const noImg = `/assets/images/profiles/avatar.jpg`;
        if (isFunction(setState)) setState(noImg)
        return noImg
    }
}

export const ApiUpload = async (url, formData) => {
    return new Promise((resolve, reject) => {
        const token = cookies.get('access_token');
        axios({
            method: "post",
            url: `${process.env.NEXT_PUBLIC_SERVICE}${url}`,
            config: { headers: { "Content-Type": "multipart/form-data" } },
            headers: { Authorization: "Bearer " + token },
            data: formData,
        }).then((res) => {
            resolve(res);
        }).catch((eror) => {
            console.log("upload error :", eror)
            refreshToken().then((res) => {
                axios({
                    method: "post",
                    url: `${process.env.NEXT_PUBLIC_SERVICE}${url}`,
                    config: { headers: { "Content-Type": "multipart/form-data" } },
                    headers: { Authorization: "Bearer " + res },
                    data: formData,

                }).then((res) => {
                    resolve(res);
                })
            }).catch((eror) => {
                logout()
                reject(eror)
            })
        });
    });


}

export const UploadImageSingle = async (FileUpload, { name, directory, fileDirectoryId }) => {
    const formData = new FormData();
    formData.append("fileUpload", FileUpload.originFileObj);
    formData.append("fileName", name);
    formData.append("fileType", "image");
    formData.append("fileDirectory", directory);
    formData.append("fileDirectoryId", fileDirectoryId ?? name);
    return await ApiUpload(`/upload/file`, formData)
}

export const UploadImageCustomPathMultiple = async (FileUpload, { shopId, idEdit, directory, subject }) => {
    const formData = new FormData();
    formData.append("fileUpload", FileUpload.originFileObj);
    formData.append("filePath", shopId + "/" + directory + "/" + idEdit + "/" + subject);
    formData.append("fileType", "image");
    formData.append("fileDirectory", 'shops');
    return await ApiUpload(`/upload/fileCustomPath`, formData)
}

export const DeleteImageCustomPathMultiple = async (path) => {
    try {
        const { data } = await API.delete(`upload/deleteFile?path=${path}`)
        return data
    } catch (error) {
        console.log("error", error)
    }
}

export default {
    UploadImageSingle,
    ApiUpload,
    CheckImage,
    UploadImageCustomPathMultiple
}