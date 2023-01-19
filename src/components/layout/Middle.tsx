import classNames from "classnames";
import React, {useRef, useState} from "react";
import {useDebounce} from "../../utils/HookUtils";
import {resetSearchCondition, writeFile} from "../../utils/NoteUtils";
import {getUUid, openContextMenu} from "../../utils/utils";
import {MyContextMenu} from "../MyContextMenu";
import {myAgent} from "../../agent/agentType";
import {readContentFrontMatter} from "../../utils/utils4";
import {sharedVariables} from "../../state";
import {isAtBottomAtom, itemIndexAtom, itemListAtom, searchDataAtom} from "../../store/app";
import {useAtom} from "jotai";

export function Middle(){


    const[searchData,setSearchData] = useAtom(searchDataAtom);
    const[itemList,setItemList] = useAtom(itemListAtom);
    const[itemIndex,setItemIndex] = useAtom(itemIndexAtom);
    const[isAtBottom] = useAtom(isAtBottomAtom);

    function onKeywordsChange(e) {
        let keywords = e.target.value;
        setKeywords(keywords);
        afdasfa(keywords);
    }

    const afdasfa = useDebounce(aKeywords);

    const [keywords, setKeywords] = useState('');

    function onConfirmKeywordsChange() {
        let keywords = keywordsRef.current.value;
        setKeywords(keywords);
        aKeywords(keywords);
    }

    function aKeywords(keywords) {
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
        };
        setItemList([newItem, ...itemList])
        setItemIndex(0);
    }

    function onClickItem(i) {
        if (itemIndex === i) {
            return;
        }
        setItemIndex(i);
    }

    function openFileManageContextMenu(e, value) {
        e.preventDefault();
        e.stopPropagation();
        let items = [
            {'title': '置顶/取消置顶', onClick: () => updateNotePined(value.path, !value.pined)},
        ]
        openContextMenu(<MyContextMenu e={e} items={items}></MyContextMenu>)
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

    return (
        <div className={"middle"}>
            <div className={"search-wrapper"}>
                <input type="text" ref={keywordsRef} value={keywords} onChange={onKeywordsChange}/>
                <button onClick={onConfirmKeywordsChange}>confirm</button>
                <button onClick={onCreateNewNote}>New</button>
            </div>

            <div className={"list-item"}>
                <ul>
                    {itemList.map((item, index) => {
                        return <li key={index} className={itemIndex === index ? 'active' : ''}
                                   onClick={() => onClickItem(index)}
                                   onContextMenu={(e) => openFileManageContextMenu(e, item)}>
                            {item.pined ? <span>[top]</span> : ''}
                            <span className={classNames('list-item-title', {new: item.isNew})}>{item.name}</span>
                        </li>
                    })}
                    {isAtBottom ? '' : <li onClick={onClickLoadMore} className={'load-more'}>加载更多</li>}
                </ul>
            </div>

        </div>
    )
}
