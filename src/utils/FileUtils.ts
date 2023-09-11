import moment from "moment";
import {sharedVariables} from "../store/globalData";
import {myAgent} from "../agent/agentType";
import {useAppStore} from "../store/store";

import {FileData, WaitingWriteFileData} from "$source/type/note";
import {showErrorMessage} from "$source/utils/MessageUtils";


function getNowDateString() {
  return moment().format();
}


function toHash(obj) {
  return JSON.stringify(obj);
}

function isPropsEquals(left, right) {
  return toHash(left) === toHash(right);
}

function isTextEquals(left, right) {
  return left === right;
}

async function putFileContents(file: WaitingWriteFileData) {
  let lastUpdateTime = sharedVariables.updateTimestamps[file.path];
  if (lastUpdateTime && lastUpdateTime > file.createTime) { // 文件已过期
    return Promise.resolve(3);
  }

  let fileMatter = readFileFrontMatter(file.path);

  let {props, body} = file.data;
  let newData = getMergedProps(fileMatter.props, props);
  let newBody = body ?? fileMatter.body;

  if (isTextEquals(fileMatter.body, newBody) && isPropsEquals(fileMatter.props, newData)) {
    return Promise.resolve(1);
  }

  let now = getNowDateString();
  newData['modified'] = now;
  if (!newData['created']) {
    newData['created'] = now;
  }

  return myAgent.write(file.path, newBody, newData)
    .then((res) => {
      if (!res) {
        showErrorMessage('保存失败');
        return Promise.resolve(2);
      }
      sharedVariables.updateTimestamps[file.path] = file.createTime;
      sharedVariables.fileDataCache[file.path] = {body: newBody, props: newData};
      return Promise.resolve(0);
    })
    .catch(e => {
      showErrorMessage('发生了错误: ' + e.toString());
    })
}


export function updateFileBodyWithProps(path: string, body: string, props: object) {
  body = body.replaceAll("\r\n", "\n");
  return putFileContents({
    path,
    data: {body, props},
    createTime: new Date().getTime(),
  });
}

function getMergedProps(oldAttrs: Record<string, any>, props: Record<string, any>) {
  let newAttrs = {...oldAttrs, ...props};
  let newData = {};
  for (const [key, values] of Object.entries(newAttrs)) {
    let flag = false;
    if (Array.isArray(values) && values.length == 0) {
      flag = false;
    } else if (values) {
      flag = true;
    }
    if (flag) {
      newData[key] = values;
    }
  }

  return newData;
}

function readFileFrontMatter(file: string): FileData {
  return sharedVariables.fileDataCache[file];
}

export async function readOnlineFileFrontMatter(path: string): Promise<FileData> {
  return myAgent.read(path)
    .then((res: any) => {
      return Promise.resolve({props: res.props, body: res.body})
    })
}

export function resetSearchCondition(obj) {
  const page = 1;
  useAppStore.getState().setSearchData(prev => ({
    ...prev,
    ...obj,
    page
  }));
}

export function updateSearchPage() {
  useAppStore.getState().setSearchData(prev => ({
    ...prev,
    page: prev.page + 1,
  }));
}

export function writeFile(currentFile, path) {
  return updateFileBodyWithProps(path, currentFile.body, currentFile.props)
}
