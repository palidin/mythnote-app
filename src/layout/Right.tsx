import {formatDisplayTime, openContextMenu, saveFile} from "../utils/utils";
import React, {useEffect, useMemo, useState} from "react";
import {readOnlineFileFrontMatter} from "../utils/FileUtils";
import {sharedVariables} from "../store/globalData";
import {showConfirmModal, showInputModal, showSuccessMessage} from "../utils/MessageUtils";
import {MyContextMenu} from "../components/MyContextMenu";
import {useAppStore, useNoteStore} from "../store/store";
import {ContentChangeEvent, EditorDataDo, FileData, NoteChange, NoteItem} from "$source/type/note";
import {WysiwygEditor} from "$source/WysiwygEditor";
import {useDebounceFn, useMemoizedFn} from "ahooks";
import clsx from "clsx";

export function Right() {

  const EMPTY_FILE: FileData = {
    body: '',
    props: {},
  }

  const [currentFile, setCurrentFile] = useState<FileData>(EMPTY_FILE);
  const itemList = useNoteStore<NoteItem[]>(state => state.itemList)
  const fileFingerprint = useNoteStore(state => state.fileFingerprint)
  const itemIndex = useNoteStore(state => state.itemIndex)
  const refreshSeed = useNoteStore(state => state.refreshSeed)
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
  }, [path, refreshSeed]);

  useEffect(() => {
    if (path !== sharedVariables.lastEditingFile.path) return;
    const lastUpdateFile = sharedVariables.fileDataCache[path];
    setCurrentFile(lastUpdateFile);
  }, [fileFingerprint])


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
    <div className="flex flex-col flex-1 w-[70%] bg-[#fafafa] border border-slate-300">
      <div className={clsx('flex flex-col flex-1', {'hidden': isEmpty})}>
        {/* 笔记元信息 */}
        <div className="p-4 border-b border-slate-200 bg-white">
          {/* 标题 */}
          <div className="mb-4">
            <input
              type="text"
              data-title={title}
              value={title || ""}
              onChange={(e) => onTitleChange(e.target.value)}
              onFocus={() => setFocusing(true)}
              onBlur={() => setFocusing(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onTitleSubmit(title);
                }
              }}
              className="w-full px-0 py-2 border-0 border-b-2 border-transparent focus:border-primary-500 focus:outline-none transition-all text-2xl font-bold text-slate-800 bg-transparent"
              placeholder="无标题"
            />
          </div>

          {/* 元信息 */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mb-3 allow-copy">
            <span className="px-2 py-1 bg-slate-100 rounded">
              修改: {formatDisplayTime(currentFile.props.modified)}
            </span>
            <span className="px-2 py-1 bg-slate-100 rounded font-mono text-xs">
              {path}
            </span>
            <span className="px-2 py-1 bg-slate-100 rounded">
              创建: {formatDisplayTime(currentFile.props.created)}
            </span>
            {currentFile.props.source_url && (
              <a
                href={currentFile.props.source_url}
                target='_blank'
                rel="noopener noreferrer"
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                来源地址
              </a>
            )}
          </div>

          {/* 标签 */}
          <div className="flex flex-wrap items-center gap-2 mb-3 allow-copy">
            {currentFile.props.tags?.length ? (
              currentFile.props.tags.map((v, k) => {
                const isActive = v === searchData.folder;
                return (
                  <div
                    key={k}
                    onContextMenu={(e) => openTagManageContextMenu(e, v)}
                    className={clsx(
                      'px-3 py-1 rounded-full text-sm cursor-pointer transition-colors',
                      {
                        'bg-primary-100 text-primary-700 border-2 border-primary-300': isActive,
                        'bg-slate-100 text-slate-700 hover:bg-slate-200 border-2 border-transparent': !isActive,
                      }
                    )}
                  >
                    {v}
                  </div>
                );
              })
            ) : (
              <span className="text-xs text-slate-400">暂无标签</span>
            )}
          </div>

          {/* 工具栏 */}
          <div className="flex gap-2">
            <button
              onClick={openAddTagModal}
              className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              增加标签
            </button>
          </div>
        </div>

        {/* 编辑器内容 */}
        <div className="flex flex-col flex-1 relative overflow-hidden">

          <WysiwygEditor data={editingData} updateBody={updateBody}/>
        </div>
      </div>

      {/* 空状态遮罩 */}
      <div className={clsx('flex-1 flex items-center justify-center bg-slate-50', {'hidden': !isEmpty})}>
        <div className="text-center text-slate-400">
          <p className="text-lg mb-2">选择一个笔记开始编辑</p>
          <p className="text-sm">或点击"新建"创建新笔记</p>
        </div>
      </div>
    </div>
  )
}
