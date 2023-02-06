import classNames from "classnames";
import {formatDisplayTime, openContextMenu, substrTitle} from "../../utils/utils";
import React, {useEffect, useMemo, useRef, useState} from "react";
import {RichTextEditor} from "../RichTextEditor";
import {myAgent} from "../../agent/agentType";
import {diffSecondsFromNow, FileData, readContentFrontMatter, writeFile} from "../../utils/FileUtils";
import {useDebounce} from "../../utils/HookUtils";
import {sharedVariables} from "../../store/state";
import {showConfirmModal, showInputModal} from "../../utils/MessageUtils";
import {MyContextMenu} from "../MyContextMenu";
import {useAtom} from "jotai";
import {itemIndexAtom, itemListAtom, searchDataAtom} from "../../store/app";
import {store} from "../../store/store";

export function Right() {

    const EMPTY_FILE = {
        body: '',
        props: {},
    }

    const [currentFile, setCurrentFile] = useState<FileData>(EMPTY_FILE);
    const [content, setContent] = useState('');

    const [searchData] = useAtom(searchDataAtom);
    const [itemList, setItemList] = useAtom(itemListAtom);
    const [itemIndex] = useAtom(itemIndexAtom);


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
                setContent(matter.body)
                sharedVariables.path = path;
                sharedVariables.currentListItems = itemList
                sharedVariables.currentListIndex = itemIndex
                sharedVariables.currentFile = {...matter};
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

        return myAgent.read(path)
            .then(res => {
                return Promise.resolve(readContentFrontMatter(res))
            })
    }


    const wrapWriteFileProps = useDebounce((...args) => {

        const [currentFile, path] = args;

        let itemList = sharedVariables.currentListItems;
        let parentTag = store.focusTag;
        let activeIndex = itemList.findIndex(v => v.path == path);
        let activeItem = itemList[activeIndex];
        let isNew = activeItem.isNew;

        let title = activeItem.title;
        let substringTitle = substrTitle(currentFile.body);


        if (!title ||
            (substringTitle.startsWith(title) && diffSecondsFromNow(currentFile.props.created) < 600)) {
            title = substringTitle;

            currentFile.props.title = title;

            titleChangeHandler(itemList, activeIndex, title)
        }

        setCurrentFile({
            ...currentFile,
        })

        if (isNew && parentTag) {
            currentFile.props.tags = [parentTag];
        }

        writeFile(currentFile, path)
            .then((res) => {
                if (isNew && res === 0) {
                    itemList.splice(activeIndex, 1, {
                        ...itemList[activeIndex],
                        isNew: false,
                    })
                    setItemList([...itemList])
                }

            })
    });

    function updateCurrentFile(file, path) {
        if (!path) return;
        setCurrentFile(file)
        wrapWriteFileProps(file, path);
    }

    function updateBodyx(text) {
        if (!sharedVariables.currentFile) return
        updateCurrentFile({
            props: {...sharedVariables.currentFile.props},
            body: text
        }, sharedVariables.path)
    }

    const updateBody = useRef(updateBodyx);

    function updateProps(props) {
        updateCurrentFile({
            body: currentFile.body,
            props: {
                ...currentFile.props,
                ...props
            }
        }, path)
    }

    function onTitleChange(e) {
        titleChangeHandler(itemList, itemIndex, e.target.value, !itemList[itemIndex].isNew)
    }

    function titleChangeHandler(itemList, itemIndex, title, save = false) {
        if (save) {
            updateProps({title})
        }

        itemList.splice(itemIndex, 1, {
            ...itemList[itemIndex],
            title,
        })

        sharedVariables.currentListItems = itemList;

        setItemList([...itemList])
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

    return (
        <div className="right flex-col">
            <div className={classNames('note-detail auto-stretch flex-col', {'hide': isEmpty})}>

                <div className={"note-title"}>
                    <div>
                        <input type="text" onInput={onTitleChange}
                               value={itemList[itemIndex]?.title || ''}/>
                    </div>
                    <div className={'info'}>
                        <span>{formatDisplayTime(currentFile.props.created)}</span>
                        <span>{path}</span>
                        {currentFile.props.source_url ? `<span><a href="${currentFile.props.source_url}">${currentFile.props.source_url}</a></span>` : ''}
                    </div>

                    <div className={'info note-tags'}>
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
                    <span onClick={openAddTagModal}>增加标签</span>
                </div>

                <div className={"note-content flex-col auto-stretch"}>
                    <TextEditor {...{content, updateBody}}></TextEditor>
                </div>
            </div>
            <div className={classNames('mask auto-stretch', {'hide': !isEmpty})}></div>
        </div>
    )
}


const TextEditor = React.memo((props) => {
    // @ts-ignore
    return <RichTextEditor {...props}></RichTextEditor>;
})
