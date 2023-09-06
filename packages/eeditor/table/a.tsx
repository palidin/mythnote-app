import {MarkdownDeserializerWithTransform} from "@editablejs/deserializer/markdown";
import {editorSettings} from "../store";
import {HTMLDeserializer} from "@editablejs/deserializer/html";
import {tableExtendColumn, xtableStarting} from "./c";


// @ts-ignore
export const bbb: MarkdownDeserializerWithTransform = (next, self) => {
  return (node, options = {}) => {
    const {type} = node
    if (type === 'paragraph') {

      const aa = xtableStarting;

      // @ts-ignore
      const c = node.children[0].value as string;
      if (c) {
        const editor = editorSettings.editorInstance;
        if (c.startsWith(aa)) {
          const domNode = createNode(c);
          const children = []
          for (const child of domNode.childNodes) {
            children.push(...(HTMLDeserializer.transformWithEditor(editor, child)));
          }
          return [
            {
              type: 'table',
              children: children,
              [tableExtendColumn]: true,
            },
          ]
        }
      }
    }
    return next(node, options)
  }
}

function createNode(htmlStr) {
  var div = document.createElement("div");
  div.innerHTML = htmlStr.trim();
  return div.childNodes[0];
}
