import moment from "dayjs";
import {sharedVariables} from "../store/globalData";
import {myAgent} from "../agent/agentType";
import {useAppStore} from "../store/store";

import {FileData, WaitingWriteFileData} from "$source/type/note";
import {showErrorMessage} from "$source/utils/MessageUtils";
import {isEqual, cloneDeep} from 'lodash-es';


function getNowDateString() {
  return moment().format();
}

// 解决跨平台的换行问题
const normalizeContent = (str: string) => {
  if (!str) return '';
  return str
    .replace(/\r\n/g, '\n') // 统一将 CRLF 转为 LF
    .trim();                // 去除首尾多余的换行和空格
};

async function putFileContents(file: WaitingWriteFileData) {
  let lastUpdateTime = sharedVariables.updateTimestamps[file.path];
  if (lastUpdateTime && lastUpdateTime > file.createTime) { // 文件已过期
    return Promise.resolve(-1);
  }

  let fileMatter = readFileFrontMatter(file.path);
  if (!fileMatter) {
    return Promise.resolve(-2);
  }

  let {props, body} = file.data;
  let newData = cloneDeep({...fileMatter.props, ...props});
  let newBody = body ?? fileMatter.body;


  if (isEqual(normalizeContent(fileMatter.body), normalizeContent(newBody)) && isEqual(fileMatter.props, newData)) {
    return Promise.resolve(1);
  }

  const saveNewData = newData;
  let now = getNowDateString();
  saveNewData['modified'] = now;
  if (!saveNewData['created']) {
    saveNewData['created'] = now;
  }

  return myAgent.write(file.path, newBody, saveNewData)
    .then((res) => {
      if (!res) {
        showErrorMessage('保存失败');
        return Promise.resolve(-3);
      }
      sharedVariables.updateTimestamps[file.path] = file.createTime;
      sharedVariables.fileDataCache[file.path] = {body: newBody, props: saveNewData};
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


function readFileFrontMatter(file: string): FileData {
  return sharedVariables.fileDataCache[file];
}

export async function readOnlineFileFrontMatter(path: string): Promise<FileData> {
  return myAgent.read(path)
    .then((res: any) => {
      const matter = {props: res.props, body: res.body};
      sharedVariables.fileDataCache[path] = matter;
      return Promise.resolve(matter)
    })
}

export function resetSearchCondition(obj) {
  const prev = useAppStore.getState().searchData;
  useAppStore.getState().setSearchData(({
    ...prev,
    ...obj,
    page: 1,
  }));
}

export function updateSearchPage() {
  const prev = useAppStore.getState().searchData;
  useAppStore.getState().setSearchData(({
    ...prev,
    page: prev.page + 1,
  }));
}

export function writeFile(currentFile, path) {
  return updateFileBodyWithProps(path, currentFile.body, currentFile.props)
}
