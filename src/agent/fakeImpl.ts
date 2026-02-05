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

  read(path: string): Promise<any> {
    return sendRequest('/file/read', {path});
  }

  write(path: string, content: string, props: Record<string, any>) {
    if (!content) {
      return Promise.resolve();
    }
    return sendRequest('/file/write', {path, content, props})
  }

  fileList(params: FolderListRequest) {
    return sendRequest('/file/list', params);
  }

  fileDelete(paths: string[], deleted) {
    return sendRequest('/file/delete', {paths, deleted})
  }

  xxx() {
    return sendRequest('/file/cleanup', {})
  }

  categoryList() {
    return sendRequest('/category/list', {})
  }

  categoryRename(old, name) {
    return sendRequest('/category/rename', {old, 'new': name})
  }

  categoryDelete(name,) {
    return sendRequest('/category/delete', {name})
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

  getGitCommitList(path: string, page: number = 1, limit: number = 20) {
    return sendRequest('/git/history/list', {path, page, limit});
  }

  getGitCommitDetail(path: string, commitId: string) {
    return sendRequest('/git/history/detail', {path, commitId});
  }

  // 保存Git配置
  saveGitConfig(config: any) {
    return sendRequest('/git/config/save', config);
  }

  // 获取Git配置
  getGitConfig() {
    return sendRequest('/git/config/get', {});
  }

  // 同步Git仓库
  syncGitRepo() {
    return sendRequest('/git/sync', {});
  }

  // 获取Git同步状态
  getGitSyncStatus() {
    return sendRequest('/git/sync/status', {});
  }
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
    formdata = JSON.stringify(params)
    headers = new Headers({
      'Authorization': 'Bearer '+ token,
      'content-type': 'application/json'
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
          reject('登录状态已失效')
          tokenManger.clearToken();
        }
        if (data.status !== 0) {
          reject(data.msg)
        }
        resolve(data.data);
      })
      .catch(e => reject(e))
  })
}
