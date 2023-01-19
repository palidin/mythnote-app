import {FakeImpl} from "./fakeImpl";

export interface NativeInterface {

}

export interface FileItem {
    name: string;
    path: string;
    pined?: boolean;
    isNew?: boolean;
}

export interface FolderItem {
    icon: string;
    name: string;
    completeName: string;
    parents: string[];
}

export interface FolderListRequest {
    keywords: string;
    folder: string;
    page: number;
    limit: number;
}


export const myAgent = new FakeImpl();