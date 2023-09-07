import {MarkdownSerializerWithTransform} from "@editablejs/serializer/dist/markdown";
import {Table} from "@editablejs/plugin-table";
import {HTMLSerializer, HTMLSerializerAttributes, HTMLSerializerStyle} from "@editablejs/serializer/html";
import {editorSettings} from "../store";
import {TableEditor} from "@editablejs/plugins";
import {xTableColumn, xTableStartWords} from "./embed-table-constant";


HTMLSerializer.create = create;


export const withEmbedTableMarkdownSerializerTransform: MarkdownSerializerWithTransform = (
  next
) => {

  return (node, options = {}) => {

    if (Table.isTable(node) && node[xTableColumn]) {

      const editor = editorSettings.editorInstance;

      const children = node.children.map(child => HTMLSerializer.transformWithEditor(editor, child)).join('');
      const table = xTableStartWords + `${children.replaceAll(' colspan="1" rowspan="1"', '')}</table>`

      return [
        {
          type: 'paragraph',
          children: [{
            type: 'html',
            value: table,
          }],
        }
      ]
    }
    return next(node, options)
  }
}


function create(
  tag: string,
  attributes: HTMLSerializerAttributes = {},
  style?: HTMLSerializerStyle,
  children: string = '',
) {
  const attributesString = htmlAttributesToString(attributes)


  return `<${tag} ${attributesString}>${children}</${tag}>`
}

const kebabCase = (str: string) => {
  TableEditor.insert
  const regex = new RegExp(/[A-Z]/g)
  return str.replace(regex, v => `-${v.toLowerCase()}`)
}

const htmlAttributesToString = (attributes: Record<string, any>): string => {
  return Object.keys(attributes).reduce((accumulator, key) => {
    // transform the key from camelCase to kebab-case
    const attrKey = kebabCase(key)
    // remove ' in value
    const attrValue = String(attributes[key]).replace("'", '')
    // build the result
    // you can break the line, add indent for it if you need
    return `${accumulator}${attrKey}="${attrValue}" `
  }, '')
}
