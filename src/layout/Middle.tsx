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

import {NoteItem} from "$source/type/note";
import {MyInput} from "$source/components/MyInput";
import {useDebounceFn} from "ahooks";
import clsx from "clsx";

export function Middle() {

  const searchData = useAppStore(state => state.searchData);


  const itemList = useNoteStore(state => state.itemList)
  const setItemList = useNoteStore(state => state.setItemList)

  const itemIndex = useNoteStore(state => state.itemIndex)
  const setItemIndex = useNoteStore(state => state.setItemIndex)

  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

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
    showConfirmModal('确认删除笔记吗？')
      .then(() => {
        myAgent.xxx()
          .then(() => {
            showSuccessMessage('删除成功');
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
    <div className={"middle flex-col"}>
      <div className={"search-wrapper"}>
        <MyInput value={keywords} onChange={onKeywordsChange} onSearch={onConfirmKeywordsChange}/>
        <button onClick={onConfirmKeywordsChange}>Search</button>
        <button onClick={onCreateNewNote} disabled={focusTag.startsWith(TAG_TRASH)}>New</button>
        {focusTag.startsWith(TAG_TRASH) ?
          <button onClick={onCleanData}>cleanup</button>
          : ''}
      </div>


      <div className={'aaaa-x-box flex-row align-center justify-between'}>

        <div className={'flex-row stats-wrapper'}>
          {totalQuantity}条笔记
        </div>

        <div className="order-wrapper flex-row">
          <div>
            <MySelect value={orderColumn} onChange={onChangeOrderColumn} columns={['modified', 'created', 'title']}/>
          </div>
          <div>
            <MySelect value={orderDirection} onChange={onChangeOrderDirection} columns={['desc', 'asc']}/>
          </div>
        </div>

      </div>


      <div className={"list-item-box auto-stretch"}>
        <div className="list-item fill-box" ref={listItemBoxRef}>
          {itemList.map((item, index) => {
            return <ListItem key={item.path} index={index} item={item}></ListItem>
          })}
          {isAtBottom ? '' : <div onClick={() => onClickLoadMore()} className={'load-more'}>加载更多...</div>}
        </div>
      </div>

    </div>
  )
}

function ListItem({index, item}) {

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
      {'title': '置顶/取消置顶', onClick: () => updateNotePined(value.path, !value.pined)},
      {'title': '添加标签', onClick: () => addNoteTag(value)},
      {
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
      },
    ]
    if (selectIndexes.includes(index)) {
      items.push({'title': deleted ? '删除' : '恢复', onClick: () => deleteSelected(deleted)})
    }
    openContextMenu(<MyContextMenu e={e} items={items}></MyContextMenu>)
  }

  function refreshNoteContent()
  {
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

  function updateNotePined(path, pined) {
    readOnlineFileFrontMatter(path)
      .then(matter => {
        let props = {
          ...matter.props,
          pined
        };
        writeFile({props, body: matter.body}, path)
          .then(() => {
            let current = itemList.findIndex(v => v.path === path);
            itemList[current].pined = pined;
            useNoteStore.getState().setItemList([...itemList])
          })
      })
  }

  function addNoteTag(item) {
    const paths = getSelectedItemPaths();

    showInputModal('批量添加标签', '')
      .then(tagName => {
        console.log(tagName)
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

  return (
    <div key={index} className={clsx('li', {
      active: itemIndex === index,
      selected: selectIndexes.includes(index),
    })}
         onClick={(e) => onClickItem(e, index)}
         onContextMenu={(e) => openFileManageContextMenu(e, item, index)}>
      {item.pined ? <span>[top]</span> : ''}
      <span
        className={clsx('list-item-title text-title', {new: item.isNew})}
        title={item.title}>{item.title || 'Untitled'}</span>
    </div>
  )
}
