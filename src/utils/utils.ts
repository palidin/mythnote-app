import {v4 as uuidv4} from 'uuid';
import * as debounce1 from "lodash/debounce";
import * as throttle1 from "lodash/throttle";
import * as ReactDOM from "react-dom/client";
import {sharedVariables} from "../state";
import moment from "moment";

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