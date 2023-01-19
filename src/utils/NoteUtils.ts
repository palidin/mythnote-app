import {updateFileBodyWithProps} from "./utils4";

export function resetSearchCondition(setItemList,searchData,setSearchData,obj) {

    let page = 1;
    setItemList([]);
    setSearchData({
        ...searchData,
        ...{obj},
        page,
    });
}

export function writeFile(currentFile, path) {
    return updateFileBodyWithProps(path, currentFile.body, currentFile.props)
}