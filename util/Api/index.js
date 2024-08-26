import { logout, refreshToken } from '../../redux/actions/authActions';
import Api from './Api'


const apiPost = (url, data) => {
    return new Promise((resolve, reject) => {
        Api.post(url, data).then((res) => {
            resolve(res);
        }).catch((eror) => {
            refreshToken().then((res) => {
                Api.post(url, data).then((res) => {
                    resolve(res);
                }).catch((eror) => {
                    reject(eror)
                })
            }).catch((eror) => {
                logout()
                reject(eror)
            })
        })
    });
}

const apiGet = (url, data) => {
    return new Promise((resolve, reject) => {
        Api.get(url, data).then((res) => {
            resolve(res);
        }).catch((eror) => {
            refreshToken().then((res) => {
                Api.get(url, data).then((res) => {
                    resolve(res);
                }).catch((eror) => {
                    reject(eror)
                })
            }).catch((eror) => {
                logout()
                reject(eror)
            })
        })
    });
}

const apiPut = (url, data) => {
    return new Promise((resolve, reject) => {
        Api.put(url, data).then((res) => {
            resolve(res);
        }).catch((eror) => {
            refreshToken().then((res) => {
                Api.put(url, data).then((res) => {
                    resolve(res);
                }).catch((eror) => {
                    reject(eror)
                })
            }).catch((eror) => {
                logout()
                reject(eror)
            })
        })
    });
}
const apiDelete = (url, data) => {
    return new Promise((resolve, reject) => {
        Api.delete(url, data).then((res) => {
            resolve(res);
        }).catch((eror) => {
            refreshToken().then((res) => {
                Api.delete(url, data).then((res) => {
                    resolve(res);
                }).catch((eror) => {
                    reject(eror)
                })
            }).catch((eror) => {
                logout()
                reject(eror)
            })
        })
    });
}

export default {
    post: apiPost,
    get: apiGet,
    put: apiPut,
    delete: apiDelete,
}