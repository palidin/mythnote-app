import '../assets/style/layout.scss';
import {useEffect, useMemo, useRef, useState} from "react";
import {RichTextEditor} from "./RichTextEditor";
import {FileItem, myAgent} from "../agent/agentType";
import {formatDisplayTime, getUUid, openContextMenu} from "../utils/utils";
import '../assets/style/contextmenu.css'
import {MyContextMenu} from "./MyContextMenu";
import {showConfirmModal, showInputModal} from "../utils/utils3";
import {FileData, readContentFrontMatter, updateFileBodyWithProps} from "../utils/utils4";
import {useDebounce, useMount} from "../utils/HookUtils";
import {sharedVariables} from "../state";
import classNames from "classnames";
import {TagFolder} from "./TagFolder";


export function Layout() {


    const EMPTY_FILE = {
        body: '',
        props: {},
        __hidden: true
    }

    const [itemList, setItemList] = useState<FileItem[]>([]);
    const [itemIndex, setItemIndex] = useState(-1);
    const [currentFile, setCurrentFile] = useState<FileData>(EMPTY_FILE);
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isAtBottom, setIsAtBottom] = useState(false);
    const [searchData, setSearchData] = useState({
        page: 1,
        limit: 10,
        keywords: '',
        folder: '',
    });

    const path = useMemo(() => {
        return itemList[itemIndex]?.path;
    }, [itemList, itemIndex]);


    useMount(() => {
        document.oncontextmenu = () => {
            return false;
        }
    });

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
        // setCurrentFile(EMPTY_FILE)
        myAgent.read(path)
            .then(res => {
                let matter = readContentFrontMatter(res)
                setCurrentFile(matter)
                setContent(matter.body)

                sharedVariables.path = path;
                sharedVariables.currentFile = {...matter};
                sharedVariables.fileDataCache[path] = matter;
            })
    }, [path]);


    useEffect(() => {
        if (isLoading) return;
        let newItem = {...itemList[itemIndex], name: currentFile.props.title}
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

    function writeFile(currentFile, path) {
        return updateFileBodyWithProps(path, currentFile.body, currentFile.props)
    }

    function updateCurrentFile(file, path) {
        if (!path) return;
        if (sharedVariables.saveFilePath && sharedVariables.saveFilePath !== path) return;
        setCurrentFile(file)
        wrapWriteFileProps(file, path);
    }

    function updateBody(text) {
        if (!sharedVariables.currentFile) return
        updateCurrentFile({
            props: {...sharedVariables.currentFile.props},
            body: text
        }, sharedVariables.path)
    }

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
        resetSearchCondition({keywords})
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
        };
        setItemList([newItem, ...itemList])
        setItemIndex(0);
    }

    const folders = [
        {
            'name': 'a', 'fullname': 'a', children: [
                {'name': '张三', 'fullname': 'a/张三',children:[
                        {'name': '张三1', 'fullname': 'a/张三/张三1'},
                        {'name': '张三2', 'fullname': 'a/张三/张三2'},
                    ]},
                {'name': '李四', 'fullname': 'a/李四'},
            ]
        }
    ];

    function onTagClick(folder){
        resetSearchCondition({folder})
    }

    function resetSearchCondition(obj){
        let page = 1;
        setItemList([]);
        setSearchData({
            ...searchData,
            ...{obj},
            page,
        });
    }

    return (
        <div className={"layout"}>
            <div className={"left"}>
                <TagFolder folders={folders} onTagClick={onTagClick}></TagFolder>
            </div>
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
                                {item.name}
                            </li>
                        })}
                        {isAtBottom ? '' : <li onClick={onClickLoadMore} className={'load-more'}>加载更多</li>}
                    </ul>
                </div>

            </div>
            <div className={"right"}>
                <div className={classNames('note-detail', {'hide': isLoading})}>

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

                    <div className={"note-content"}>
                        <RichTextEditor {...{content, updateBody}}></RichTextEditor>
                    </div>
                </div>
                <div className={classNames('mask', {'hide': !isLoading})}></div>
            </div>

            <div id={'popup'}></div>
            <div id={'contextmenu'}></div>
        </div>
    )
}