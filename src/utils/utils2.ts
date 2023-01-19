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
