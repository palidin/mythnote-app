import moment from "moment";
import {sharedVariables} from "../store/state";
import {myAgent} from "../agent/agentType";


interface Props {
  title?: string;
  tags?: string[];
  modified?: string;
  created?: string;
  source_url?: string;
  deleted?: boolean;
  pined?: boolean;
}

export interface FileData {
  props: Props;
  body: string;
}

interface WaitingWriteFileData {
  path: string;
  data: FileData;
  createTime: number;
}


function getNowDateString() {
  return moment().format();
}

export function diffSecondsFromNow(target: string) {

  let now = new Date().getTime();
  let timestamps = moment(target).toDate().getTime();
  let diff = now - timestamps;
  return Math.floor(diff / 1000);
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

  if (isTextEquals(fileMatter.body, newBody) && isPropsEquals(newData, fileMatter.props)) {
    return Promise.resolve(1);
  }

  let now = getNowDateString();
  newData['modified'] = now;
  if (!newData['created']) {
    newData['created'] = now;
  }

  return myAgent.write(file.path, newBody, newData)
    .then(() => {
      sharedVariables.updateTimestamps[file.path] = file.createTime;
      sharedVariables.fileDataCache[file.path] = {body: newBody, props: newData};
      return Promise.resolve(0);
    })
    .catch(e => {
      return Promise.reject(e);
    })
}


export function updateFileBodyWithProps(path: string, body: string, props: object) {
  body = body.replaceAll("\r\n", "\n");
  return putFileContents({
    path,
    data: {body, props},
    createTime: new Date().getTime(),
  })
    .finally(() => {
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

export function resetSearchCondition(setItemList, setSearchData, obj) {
  let page = 1;
  setItemList([]);
  setSearchData(v => ({
    ...v,
    ...obj,
    page,
  }));
}

export function writeFile(currentFile, path) {
  return updateFileBodyWithProps(path, currentFile.body, currentFile.props)
}
