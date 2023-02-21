import markdown2html from '@ckeditor/ckeditor5-markdown-gfm/src/markdown2html/markdown2html';
import hljs from 'highlight.js';
import {useEffect, useState} from "react";
import "highlight.js/styles/vs2015.css";
import {markdownConfig} from "../ckeditor/markdownPlugin";


export function HtmlPainter({content}) {

  const [text, setText] = useState('');

  useEffect(() => {
    let html = markdown2html(content)
    html = markdownConfig.unescape(html);
    setText(html)
  }, [content])


  useEffect(() => {
    const codes = document.querySelectorAll('.html-painter pre code')
    codes.forEach((el) => {
      // 让code进行高亮
      hljs.highlightElement(el as HTMLElement)
    })

    // @ts-ignore
    window.highlightJsBadge();
  })


  return (
    <div className="html-painter-box allow-copy">
      <div className="html-painter" dangerouslySetInnerHTML={{__html: text}}>
      </div>
    </div>

  )
}
