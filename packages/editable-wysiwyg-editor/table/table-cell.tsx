import {HTMLDeserializer, HTMLDeserializerWithTransform} from '@editablejs/deserializer/html'
import {Element, isDOMHTMLElement} from '@editablejs/models'
import {editorSettings} from "../store";
import {createParagraphWithNodes} from "../utils/editorUtils";
import {HTMLSerializerWithTransform} from "@editablejs/serializer/html";
import {xEMPTY_TABLE_CELL_WORDS} from "./embed-table-constant";
import {MarkdownSerializerWithTransform} from "@editablejs/serializer/dist/markdown";

export const withTableCellHTMLDeserializerTransform: HTMLDeserializerWithTransform = (next) => {
  return (node, options = {}) => {
    if (isDOMHTMLElement(node)) {
      if (node.tagName.toUpperCase() == 'TD') {

        let childNodes = Array.from(node.childNodes);
        childNodes = getFixedChildNodes(childNodes);

        const editor = editorSettings.editorInstance;
        const children = []
        for (const child of childNodes) {
          children.push(...(HTMLDeserializer.transformWithEditor(editor, child)));
        }

        const {colSpan, rowSpan} = node as HTMLTableCellElement
        return [
          {
            type: 'table-cell',
            children: children,
            colspan: colSpan,
            rowspan: rowSpan,
          },
        ]
      }
    }
    return next(node, options)
  }
}


export const withTableCellHTMLSerializerTransform: HTMLSerializerWithTransform = (next, serializer) => {
  return (node, options = {}) => {
    if (Element.isElement(node) && node.type === 'table-cell') {
      const {attributes} = options ?? {}
      // @ts-ignore
      if (node.children.length == 1 && node.children[0].text === '') {
        return serializer.create(
          'td',
          attributes,
          {},
          xEMPTY_TABLE_CELL_WORDS,
        )
      }
    }
    return next(node, options)
  }
}

export const withTableCellMarkdownSerializerTransform: MarkdownSerializerWithTransform = (next) => {
  return (node, options = {}) => {
    if (Element.isElement(node) && node.type === 'table-cell') {
      // @ts-ignore
      if (node.children.length == 1 && node.children[0].text === '') {
        return [
          {
            type: 'tableCell',
            children: [{
              type: 'text',
              value: xEMPTY_TABLE_CELL_WORDS,
            }],
          }
        ]
      }
    }
    return next(node, options)
  }
}

function getFixedChildNodes(childNodes) {
  const indexes = [];
  childNodes.forEach((childNode, k) => {
    if (childNode.nodeName.toUpperCase() == 'BR') {
      indexes.push(k);
    }
  })

  const groups = splitNodes(childNodes, indexes) as HTMLElement[][];
  if (groups.length) {
    childNodes = groups.map(v => createParagraphWithNodes(v))
  }

  return childNodes;
}

function splitNodes(childNodes, indexes) {
  const alen = indexes.length;
  if (!alen) {
    return [];
  }
  let groups = [];

  let start = 0;
  for (let i = 0; i < alen; i++) {
    groups[i] = childNodes.slice(start, indexes[i])
    start = indexes[i] + 1;
    if (i == alen - 1) {
      groups[i + 1] = childNodes.slice(start, childNodes.length)
    }
  }
  return groups;
}
