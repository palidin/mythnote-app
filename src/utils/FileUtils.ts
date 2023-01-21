import moment from "moment";
import {sharedVariables} from "../store/state";
import {myAgent} from "../agent/agentType";
import * as graymatter from 'gray-matter-browser'


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

function stringifyYaml(obj: any) {
    let header = '';
    if (obj && Object.keys(obj).length) {
        header = graymatter.stringify('', obj);
        header = header.replace(/\s+$/, '')
    }
    return header;
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

    if (newBody === fileMatter.body && stringifyYaml(newData) === stringifyYaml(fileMatter.props)) {
        return Promise.resolve(1);
    }

    let now = getNowDateString();
    newData['modified'] = now;
    if (!newData['created']) {
        newData['created'] = now;
    }
    let header = stringifyYaml(newData);
    let content = header + '\n' + newBody;

    return myAgent.write(file.path, content)
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

export function readContentFrontMatter(text: string): FileData {
    text = text || '';
    let metadata = {props: {}, body: text};
    if (!text) {
        return metadata;
    }
    try {
        let matter = graymatter({content: text});
        metadata = {props: matter.data, body: matter.content};
    } catch (e) {
        console.log(e);
    }
    return metadata;
}


async function readFileProps(file: string) {
    return (await readFileFrontMatter(file))?.props;
}

async function readFileBody(file: string) {
    return (await readFileFrontMatter(file))?.props;
}

export function resetSearchCondition(setItemList, searchData, setSearchData, obj) {

    let page = 1;
    setItemList([]);
    setSearchData({
        ...searchData,
        ...obj,
        page,
    });
}

export function writeFile(currentFile, path) {
    return updateFileBodyWithProps(path, currentFile.body, currentFile.props)
}