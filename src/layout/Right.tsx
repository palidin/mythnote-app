import classNames from "classnames";
import {formatDisplayTime, openContextMenu, substrTitle} from "../utils/utils";
import React, {useEffect, useMemo, useState} from "react";
import {readOnlineFileFrontMatter, writeFile} from "../utils/FileUtils";
import {useDebounce} from "../utils/HookUtils";
import {sharedVariables} from "../store/globalData";
import {showConfirmModal, showInputModal} from "../utils/MessageUtils";
import {MyContextMenu} from "../components/MyContextMenu";
import {useAppStore, useNoteStore} from "../store/store";
import {ContentChangeEvent, FileData, NoteChange, NoteItem} from "$source/type/note";
import {MyEditor} from "$source/MyEditor";
import {MyInput} from "$source/components/MyInput";

export function Right() {

  const EMPTY_FILE: FileData = {
    body: '',
    props: {},
  }

  const [currentFile, setCurrentFile] = useState<FileData>(EMPTY_FILE);
  const [content, setContent] = useState('');
  const itemList = useNoteStore<NoteItem[]>(state => state.itemList)
  const setItemList = useNoteStore(state => state.setItemList)
  const itemIndex = useNoteStore(state => state.itemIndex)
  const searchData = useAppStore(state => state.searchData);


  const path = useMemo(() => {
    return itemList[itemIndex]?.path;
  }, [itemList, itemIndex]);

  const isEmpty = useMemo(() => {
    return itemList.length <= 0;
  }, [itemList])


  useEffect(() => {
    if (!path) {
      return;
    }
    getPathMatter(path)
      .then((matter) => {
        setCurrentFile(matter)
        let content = matter.body;
        setContent(content)
        sharedVariables.fileDataCache[path] = matter;
      })
  }, [path]);


  function getPathMatter(path) {
    let item = itemList.find(v => v.path == path);
    if (item.isNew) {
      let matter = {...EMPTY_FILE};
      if (item.props) {
        matter.props = {...item.props};
      }
      return Promise.resolve(matter)
    }
    return readOnlineFileFrontMatter(path);
  }

  const saveNoteDelay = useDebounce((currentFile: FileData, path: string) => {
    writeFile(currentFile, path)
  });

  function updateCurrentFile(file: Partial<FileData>, action: NoteChange, save = true) {
    const filedata = {...currentFile};
    if (action == NoteChange.BODY) {
      filedata.body = file.body;
    } else {
      filedata.props = {...file.props};
    }

    updatePropsSync(filedata);

    if (save) {
      saveNoteDelay(filedata, path);
    }
  }

  function updatePropsSync(filedata: FileData) {
    let activeIndex = itemList.findIndex(v => v.path == path);
    let activeItem = itemList[activeIndex];
    if (!activeItem) {
      return;
    }

    let parentTag = useAppStore.getState().searchData.folder;
    let isNew = activeItem.isNew;

    let title = filedata.props.title;
    let substringTitle = substrTitle(filedata.body);

    if (!title) {
      title = substringTitle;
    }

    filedata.props.title = title;
    if (isNew && parentTag) {
      filedata.props.tags = [parentTag];
    }

    itemList.splice(itemIndex, 1, {
      ...activeItem,
      title,
    })
    setItemList([...itemList])

    setCurrentFile({...filedata})
  }

  const updateBody = (event: ContentChangeEvent) => {
    if (!event.path) return;
    if (event.path !== path) return;
    let text = event.content;
    updateCurrentFile({
      body: text
    }, NoteChange.BODY)
  }

  function updateProps(props) {
    updateCurrentFile({
      props: {
        ...currentFile.props,
        ...props
      }
    }, NoteChange.PROPS)
  }

  function openAddTagModal() {
    showInputModal('添加标签')
      .then(res => {
        let tags = currentFile.props.tags ?? [];
        if (!tags.includes(res)) {
          tags = [...tags, res]
          updateProps({tags})
        }
      })
  }

  function removeTagModal(tag) {
    showConfirmModal('确认删除"' + tag + '"标签吗？')
      .then(() => {
        let tags = currentFile.props.tags ?? [];
        tags = tags.filter(v => v !== tag)
        updateProps({tags})
      })
  }

  function updateTagModal(tag) {
    showInputModal('修改标签', tag)
      .then(res => {
        if (res === tag) return;
        let tags = currentFile.props.tags ?? [];
        tags = tags.filter(v => v !== tag);
        if (!tags.includes(res)) {
          tags = [...tags, res]
          updateProps({tags})
        }
      })
  }

  function openTagManageContextMenu(e, value) {
    e.preventDefault();
    e.stopPropagation();
    let items = [
      {'title': '删除标签', onClick: () => removeTagModal(value)},
      {'title': '修改标签', onClick: () => updateTagModal(value)},
    ]
    openContextMenu(<MyContextMenu e={e} items={items}></MyContextMenu>)
  }


  const [focusing, setFocusing] = useState(false);

  const [title, setTitle] = useState('');

  const currentItem = useMemo(() => {
    return itemList[itemIndex];
  }, [itemList, itemIndex]);

  useEffect(() => {
    setTitle(currentItem?.title)
  }, [currentItem])

  useEffect(() => {
    if (!focusing) {
      onTitleChange(title)
    }
  }, [focusing])

  function onTitleChange(title) {
    if (!currentItem) return;
    if (focusing || (currentItem && currentItem.isNew)) {
      updateCurrentFile({props: {title}}, NoteChange.TITLE, false)
    } else {
      updateCurrentFile({props: {title}}, NoteChange.TITLE)
    }
  }

  return (
    <div className="right flex-col">
      <div className={classNames('note-detail auto-stretch flex-col', {'hide': isEmpty})}>

        <div className="note-meta-box">
          <div className={"note-title"}>
            <div>
              <MyInput onChange={onTitleChange} onToggle={setFocusing} value={title}/>
            </div>
            <div className={'info allow-copy'}>
              <span>{formatDisplayTime(currentFile.props.modified)}</span>
              <span>{path}</span>
              <span>{formatDisplayTime(currentFile.props.created)}</span>
              {currentFile.props.source_url ?
                (<span><a href={currentFile.props.source_url} target='_blank'>来源地址</a></span>)
                : ''}
            </div>


            <div className={'info note-tags allow-copy'}>
              {
                currentFile.props.tags?.length
                  ? <> {
                    currentFile.props.tags.map((v, k) => {
                      return <span key={k}
                                   onContextMenu={(e) => openTagManageContextMenu(e, v)}
                                   className={v === searchData.folder ? 'active' : ''}>{v}</span>;
                    })
                  }</>
                  : ''
              }

            </div>
          </div>
          <div className={"note-toolbar"}>
            <button onClick={openAddTagModal}>增加标签</button>
          </div>
        </div>

        <div className={"note-content flex-col auto-stretch"}>
          <MyEditor content={content} updateBody={updateBody} path={path}/>
        </div>

      </div>
      <div className={classNames('mask auto-stretch', {'hide': !isEmpty})}></div>
    </div>
  )
}
