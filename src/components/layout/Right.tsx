import classNames from "classnames";
import {formatDisplayTime, openContextMenu} from "../../utils/utils";
import React, {useEffect, useMemo, useRef, useState} from "react";
import {RichTextEditor} from "../RichTextEditor";
import {FileItem, myAgent} from "../../agent/agentType";
import {FileData, readContentFrontMatter} from "../../utils/utils4";
import {useDebounce} from "../../utils/HookUtils";
import {sharedVariables} from "../../state";
import {showConfirmModal, showInputModal} from "../../utils/utils3";
import {MyContextMenu} from "../MyContextMenu";
import {writeFile} from "../../utils/NoteUtils";
import {useAtom} from "jotai";
import {isAtBottomAtom, itemIndexAtom, itemListAtom, searchDataAtom} from "../../store/app";

export function Right(){

    const EMPTY_FILE = {
        body: '',
        props: {},
        __hidden: true
    }

    const [currentFile, setCurrentFile] = useState<FileData>(EMPTY_FILE);
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const[searchData,setSearchData] = useAtom(searchDataAtom);
    const[itemList,setItemList] = useAtom(itemListAtom);
    const[itemIndex,setItemIndex] = useAtom(itemIndexAtom);
    const[isAtBottom,setIsAtBottom] = useAtom(isAtBottomAtom);


    const path = useMemo(() => {
        return itemList[itemIndex]?.path;
    }, [itemList, itemIndex]);


    useEffect(() => {
        fetchItemList(searchData, itemList);
    }, [searchData])

    useEffect(() => {
        setIsLoading('__hide' in currentFile);
    }, [currentFile])


    useEffect(() => {
        if (!path) {
            return;
        }
        myAgent.read(path)
            .then(res => {
                let matter
                if (!res) {
                    matter = EMPTY_FILE
                } else {
                    matter = readContentFrontMatter(res)
                }
                setCurrentFile(matter)
                setContent(matter.body)

                sharedVariables.path = path;
                sharedVariables.currentFile = {...matter};
                sharedVariables.fileDataCache[path] = matter;
            })
    }, [path]);


    useEffect(() => {
        let newItem = {...itemList[itemIndex]};
        if (currentFile.props.title) {
            newItem.name = currentFile.props.title;
        }

        let copyItemList = [...itemList]
        copyItemList.splice(itemIndex, 1, newItem);
        setItemList(copyItemList)
    }, [isLoading, currentFile])


    const wrapWriteFileProps = useDebounce(writeFile);

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


    function updateCurrentFile(file, path) {
        if (!path) return;
        if (sharedVariables.saveFilePath && sharedVariables.saveFilePath !== path) return;
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

    function onClickItem(i) {
        if (itemIndex === i) {
            return;
        }
        setItemIndex(i);
    }

    function onTitleChange(e) {
        let title = e.target.value;
        updateProps({title})
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
            .then(res => {
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
            <div className={classNames('note-detail full-fill flex-col', {'hide': isLoading})}>

                <div className={"note-title"}>
                    <div>
                        <input type="text" onInput={onTitleChange}
                               value={currentFile.props.title || ''}/>
                    </div>
                    <div className={'info'}>
                        <span>{formatDisplayTime(currentFile.props.created)}</span>
                        <span>{path}</span>
                        {currentFile.props.source_url ? `<span><a href="${currentFile.props.source_url}">${currentFile.props.source_url}</a></span>` : ''}
                    </div>

                    <div className={'info'}>
                        {
                            currentFile.props.tags?.length
                                ? <> {
                                    currentFile.props.tags.map((v, k) => {
                                        return <span key={k}
                                                     onContextMenu={(e) => openTagManageContextMenu(e, v)}
                                                     className={v === searchData.currentFolder ? 'active' : ''}>{v}</span>;
                                    })
                                }</>
                                : ''
                        }

                    </div>
                </div>

                <div className={"note-toolbar"}>
                    <span onClick={openAddTagModal}>增加标签</span>
                </div>

                <div className={"note-content flex-col full-fill"}>
                    <TextEditor {...{content, updateBody}}></TextEditor>
                </div>
            </div>
            <div className={classNames('mask full-fill', {'hide': !isLoading})}></div>
        </div>
    )
}


const TextEditor = React.memo((props) => {
    // @ts-ignore
    return <RichTextEditor {...props}></RichTextEditor>;
})