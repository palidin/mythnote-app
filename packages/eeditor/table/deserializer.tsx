import {MarkdownDeserializerWithTransform} from "@editablejs/deserializer/markdown";
import {editorSettings} from "../store";
import {HTMLDeserializer} from "@editablejs/deserializer/html";
import {xTableColumn, xTableStartWords} from "./embed-table-constant";


export const withEmbedTableMarkdownDeserializerTransform: MarkdownDeserializerWithTransform = (next, self) => {
  return (node, options = {}) => {
    const {type} = node
    if (type === 'html') {
      const c = node.value as string;
      if (c) {
        const editor = editorSettings.editorInstance;
        if (c.startsWith(xTableStartWords)) {
          const domNode = createNode(c);
          const children = []
          for (const child of domNode.childNodes) {
            children.push(...(HTMLDeserializer.transformWithEditor(editor, child)));
          }
          return [
            {
              type: 'table',
              children: children,
              [xTableColumn]: true,
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
