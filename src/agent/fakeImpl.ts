// @no-check
import {FileItem, FolderItem, FolderListRequest, NativeInterface} from "./agentType";
import {appConfig} from "../config/app";

export class FakeImpl implements NativeInterface {

    getFormData(obj) {
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

    sendRequest(url, params):any {
        url = appConfig.serverUrl + url
        let formdata = this.getFormData(params)
        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'post',
                body: formdata
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

    async uploadImage(data: any, path: string): Promise<string> {
        let res = await this.sendRequest('/upload/image', {file: data})
        return res.url;
    }

    async uploadImageUrl(url: string, path: string): Promise<string> {
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

