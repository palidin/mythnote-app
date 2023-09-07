import {MarkdownDeserializerWithTransform} from "@editablejs/deserializer/markdown";
import {editorSettings} from "../store";
import {HTMLDeserializer} from "@editablejs/deserializer/html";
import {xTableColumn, xTableStartWords} from "./embed-table-constant";
import {createHtmlNode} from "../utils/editorUtils";


export const withEmbedTableMarkdownDeserializerTransform: MarkdownDeserializerWithTransform = (next, self) => {
  return (node, options = {}) => {
    const {type} = node
    if (type === 'html') {
      const c = node.value as string;
      if (c) {
        const editor = editorSettings.editorInstance;
        if (c.startsWith(xTableStartWords)) {
          const domNode = createHtmlNode(c);
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

