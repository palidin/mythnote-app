import React, {useEffect, useRef, useState} from "react";
import {MySelect} from "../utils/HookUtils";
import {readOnlineFileFrontMatter, resetSearchCondition, updateSearchPage, writeFile} from "../utils/FileUtils";
import {
  delayRun,
  getUUid,
  openContextMenu,
  saveFile,
  selectEnd,
  selectSingle,
  selectStart,
  substrTitle
} from "../utils/utils";
import {MyContextMenu} from "../components/MyContextMenu";
import {GitHistoryModal} from "../components/GitHistoryModal";
import {myAgent} from "../agent/agentType";
import {sharedVariables} from "../store/globalData";
import {useAppStore, useNoteStore} from "../store/store";
import {
  showConfirmModal,
  showEditableMarkdownModal,
  showErrorMessage,
  showInputModal,
  showSuccessMessage
} from "../utils/MessageUtils";
import {TAG_TRASH} from "../config/app";

import {FileItem, NoteItem} from "$source/type/note";
import {MyInput} from "$source/components/MyInput";
import {useDebounceFn} from "ahooks";
import clsx from "clsx";

export function Middle({width}: { width: string }) {

  const searchData = useAppStore(state => state.searchData);


  const itemList = useNoteStore(state => state.itemList)
  const setItemList = useNoteStore(state => state.setItemList)

  const itemIndex = useNoteStore(state => state.itemIndex)
  const setItemIndex = useNoteStore(state => state.setItemIndex)

  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [gitHistoryPath, setGitHistoryPath] = useState<string | null>(null);

  useEffect(() => {
    if (itemIndex == 0) {
      selectStart(itemIndex)
    }
  }, [itemIndex])

  const focusTag = useAppStore(state => state.searchData.folder);


  useEffect(() => {
    fetchItemList(searchData, itemList);
  }, [searchData])

  function fetchItemList(searchData, itemList) {
    if (!searchData.order.column) {
      return;
    }

    if (searchData.page == 1) {
      setItemList([])
    }
    myAgent.fileList(searchData)
      .then(res => {
        let isAtBottom = !res.items.length || res.pages == searchData.page;
        setIsAtBottom(isAtBottom);
        if (res.items.length && !itemList.length) {
          setItemIndex(0)
        }

        if (res.page == 1) {
          setItemList([...res.items])
        } else {
          setItemList([...itemList, ...res.items])
        }

        setIsFetching(false);

        setTotalQuantity(res.total)

        if (!isAtBottom) {
          delayRun(100)
            .then(() => {
              autoScroll()
            })
        }
      })
  }

  function onKeywordsChange(keywords) {
    setKeywords(keywords)
    loadData(keywords);
  }

  const state = useAppStore(state => state);

  const [keywords, setKeywords] = useState('');
  useEffect(() => {
    setKeywords(state.searchData.keywords)
  }, [state.searchData.keywords])

  function onConfirmKeywordsChange() {
    resetSearchCondition({keywords})
  }

  const {run: loadData} = useDebounceFn((keywords) => {
    resetSearchCondition({keywords})
  }, {
    wait: 1000,
  });

  function onClickLoadMore(isForce = false) {
    if (!isForce && isAtBottom) {
      return;
    }
    if (!isForce && isFetching) {
      return;
    }
    setIsFetching(true);

    updateSearchPage();
  }

  function onScroll() {
    const scrollDiv = listItemBoxRef.current;
    const clientHeight = scrollDiv.clientHeight;
    let height = scrollDiv.scrollTop + clientHeight;
    let totalHeight = scrollDiv.scrollHeight;
    if (height > totalHeight - 2) {
      onClickLoadMore();
    }
  }

  function autoScroll() {
    const scrollDiv = listItemBoxRef.current;
    if(!scrollDiv){
      return;
    }
    const clientHeight = scrollDiv.clientHeight;
    let totalHeight = scrollDiv.scrollHeight;
    let hasScrollBar = totalHeight > clientHeight;

    if (!scrollDiv.scrollTop && !hasScrollBar) {
      onClickLoadMore(true);
    }
  }

  function onCreateNewNote() {
    let newItem: NoteItem = {
      path: getUUid() + '.md',
      name: 'Untitled',
      isNew: true,
      props: null,
    };

    if (focusTag) {
      newItem.props = {
        tags: [focusTag].filter(v => !v.startsWith('//'))
      };
    }

    setItemList([newItem, ...itemList])
    setItemIndex(0);
  }

  const listItemBoxRef = useRef(null);

  useEffect(() => {
    const scrollDiv = listItemBoxRef.current;
    scrollDiv.addEventListener('scroll', onScroll);
    return () => {
      scrollDiv.removeEventListener('scroll', onScroll);
    }
  }, [onScroll])

  function onCleanData() {
    showConfirmModal('将删除回收站所有的原文件，确认继续吗？')
      .then(() => {
        myAgent.xxx()
          .then(() => {
            showSuccessMessage('删除成功');
            location.reload();
          })

      })
  }

  const [orderColumn, setOrderColumn] = useState('modified');
  const [orderDirection, setOrderDirection] = useState('desc');

  function onChangeOrderColumn(v) {
    setOrderColumn(v)
  }

  function onChangeOrderDirection(v) {
    setOrderDirection(v)
  }

  useEffect(() => {
    if (orderColumn && orderDirection) {
      resetSearchCondition({
        order: {
          column: orderColumn,
          direction: orderDirection,
        }
      })
    }
  }, [orderColumn, orderDirection])

  const [totalQuantity, setTotalQuantity] = useState(0);


  return (
    <div className="flex flex-col relative min-w-[200px] bg-[#fafafa] p-2" style={{width}}>
      {/* 搜索栏 */}
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <MyInput
              value={keywords}
              onChange={onKeywordsChange}
              onSearch={onConfirmKeywordsChange}
            />
          </div>
          <button
            onClick={onConfirmKeywordsChange}
            className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            搜索
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCreateNewNote}
            disabled={focusTag.startsWith(TAG_TRASH)}
            className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
          >
            新建
          </button>
          {focusTag.startsWith(TAG_TRASH) && (
            <button
              onClick={onCleanData}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              清空
            </button>
          )}
        </div>
      </div>

      {/* 统计和排序 */}
      <div className="flex flex-row items-center justify-between mb-2 pb-2 border-b border-slate-200">
        <div className="text-xs text-slate-600">
          {totalQuantity}条笔记
        </div>
        <div className="flex gap-1">
          <MySelect
            value={orderColumn}
            onChange={onChangeOrderColumn}
            columns={['modified', 'created', 'title']}
          />
          <MySelect
            value={orderDirection}
            onChange={onChangeOrderDirection}
            columns={['desc', 'asc']}
          />
        </div>
      </div>

      {/* 笔记列表 */}
      <div className="flex-1 overflow-hidden relative">
        <div
          className="absolute inset-0 overflow-y-auto"
          ref={listItemBoxRef}
        >
          {itemList.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              暂无笔记
            </div>
          ) : (
            <>
              {itemList.map((item, index) => {
                return <ListItem key={item.path} index={index} item={item}
                                 setGitHistoryPath={setGitHistoryPath}></ListItem>
              })}
              {!isAtBottom && (
                <div
                  onClick={() => onClickLoadMore()}
                  className="text-center py-3 text-sm text-primary-600 hover:text-primary-700 cursor-pointer hover:bg-slate-50 rounded-lg transition-colors"
                >
                  {isFetching ? '加载中...' : '加载更多...'}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {gitHistoryPath && (
        <GitHistoryModal
          path={gitHistoryPath}
          onClose={() => setGitHistoryPath(null)}
        />
      )}
    </div>
  )
}

function ListItem({index, item, setGitHistoryPath}: { index: number, item: FileItem, setGitHistoryPath }) {

  function onClickItem(e, i) {
    if (itemIndex === i) {
      return;
    }
    if (e.shiftKey) {
      selectEnd(i)
    } else if (e.ctrlKey) {
      selectSingle(i)
    } else {

      const lastEditingFile = sharedVariables.lastEditingFile;
      if (lastEditingFile.path) {
        const currentFile = lastEditingFile.fileData;
        if (!currentFile.props.title) {
          currentFile.props.title = substrTitle(currentFile.body)
        }
        saveFile(currentFile, lastEditingFile.path)
      }

      selectStart(i)
      useNoteStore.getState().setItemIndex(i);
    }
  }

  const selectIndexes = useAppStore(state => state.selectIndexes);

  function openFileManageContextMenu(e, value, index) {
    e.preventDefault();
    e.stopPropagation();

    let focusTag = useAppStore.getState().searchData.folder;

    let deleted = true;
    if (focusTag && focusTag.startsWith(TAG_TRASH)) {
      deleted = false;
    }

    let items = [
      {'title': '置顶/取消置顶', onClick: () => updateNotePinned(value.path, !value.pinned)},
      {'title': '添加标签', onClick: () => addNoteTag(value)},
      {'title': '查看历史', onClick: () => setGitHistoryPath(value.path)},
    ]

    if (selectIndexes.length == 1) {
      items.push({
        'title': '文本编辑', onClick: () => {

          const path = value.path;

          readOnlineFileFrontMatter(path)
            .then(res => {
              return showEditableMarkdownModal(res.props.title, res.body);
            })
            .then(body => {
              return writeFile({body}, path)
            })
            .then(() => {
              showSuccessMessage('保存成功')
              refreshNoteContent();
            })
            .catch(e => showErrorMessage(e))

        }
      },)
    }
    if (selectIndexes.includes(index)) {
      items.push({'title': deleted ? '删除' : '恢复', onClick: () => deleteSelected(deleted)})
    }
    openContextMenu(<MyContextMenu e={e} items={items}></MyContextMenu>)
  }

  function refreshNoteContent() {
    useNoteStore.getState().setRefreshSeed(Math.random());
  }

  function deleteSelected(deleted) {

    const paths = getSelectedItemPaths();

    function handle() {
      myAgent.fileDelete(paths, deleted ? 1 : 0)
        .then(() => {
          showSuccessMessage('删除成功')
        })
    }

    if (!deleted) {
      handle();
    } else {
      showConfirmModal('确认删除笔记吗？')
        .then(() => {
          handle();
        })
    }
  }

  function updateNotePinned(path, pinned) {
    readOnlineFileFrontMatter(path)
      .then(matter => {
        let props = {
          ...matter.props,
          pinned: pinned
        };
        writeFile({props, body: matter.body}, path)
          .then(() => {
            let current = itemList.findIndex(v => v.path === path);
            itemList[current].pinned = pinned;
            useNoteStore.getState().setItemList([...itemList])
          })
      })
  }

  function addNoteTag(item) {
    const paths = getSelectedItemPaths();

    showInputModal('批量添加标签', '')
      .then(tagName => {
        const ps = [];
        for (const path of paths) {
          const p = readOnlineFileFrontMatter(path)
            .then(matter => {
              let tags = matter.props.tags ?? [];
              tags = [...new Set([...tags, tagName])];

              let props = {
                ...matter.props,
                tags,
              };
              writeFile({props, body: matter.body}, path)
            })
          ps.push(p)
        }

        Promise.all(ps)
          .then(res => {
            showSuccessMessage('操作成功');
          })
      })

  }

  function getSelectedItemPaths() {
    return selectIndexes.map(v => itemList.at(v)).map(v => v.path);
  }

  const itemList = useNoteStore(state => state.itemList)
  const itemIndex = useNoteStore(state => state.itemIndex)

  const isActive = itemIndex === index;
  const isSelected = selectIndexes.includes(index);
  const isNew = item.isNew;

  return (
    <div
      key={index}
      className={clsx(
        'px-3 py-2 mb-1 rounded-lg cursor-pointer transition-all duration-150',
        'hover:bg-slate-100 border border-transparent',
        {
          'bg-primary-50 border-primary-200 hover:bg-primary-100': isActive,
          'bg-slate-200 border-slate-300': isSelected && !isActive,
        }
      )}
      onClick={(e) => onClickItem(e, index)}
      onContextMenu={(e) => openFileManageContextMenu(e, item, index)}
    >
      <div className="flex items-center gap-2">
        {item.pinned && (
          <span className="text-xs bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded font-medium">
            置顶
          </span>
        )}
        <span
          className={clsx(
            'text-title flex-1 text-sm',
            {
              'text-primary-700 font-semibold': isActive,
              'text-slate-700': !isActive,
              'text-red-600': isNew,
            }
          )}
          title={item.title || 'Untitled'}
        >
          {item.title || 'Untitled'}
          {isNew && <span className="ml-1 text-red-500">*</span>}
        </span>
      </div>
    </div>
  )
}

