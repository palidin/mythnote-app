import * as cheerio from "cheerio";
import {isRemoteUrl} from "./utils";
import imageCrawler from "../ckeditor/imageCrawler";
import select from "select-dom";
import {sharedVariables} from "../state";

interface ImageModel {
    html: string,
    src: string,
    alt: string,
}


export function replaceRemoteHostImage(text) {
    let editor = sharedVariables.editor
    const $ = cheerio.load(text)

    let images: ImageModel[] = [];
    $('img').each((i, ele) => {
        let html = $.html(ele);
        let src = ele.attribs.src;
        let alt = ele.attribs.alt;
        images.push({
            html,
            src,
            alt,
        })
    })
    for (let image of images) {
        if (isRemoteUrl(image.src)) {
            imageCrawler.upload(image.src)
                .then(src => {
                    let content = editor.getData()
                    content = content.replaceAll(image.src, src);
                    editor.setData(content)
                })
        }
    }
}


export function flexHeight() {
    let editor = sharedVariables.editor
    if (!editor) {
        return;
    }
    editor.editing.view.change(writer => {
        let rootEl = select('#root');

        let titleEl = select('.right .note-title');

        let toolbarEl = select('.right .note-toolbar');
        let editorToolbarEl = select('.right .note-content .ck-editor__top');
        let wordCountWrapperEl = select('.right .note-content  .ck-word-count');
        let sourceEditor = select('.right .note-content .ck-source-editing-area')



        let editorHeight = rootEl.offsetHeight
            - titleEl.offsetHeight
            - toolbarEl.offsetHeight
            - editorToolbarEl.offsetHeight
            - 5

        if (sourceEditor) {
            sourceEditor.style.setProperty('height', (editorHeight) + 'px', 'important');
        }
        writer.setStyle('height', (editorHeight - wordCountWrapperEl.offsetHeight) + 'px', editor.editing.view.document.getRoot());
    });
}

