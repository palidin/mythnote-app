// @no-check
import {FileItem, FolderItem, FolderListRequest, NativeInterface} from "./agentType";
import {appConfig} from "../config/app";

export class FakeImpl implements NativeInterface {

    getFormData(obj) {
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

    getUploadData(obj) {
        let formData = new FormData();
        for (const [k, v] of Object.entries(obj)) {
            // @ts-ignore
            formData.set(k, v)
        }
        return formData;
    }

    read(path: string): Promise<string> {
        return this.sendRequest('/file/read', {path});
    }

    write(path: string, content: string) {
        return this.sendRequest('/file/write', {path, content})
    }

    fileList(params: FolderListRequest) {
        return this.sendRequest('/file/list', params);
    }

    fileDelete(paths: string[], deleted) {
        return this.sendRequest('/file/delete', {paths, deleted})
    }

    categoryList() {
        return this.sendRequest('/category/list', {})
    }

    categoryRename(old, name) {
        return this.sendRequest('/category/rename', {old, 'new': name})
    }

    sendRequest(url: string, params): any {
        url = appConfig.serverUrl + url
        let formdata
        let headers = {};
        if (url.includes('upload')) {
            formdata = this.getUploadData(params)
        } else {
            formdata = this.getFormData(params)
            headers = new Headers({
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
                    if (data.status !== 0) {
                        reject(data.msg)
                    }
                    resolve(data.data);
                })
                .catch(e => reject(e))
        })
    }

    async uploadImage(data: any): Promise<string> {
        let res = await this.sendRequest('/upload/image', {file: data})
        return res.url;
    }

    async uploadImageUrl(url: string): Promise<string> {
        let res = await this.sendRequest('/upload/image/url', {url})
        return res.url;
    }

    getTagFolders(): FolderItem[] {
        return [];
    }

    searchFiles(keywords: string, folder?: FolderItem): FileItem[] {
        return [];
    }
}

