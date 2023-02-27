import classNames from "classnames";
import React, {useEffect, useRef, useState} from "react";
import {MySelect, useDebounce} from "../../utils/HookUtils";
import {readOnlineFileFrontMatter, resetSearchCondition, writeFile} from "../../utils/FileUtils";
import {delayRun, getUUid, openContextMenu, selectEnd, selectStart} from "../../utils/utils";
import {MyContextMenu} from "../MyContextMenu";
import {myAgent} from "../../agent/agentType";
import {sharedVariables} from "../../store/globalData";
import {useAppStore, useNoteStore} from "../../store/store";
import {showConfirmModal} from "../../utils/MessageUtils";
import {TAG_TRASH} from "../../config/app";

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

  const focusTag = useAppStore(state => state.focusTag);

  useEffect(() => {
    if (focusTag == searchData.folder) return;
    resetSearchCondition(setItemList, {folder: focusTag})
  }, [focusTag])

  useEffect(() => {
    fetchItemList(searchData, itemList);
  }, [searchData])

  function fetchItemList(searchData, itemList) {
    myAgent.fileList(searchData)
      .then(res => {
        let isAtBottom = !res.items.length || res.pages == searchData.page;
        setIsAtBottom(isAtBottom);
        if (res.items.length && !itemList.length) {
          setItemIndex(0)
        }
        setItemList([...itemList, ...res.items])
        setIsFetching(false);

        if (!isAtBottom) {
          delayRun(100)
            .then(() => {
              autoScroll()
            })
        }
      })
  }

  function onKeywordsChange(e) {
    let keywords = e.target.value;
    setKeywords(keywords);
    onLoadData(keywords, searchData);
  }

  const onLoadData = useDebounce(loadData);

  const [keywords, setKeywords] = useState('');

  function onConfirmKeywordsChange() {
    let keywords = keywordsRef.current.value;
    setKeywords(keywords);
    loadData(keywords, searchData);
  }

  function loadData(keywords, searchData) {
    resetSearchCondition(setItemList, {keywords})
  }

  function refreshNotes(keywords, searchData) {
    resetSearchCondition(setItemList, {})
  }

  function onClickLoadMore(isForce = false) {
    if (!isForce && isAtBottom) {
      return;
    }
    if (!isForce && isFetching) {
      return;
    }
    setIsFetching(true);

    let page = searchData.page + 1;
    useAppStore.getState().setSearchData({
      ...searchData,
      page,
    });
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

  const keywordsRef = useRef(null);

  function onCreateNewNote() {
    let newItem = {
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
    showConfirmModal('确认删除笔记文件吗？')
      .then(() => {
        myAgent.xxx()
          .then(() => {
            alert('删除成功');
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
      resetSearchCondition(setItemList, {
        order: {
          column: orderColumn,
          direction: orderDirection,
        }
      })
    }
  }, [orderColumn, orderDirection])


  return (
    <div className={"middle flex-col"}>
      <div className={"search-wrapper"}>
        <input type="text" ref={keywordsRef} value={keywords} onChange={onKeywordsChange}/>
        <button onClick={onConfirmKeywordsChange}>Search</button>
        <button onClick={onCreateNewNote} disabled={focusTag.startsWith(TAG_TRASH)}>New</button>
        {focusTag.startsWith(TAG_TRASH) ?
          <button onClick={onCleanData}>cleanup</button>
          : ''}
      </div>

      <div className="order-wrapper flex-row">
        <div className="order-wrapper-left">
          <MySelect value={orderColumn} onChange={onChangeOrderColumn} columns={['modified', 'created', 'title']}/>
        </div>
        <div className="order-wrapper-left">
          <MySelect value={orderDirection} onChange={onChangeOrderDirection} columns={['desc', 'asc']}/>
        </div>
      </div>

      <div className={"list-item-box auto-stretch"}>
        <div className="list-item fill-box" ref={listItemBoxRef}>
          {itemList.map((item, index) => {
            return <ListItem key={item.path} index={index} item={item} refreshNotes={refreshNotes}></ListItem>
          })}
          {isAtBottom ? '' : <div onClick={() => onClickLoadMore()} className={'load-more'}>加载更多...</div>}
        </div>
      </div>

    </div>
  )
}

function ListItem({index, item, refreshNotes}) {

  function onClickItem(e, i) {
    if (itemIndex === i) {
      return;
    }
    if (e.shiftKey) {
      selectEnd(i)
    } else {
      selectStart(i)
      useNoteStore.getState().setItemIndex(i);
    }
  }

  const selectIndexes = useAppStore(state => state.selectIndexes);

  function openFileManageContextMenu(e, value, index) {
    e.preventDefault();
    e.stopPropagation();

    let focusTag = useAppStore.getState().focusTag;

    let deleted = true;
    if (focusTag && focusTag.startsWith(TAG_TRASH)) {
      deleted = false;
    }

    let items = [
      {'title': '置顶/取消置顶', onClick: () => updateNotePined(value.path, !value.pined)},
    ]
    if (selectIndexes.includes(index)) {
      items.push({'title': deleted ? '删除' : '恢复', onClick: () => deleteSelected(deleted)})
    }
    openContextMenu(<MyContextMenu e={e} items={items}></MyContextMenu>)
  }

  function deleteSelected(deleted) {
    let indexes = selectIndexes;

    function handle() {
      let paths = indexes.map(v => itemList.at(v)).map(v => v.path);

      myAgent.fileDelete(paths, deleted ? 1 : 0)
        .then(() => {
          refreshNotes();
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
        sharedVariables.fileDataCache[path] = matter;

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

  const itemList = useNoteStore(state => state.itemList)
  const itemIndex = useNoteStore(state => state.itemIndex)

  return (
    <div key={index} className={classNames('li', {
      active: itemIndex === index,
      selected: selectIndexes.includes(index),
    })}
         onClick={(e) => onClickItem(e, index)}
         onContextMenu={(e) => openFileManageContextMenu(e, item, index)}>
      {item.pined ? <span>[top]</span> : ''}
      <span
        className={classNames('list-item-title text-title', {new: item.isNew})}
        title={item.title}>{item.title || 'Untitled'}</span>
    </div>
  )
}
