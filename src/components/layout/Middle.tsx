import classNames from "classnames";
import React, {useEffect, useRef, useState} from "react";
import {useDebounce} from "../../utils/HookUtils";
import {readContentFrontMatter, resetSearchCondition, writeFile} from "../../utils/FileUtils";
import {getUUid, openContextMenu, selectEnd, selectStart} from "../../utils/utils";
import {MyContextMenu} from "../MyContextMenu";
import {myAgent} from "../../agent/agentType";
import {sharedVariables} from "../../store/state";
import {isAtBottomAtom, itemIndexAtom, itemListAtom, searchDataAtom} from "../../store/app";
import {useAtom} from "jotai";
import {store} from "../../store/store";
import {showConfirmModal} from "../../utils/MessageUtils";

export function Middle() {


    const [searchData, setSearchData] = useAtom(searchDataAtom);
    const [itemList, setItemList] = useAtom(itemListAtom);
    const [itemIndex, setItemIndex] = useAtom(itemIndexAtom);
    const [isAtBottom, setIsAtBottom] = useAtom(isAtBottomAtom);

    useEffect(() => {
        if (itemIndex == 0) {
            selectStart(itemIndex)
        }
    }, [itemIndex])

    useEffect(() => {
        if (store.focusTag == searchData.folder) return;
        resetSearchCondition(setItemList, searchData, setSearchData, {folder: store.focusTag})
    }, [store.focusTag])

    useEffect(() => {
        fetchItemList(searchData, itemList);
    }, [searchData])

    function fetchItemList(searchData, itemList) {
        myAgent.fileList(searchData)
            .then(res => {
                setIsAtBottom(!res.items.length || res.pages == searchData.page);
                if (res.items.length && !itemList.length) {
                    setItemIndex(0)
                }
                setItemList([...itemList, ...res.items])
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
        resetSearchCondition(setItemList, searchData, setSearchData, {keywords})
    }

    function onClickLoadMore() {
        let page = searchData.page + 1;
        setSearchData({
            ...searchData,
            page,
        });
    }

    const keywordsRef = useRef(null);

    function onCreateNewNote() {
        let newItem = {
            path: getUUid() + '.md',
            name: 'Untitled',
            isNew: true,
            props: null,
        };

        if (store.focusTag) {
            newItem.props = {
                tags: [store.focusTag]
            };
        }

        setItemList([newItem, ...itemList])
        setItemIndex(0);
    }


    return (
        <div className={"middle flex-col"}>
            <div className={"search-wrapper"}>
                <input type="text" ref={keywordsRef} value={keywords} onChange={onKeywordsChange}/>
                <button onClick={onConfirmKeywordsChange}>Search</button>
                <button onClick={onCreateNewNote} disabled={store.focusTag.startsWith('//')}>New</button>
            </div>

            <div className={"list-item-box auto-stretch"}>
                <div className="list-item fill-box">
                    {itemList.map((item, index) => {
                        return <ListItem key={item.path} index={index} item={item}></ListItem>
                    })}
                    {isAtBottom ? '' : <div onClick={onClickLoadMore} className={'load-more'}>加载更多...</div>}
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
        } else {
            selectStart(i)
            setItemIndex(i);
        }
    }


    function openFileManageContextMenu(e, value, index) {
        e.preventDefault();
        e.stopPropagation();

        let deleted = true;
        if (store.focusTag && store.focusTag.startsWith('//')) {
            deleted = false;
        }

        let items = [
            {'title': '置顶/取消置顶', onClick: () => updateNotePined(value.path, !value.pined)},
        ]
        if (store.selectIndexes.includes(index)) {
            items.push({'title': deleted ? '删除' : '恢复', onClick: () => deleteSelected(deleted)})
        }
        openContextMenu(<MyContextMenu e={e} items={items}></MyContextMenu>)
    }

    function deleteSelected(deleted) {
        let indexes = store.selectIndexes;

        function handle() {
            let paths = indexes.map(v => itemList.at(v)).map(v => v.path);

            myAgent.fileDelete(paths, deleted ? 1 : 0)
                .then(() => {
                    location.reload();
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
        myAgent.read(path)
            .then(res => {
                let matter = readContentFrontMatter(res);
                sharedVariables.fileDataCache[path] = matter;

                let props = {
                    ...matter.props,
                    pined
                };
                writeFile({props, body: matter.body}, path)
                    .then(() => {
                        let current = itemList.findIndex(v => v.path === path);
                        itemList[current].pined = pined;
                        setItemList([...itemList])
                    })
            })
    }

    const [itemList, setItemList] = useAtom(itemListAtom);
    const [itemIndex, setItemIndex] = useAtom(itemIndexAtom);


    return (
        <div key={index} className={classNames('li', {
            active: itemIndex === index,
            selected: store.selectIndexes.includes(index),
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