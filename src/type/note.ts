export interface Props {
  title?: string;
  tags?: string[];
  modified?: string;
  created?: string;
  source_url?: string;
  deleted?: boolean;
  pinned?: boolean;
}

export interface FileData {
  props: Props;
  body: string;
}

export interface FileItem {
  title: string;
  path: string;
  pinned: boolean;
  filepath: string;
  isNew?: boolean,
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


export enum NoteChange {
  BODY,
  PROPS,
  TITLE,
}

export interface EditorDataDo {
  path: string,
  content: string,
}

export interface MarkdownEditorDataDo {
  markdown: string,
  onUpdate: (md: string) => void,
}
