// @no-check
import {appConfig} from "../config/app";
import {tokenManger} from "./tokenManger";

export interface FolderListRequest {
    keywords: string;
    folder: string;
    page: number;
    limit: number;
}

export class FakeImpl {

    read(path: string): Promise<string> {
        return sendRequest('/file/read', {path});
    }

    write(path: string, content: string) {
        return sendRequest('/file/write', {path, content})
    }

    fileList(params: FolderListRequest) {
        return sendRequest('/file/list', params);
    }

    fileDelete(paths: string[], deleted) {
        return sendRequest('/file/delete', {paths, deleted})
    }

    categoryList() {
        return sendRequest('/category/list', {})
    }

    categoryRename(old, name) {
        return sendRequest('/category/rename', {old, 'new': name})
    }


    async uploadImage(data: any): Promise<string> {
        let res = await sendRequest('/upload/image', {file: data})
        return res.url;
    }

    async uploadImageUrl(url: string): Promise<string> {
        let res = await sendRequest('/upload/image/url', {url})
        return res.url;
    }

    login(username, password) {
        return sendRequest('/auth/login', {username, password});
    }

    cleanup() {
        return sendRequest('/system/rebuild', {});
    }

    status() {
        return sendRequest('/system/status', {});
    }
}

function getFormData(obj) {
    let formData = [];
    for (const [k, v] of Object.entries(obj)) {
        let value = v;
        if (typeof v == 'object') {
            value = JSON.stringify(v);
        }
        // @ts-ignore
        formData.push(k + '=' + encodeURIComponent(value));
    }
    return formData.join('&');
}

function getUploadData(obj) {
    let formData = new FormData();
    for (const [k, v] of Object.entries(obj)) {
        // @ts-ignore
        formData.set(k, v)
    }
    return formData;
}

function sendRequest(path: string, params, withToken = true): any {

    let url = appConfig.serverUrl + path
    let formdata
    let headers = {};
    let token = '';
    if (withToken) {
        token = tokenManger.getToken();
    }
    if (url.includes('upload')) {
        formdata = getUploadData(params)
        headers = new Headers({
            'Authorization': token
        })
    } else {
        formdata = getFormData(params)
        headers = new Headers({
            'Authorization': token,
            'content-type': 'application/x-www-form-urlencoded'
        })
    }
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'post',
            body: formdata,
            headers
        })
            .then(async res => {
                let data = await res.json()
                if (!('status' in data)) {
                    reject('服务器连接失败')
                }

                if (data.status == 401) {
                    return tokenManger.refreshToken()
                        .then(() => {
                            return tokenManger.tokenTaskLoop()
                        })
                        .then(() => {
                            return sendRequest(path, params)
                        })
                        .then((proxyData) => {
                            console.log(proxyData)
                            resolve(proxyData)
                        })
                }
                if (data.status !== 0) {
                    reject(data.msg)
                }
                resolve(data.data);
            })
            .catch(e => reject(e))
    })
}