export interface Props {
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

export interface NoteItem {
  path: string,
  name: string,
  isNew: boolean,
  title?: string,
  props?: Props,
}

export interface WaitingWriteFileData {
  path: string;
  data: FileData;
  createTime: number;
}


export interface ContentChangeEvent {
  path: string;
  content: string
}

export interface TitleChangeEvent {
  path: string;
  title: string
}

export enum NoteChange {
  BODY,
  PROPS,
  TITLE,
}
