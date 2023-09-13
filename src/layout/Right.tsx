import classNames from "classnames";
import {formatDisplayTime, openContextMenu, saveFile} from "../utils/utils";
import React, {useEffect, useMemo, useState} from "react";
import {readOnlineFileFrontMatter} from "../utils/FileUtils";
import {sharedVariables} from "../store/globalData";
import {showConfirmModal, showInputModal, showSuccessMessage} from "../utils/MessageUtils";
import {MyContextMenu} from "../components/MyContextMenu";
import {useAppStore, useNoteStore} from "../store/store";
import {ContentChangeEvent, EditorDataDo, FileData, NoteChange, NoteItem} from "$source/type/note";
import {MyEditor} from "$source/MyEditor";
import {MyInput} from "$source/components/MyInput";
import {useDebounceFn, useMemoizedFn} from "ahooks";

export function Right() {

  const EMPTY_FILE: FileData = {
    body: '',
    props: {},
  }

  const [currentFile, setCurrentFile] = useState<FileData>(EMPTY_FILE);
  const itemList = useNoteStore<NoteItem[]>(state => state.itemList)
  const seed = useNoteStore(state => state.seed)
  const itemIndex = useNoteStore(state => state.itemIndex)
  const searchData = useAppStore(state => state.searchData);

  const [editingData, setEditingData] = useState<EditorDataDo>(null);


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
        sharedVariables.fileDataCache[path] = matter;
        const content = matter.body;
        setEditingData({
          path,
          content,
        })
        setTitle(matter.props.title)
      })
  }, [path]);

  useEffect(() => {
    if (path !== sharedVariables.lastEditingFile.path) return;
    const lastUpdateFile = sharedVariables.fileDataCache[path];
    setCurrentFile(lastUpdateFile);
  }, [seed])


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


  const {run: saveNoteDelay} = useDebounceFn(saveFile, {
    wait: 300,
  });

  function updateCurrentFile(file: Partial<FileData>, action: NoteChange, save = true, sync = false) {
    const filedata = {...currentFile};
    if (action == NoteChange.BODY) {
      filedata.body = file.body;
    } else {
      filedata.props = {...filedata.props, ...file.props};
    }
    setCurrentFile({...filedata})

    sharedVariables.lastEditingFile = {
      path,
      fileData: filedata,
    }

    if (save) {
      if (sync) {
        return saveFile(filedata, path)
      } else {
        saveNoteDelay(filedata, path);
      }
    }

  }

  const updateBody = useMemoizedFn((event: ContentChangeEvent) => {
    if (!event.path) return;
    if (event.path !== path) return;
    let text = event.content;
    updateCurrentFile({
      body: text
    }, NoteChange.BODY)
  })

  function updateProps(props) {
    return updateCurrentFile({
      props: {
        ...currentFile.props,
        ...props
      }
    }, NoteChange.PROPS, true, true)
  }

  function openAddTagModal() {
    showInputModal('添加标签')
      .then(res => {
        let tags = currentFile.props.tags ?? [];
        if (!tags.includes(res)) {
          tags = [...tags, res]
          updateProps({tags})
            .then((res) => {
              if (res) return;
              showSuccessMessage('添加成功')
            })
        }
      })
  }

  function removeTagModal(tag) {
    showConfirmModal('确认删除"' + tag + '"标签吗？')
      .then(() => {
        let tags = currentFile.props.tags ?? [];
        tags = tags.filter(v => v !== tag)
        updateProps({tags})
          .then((res) => {
            if (res) return;
            showSuccessMessage('删除成功')
          })
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
            .then((res) => {
              if (res) return;
              showSuccessMessage('修改成功')
            })
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

  useEffect(() => {
    if (!focusing) {
      onTitleSubmit(title)
    }
  }, [focusing])

  function onTitleChange(title) {
    setTitle(title)
  }

  function onTitleSubmit(title) {
    onTitleChange(title)
    updateCurrentFile({props: {title}}, NoteChange.TITLE, true, true)
  }

  return (
    <div className="right flex-col">
      <div className={classNames('note-detail flex-col auto-stretch', {'hide': isEmpty})}>

        <div className="note-meta-box">
          <div className={"note-title"}>
            <div>
              <MyInput onChange={onTitleChange} onToggle={setFocusing} onSearch={onTitleSubmit} value={title}/>
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
          <MyEditor data={editingData} updateBody={updateBody}/>
        </div>

      </div>
      <div className={classNames('mask auto-stretch', {'hide': !isEmpty})}></div>
    </div>
  )
}
