import * as cheerio from "cheerio";
import {isRemoteUrl} from "./utils";
import imageCrawler from "./imageCrawler";
import {sharedVariables} from "../store/globalData";
import {appConfig} from "../config/app";

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

// export function getOnlineImages(text) {
//   let html = markdown2html(text)
//   const $ = cheerio.load(html)
//   let images = {};
//   $('img').each((i, ele) => {
//     let originSrc = ele.attribs.src;
//     if (appConfig.onlineImageUrl && appConfig.offlineImageUrl
//       && originSrc.startsWith(appConfig.onlineImageUrl)) {
//       let replaceSrc = originSrc.replace(appConfig.onlineImageUrl, appConfig.offlineImageUrl);
//       images[replaceSrc] = originSrc;
//     }
//   })
//   return images;
// }

export function replaceOnlineImagesMarkdown(text, map: Record<string, any>) {
  for (const [k, v] of Object.entries(map)) {
    text = text.replaceAll(v, k);
  }
  return text;
}

export function restoreOnlineImagesMarkdown(text, map: Record<string, any>) {
  for (const [k, v] of Object.entries(map)) {
    text = text.replaceAll(k, v);
  }

  if (appConfig.onlineImageUrl && appConfig.offlineImageUrl) {
    text = text.replaceAll(appConfig.offlineImageUrl, appConfig.onlineImageUrl);
  }

  return text;
}



