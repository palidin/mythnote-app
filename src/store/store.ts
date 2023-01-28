import resso from "resso";

export const store = resso({
    focusTag: '',

    tokenRefreshing: false,

    dataRebuilding: true,

    startIndex: -1,
    selectIndexes: [],
});