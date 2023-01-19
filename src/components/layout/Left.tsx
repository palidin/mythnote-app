import {TagFolder} from "../TagFolder";
import React from "react";
import {resetSearchCondition} from "../../utils/NoteUtils";
import {useAtom} from "jotai";
import {itemListAtom, searchDataAtom} from "../../store/app";

export function Left() {

    const [searchData, setSearchData] = useAtom(searchDataAtom);
    const [, setItemList] = useAtom(itemListAtom);

    const folders = [
        {
            'name': 'a', 'fullname': 'a', children: [
                {
                    'name': '张三', 'fullname': 'a/张三', children: [
                        {'name': '张三1', 'fullname': 'a/张三/张三1'},
                        {'name': '张三2', 'fullname': 'a/张三/张三2'},
                    ]
                },
                {'name': '李四', 'fullname': 'a/李四'},
            ]
        }
    ];

    function onTagClick(folder) {
        resetSearchCondition(setItemList, searchData, setSearchData, {folder})
    }

    return (
        <div className={"left"}>
            <TagFolder folders={folders} onTagClick={onTagClick}></TagFolder>
        </div>
    );
}
