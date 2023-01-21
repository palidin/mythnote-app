import {atom} from "jotai";


const app = {
    searchData: {
        page: 1,
        limit: 18,
        keywords: '',
        folder: '',
    },
    itemList: [],
    itemIndex: -1,
    isAtBottom: false,
};

export const searchDataAtom = atom(app.searchData);
export const itemListAtom = atom(app.itemList);
export const itemIndexAtom = atom(app.itemIndex);
export const isAtBottomAtom = atom(app.isAtBottom);
