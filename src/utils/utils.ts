import {v4 as uuidv4} from 'uuid';
import * as debounce1 from "lodash/debounce";
import * as throttle1 from "lodash/throttle";
import * as ReactDOM from "react-dom/client";
import {sharedVariables} from "../store/state";
import moment from "moment";
import {store} from "../store/store";
import {myAgent} from "../agent/agentType";

export function debounce(fn, wait) {
    return debounce1(fn, wait);
}

export function throttle(fn, wait) {
    return throttle1(fn, wait);
}

export function isRemoteUrl(url) {
    return url && url.startsWith('http');
}

export function getUUid() {
    return uuidv4();
}


export function openNewModal(component) {
    let ele = document.getElementById('popup') as HTMLElement;
    let root;
    if (!sharedVariables.popup) {
        root = ReactDOM.createRoot(ele);
        sharedVariables.popup = root;
    } else {
        root = sharedVariables.popup;
    }

    root.render(
        component
    )
}

export function destroyModal() {
    sharedVariables.popup.unmount();
    sharedVariables.popup = null;
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
    let fmt = 'YYYY/MM/DD HH:mm:ss'
    return moment(time).format(fmt);
}

export function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

export function substrTitle(body) {
    let text = body.substring(0, 30)

    let items = text.split("\n")
    for (const item of items) {
        if (!item.match(/^\s*$/)) {
            return item;
        }
    }

    return text;
}


export function selectStart(i) {
    store.startIndex = i;
    store.selectIndexes = [i];
}

export function selectEnd(i) {
    let start = store.startIndex;
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

    store.selectIndexes = indexes;
}

export function selectRestore() {
    store.startIndex = -1;
    store.selectIndexes = [];
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