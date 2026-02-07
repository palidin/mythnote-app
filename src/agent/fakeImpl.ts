// @no-check
import {appConfig} from "../config/app";
import {useTokenStore} from "$source/store/store";
import {showErrorMessage} from "$source/utils/MessageUtils";

// --- 类型定义 ---
export interface FolderListRequest {
  keywords: string;
  folder: string;
  page: number;
  limit: number;
}

export interface TokenResult {
  access_token: string;
  refresh_token: string;
}

// --- 调试工具 ---
const logger = {
  debug: (msg: string, ...args: any[]) => console.debug(`%c[API DEBUG] ${msg}`, 'color: #7f8c8d', ...args),
  info: (msg: string, ...args: any[]) => console.info(`%c[API INFO] ${msg}`, 'color: #3498db', ...args),
  warn: (msg: string, ...args: any[]) => console.warn(`%c[API WARN] ${msg}`, 'color: #f1c40f', ...args),
  error: (msg: string, ...args: any[]) => console.error(`%c[API ERROR] ${msg}`, 'color: #e74c3c', ...args),
};

// --- 刷新状态管理 ---
let isRefreshing = false;
let requestsQueue: Array<(token: string) => void> = [];

export class FakeImpl {
  // 文件操作
  async read(path: string) {
    return await sendRequest('/file/read', {path});
  }

  async write(path: string, content: string, props: Record<string, any>) {
    if (!content) return Promise.resolve();
    return await sendRequest('/file/write', {path, content, props});
  }

  async fileList(params: FolderListRequest) {
    return await sendRequest('/file/list', params);
  }

  async fileDelete(paths: string[], deleted: number) {
    return await sendRequest('/file/delete', {paths, deleted});
  }

  // 分类操作
  async categoryList() {
    return await sendRequest('/category/list', {});
  }

  async categoryRename(oldName: string, newName: string) {
    return await sendRequest('/category/rename', {old: oldName, 'new': newName});
  }

  async categoryDelete(name: string) {
    return await sendRequest('/category/delete', {name});
  }

  // 上传
  async uploadImage(data: File | Blob): Promise<string> {
    const res = await sendRequest('/upload/image', {file: data});
    return res.url;
  }

  async uploadImageUrl(url: string): Promise<string> {
    const res = await sendRequest('/upload/image/url', {url});
    return res.url;
  }

  // 认证
  async login(username: string, password: string): Promise<TokenResult> {
    return await sendRequest('/auth/login', {username, password}, false);
  }

  async refreshToken(params: { refresh_token: string }): Promise<TokenResult> {
    return await sendRequest('/auth/token/refresh', params, false);
  }

  // 系统操作
  async cleanup() {
    return await sendRequest('/system/rebuild', {});
  } // 对应原来的 /system/rebuild
  async xxx() {
    return await sendRequest('/file/cleanup', {});
  }     // 对应原来的 /file/cleanup
  async status() {
    return await sendRequest('/system/status', {});
  }

  // Git 操作 (已补全)
  async getGitCommitList(path: string, page = 1, limit = 20) {
    return await sendRequest('/git/history/list', {path, page, limit});
  }

  async getGitCommitDetail(path: string, commitId: string) {
    return await sendRequest('/git/history/detail', {path, commitId});
  }

  async saveGitConfig(config: any) {
    return await sendRequest('/git/config/save', config);
  }

  async getGitConfig() {
    return await sendRequest('/git/config/get', {});
  }

  async syncGitRepo() {
    return await sendRequest('/git/sync', {});
  }

  async getGitSyncStatus() {
    return await sendRequest('/git/sync/status', {});
  }
}


/* -------------------- 类型 -------------------- */

interface ApiResponse<T = any> {
  status: number;
  msg?: string;
  data: T;
}


let refreshQueue: Array<{
  resolve: () => void;
  reject: (err: any) => void;
}> = [];

/* -------------------- 工具 -------------------- */

function buildFormData(obj: Record<string, any>) {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => fd.append(k, v));
  return fd;
}

function getHeaders(withToken: boolean, isUpload: boolean) {
  const headers = new Headers();

  if (withToken) {
    const token = useTokenStore.getState().access_token;
    if (token) {
      headers.append("Authorization", `Bearer ${token}`);
    }
  }

  if (!isUpload) {
    headers.append("Content-Type", "application/json");
  }

  return headers;
}

/* -------------------- 核心请求 -------------------- */

export async function sendRequest<T = any>(
  path: string,
  params: any = {},
  withToken = true
): Promise<T> {
  const url = appConfig.serverUrl + path;
  const isUpload = path.includes("upload");

  let showError = true;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: getHeaders(withToken, isUpload),
      body: isUpload ? buildFormData(params) : JSON.stringify(params),
    });

    // HTTP 级错误（非 401）
    if (!response.ok && response.status !== 401) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const result: ApiResponse<T> = await response.json();

    // 非法响应
    if (typeof result?.status !== "number") {
      throw new Error("服务端返回格式错误");
    }

    // ---------- Token 过期 ----------
    if (result.status === 401 && withToken) {
      showError = false
      return await handle401<T>(() => sendRequest(path, params, withToken))
    }

    // ---------- 业务错误 ----------
    if (result.status !== 0) {
      throw new Error(result.msg || "业务处理失败");
    }

    return result.data;

  } catch (err: any) {
    const msg = err?.message || "网络异常";
    logger.error(msg);
    if (showError) {
      showErrorMessage(msg)
    }
    throw err;
  }
}

/* -------------------- 401 处理核心 -------------------- */

async function handle401<T>(retryFn: () => Promise<T>): Promise<T> {
  const refresh_token = useTokenStore.getState().refresh_token;

  if (!refresh_token) {
    useTokenStore.getState().updateState({
      refresh_token: "",
      access_token: "",
    })
    throw new Error("登录已失效，请重新登录");
  }

  // 🔁 正在刷新，排队等待
  if (isRefreshing) {
    return new Promise<T>((resolve, reject) => {
      refreshQueue.push({
        resolve: () => retryFn().then(resolve).catch(reject),
        reject,
      });
    });
  }

  isRefreshing = true;

  try {
    logger.info("开始刷新 Token");

    const refreshResult = await sendRequest<{
      access_token: string;
      refresh_token: string;
    }>("/auth/token/refresh", {refresh_token}, false);

    useTokenStore.getState().updateState(refreshResult);

    logger.info("Token 刷新成功，恢复请求队列");

    // ✅ 唤醒队列
    refreshQueue.forEach(q => q.resolve());
    refreshQueue = [];

    return await retryFn();

  } catch (err) {
    logger.error("Token 刷新失败:"+err);

    refreshQueue.forEach(q => q.reject(err));
    refreshQueue = [];

    useTokenStore.getState().updateState({
      access_token: "",
      refresh_token: "",
    });
    throw err;

  } finally {
    isRefreshing = false;
  }
}
