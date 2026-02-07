import {v4 as uuidv4} from 'uuid';
import * as ReactDOM from "react-dom/client";
import {sharedVariables} from "../store/globalData";
import moment from "dayjs";
import {useAppStore, useNoteStore} from "../store/store";
import {myAgent} from "../agent/agentType";
import {FileData} from "$source/type/note";
import {writeFile} from "$source/utils/FileUtils";
import React from "react";

export function isRemoteUrl(url) {
  return url && url.startsWith('http');
}

export function getUUid() {
  return uuidv4();
}


interface ModalProps extends JSX.Element {
  onSubmit?: (params: any) => void,
}

export function showModal(modal: ModalProps): Promise<any> {
  return new Promise(resolve => {

    if (!sharedVariables.popup) {
      const container = document.getElementById('popup') as HTMLElement;
      const root = ReactDOM.createRoot(container);
      sharedVariables.popup = root;
    }


    setTimeout(() => {
      const onSubmit = (v) => resolve(v)
      // @ts-ignore
      const prompt = React.cloneElement(modal, {
        onSubmit
      })
      sharedVariables.popup.render(null)

      setTimeout(() => {
        sharedVariables.popup.render(prompt);
      })
    }, 50)
  })
}

export function openContextMenu(component) {
  let ele = document.getElementById('contextmenu') as HTMLElement;
  let root = sharedVariables.contextmenu
  if (!root) {
    root = ReactDOM.createRoot(ele);
    sharedVariables.contextmenu = root;
  }

  root.render(
    component
  )
}

export function formatDisplayTime(time: string) {
  if (!time) {
    return '';
  }
  let fmt = 'YYYY/MM/DD HH:mm:ss'
  return moment(time).format(fmt);
}

export function substrTitle(body) {
  body = body ?? '';
  let items = body.split("\n")
  return items[0].substring(0, 30);
}


export function selectStart(i) {
  sharedVariables.startIndex = i;

  useAppStore.getState().setSelectIndexes([i]);
}

export function selectSingle(i) {
  const indexes = useAppStore.getState().selectIndexes;
  if (indexes.length > 0) {
    const pureIndexes = indexes.filter(v => v !== i);
    if (pureIndexes.length === indexes.length) {
      useAppStore.getState().setSelectIndexes([...new Set([...pureIndexes, i])]);
    } else {
      useAppStore.getState().setSelectIndexes([...pureIndexes]);
    }
  }
}

export function selectEnd(i) {
  let start = sharedVariables.startIndex;
  let end = i;
  if (start == -1) {
    return;
  }

  if (start > end) {
    let t = start;
    start = end;
    end = t;
  }

  let indexes = [];

  for (let i = start; i <= end; i++) {
    indexes.push(i);
  }

  useAppStore.getState().setSelectIndexes(indexes);
}

export function selectRestore() {
  sharedVariables.startIndex = -1;
  useAppStore.getState().setSelectIndexes([]);
}

export function delayRun(timeout = 1000) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout)
  })
}

export function checkStatusTask() {
  return new Promise(resolve => {
    myAgent.status()
      .then(res => {
        if (!res.lock) {
          return resolve(true);
        }
        return resolve(false)
      })
  })
}

export function isCopyable(e: any) {
  if (!e.path) return;
  for (const paths of e.path) {
    if (paths instanceof HTMLElement) {
      if (paths.classList.contains('allow-copy')) {
        return true;
      }
    }
  }
  return false;
}

export function saveFile(currentFile: FileData, path: string) {
  if (!currentFile.props.created && (!currentFile.props.title || !currentFile.body)) {
    return Promise.resolve(1)
  }
  return writeFile(currentFile, path)
    .then((res) => {
      if (res === 0) {

        const list = useNoteStore.getState().itemList;
        const index = list.findIndex(v => v.path == path);
        if (index > -1) {
          list[index] = {
            ...list[index],
            props: currentFile.props,
            title: currentFile.props.title,
            isNew: false,
          }
          useNoteStore.getState().setItemList([...list])
          useNoteStore.getState().setFileFingerprint(Math.random())
        }

        return Promise.resolve(0)
      }

      return Promise.resolve(res)
    })
}

