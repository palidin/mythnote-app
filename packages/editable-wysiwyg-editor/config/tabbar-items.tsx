import React from 'react'
import {Editable} from '@editablejs/editor'
import {Grid} from '@editablejs/models'
import {
  BlockquoteEditor,
  CodeBlockEditor,
  HeadingEditor,
  HeadingType,
  HrEditor,
  ImageEditor,
  LinkEditor,
  MarkEditor,
  MarkFormat,
  OrderedListEditor,
  TableEditor,
  TaskListEditor,
  UnorderedListEditor,
} from '@editablejs/plugins'
import {HistoryEditor} from '@editablejs/plugin-history'
import {ToolbarItem} from '@editablejs/plugin-toolbar'
import {Icon} from '@editablejs/ui'
import {Translation} from 'react-i18next'

import {languages} from "./codeblock-config";
import {editorSettings} from "../store";
import {EMPTY_LINE_WORDS} from "./eeditor-config";
import {getCodeBlockElement, isActiveTable, readSelectText, updateTableElement} from "../utils/editorUtils";
import {xTableColumn} from "../table/embed-table-constant";

const marks: MarkFormat[] = ['bold', 'italic', 'underline', 'strikethrough', 'code']

export const createToolbarItems = (editor: Editable) => {
  const items: ToolbarItem[] = [
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.undo')}</Translation>,
      disabled: !HistoryEditor.canUndo(editor),
      icon: <Icon name="undo"/>,
      onToggle: () => {
        HistoryEditor.undo(editor)
      },
    },
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.redo')}</Translation>,
      disabled: !HistoryEditor.canRedo(editor),
      icon: <Icon name="redo"/>,
      onToggle: () => {
        HistoryEditor.redo(editor)
      },
    },
  ]
  const markItems: ToolbarItem[] = marks.map(mark => ({
    type: 'button',
    title: <Translation>{t => t(`playground.editor.plugin.${mark}`)}</Translation>,
    active: MarkEditor.isActive(editor, mark),
    icon: <Icon name={mark}/>,
    onToggle: () => {
      MarkEditor.toggle(editor, mark)
    },
  }))
  items.push('separator', ...markItems)
  items.push(
    'separator',
    {
      type: 'dropdown',
      title: <Translation>{t => t('playground.editor.plugin.heading')}</Translation>,
      items: [
        {
          value: 'paragraph',
          content: <Translation>{t => t('playground.editor.plugin.paragraph')}</Translation>,
        },
        {
          value: 'heading-one',
          content: <Translation>{t => t('playground.editor.plugin.heading-one')}</Translation>,
        },
        {
          value: 'heading-two',
          content: <Translation>{t => t('playground.editor.plugin.heading-two')}</Translation>,
        },
        {
          value: 'heading-three',
          content: <Translation>{t => t('playground.editor.plugin.heading-three')}</Translation>,
        },
        {
          value: 'heading-four',
          content: <Translation>{t => t('playground.editor.plugin.heading-four')}</Translation>,
        },
        {
          value: 'heading-five',
          content: <Translation>{t => t('playground.editor.plugin.heading-five')}</Translation>,
        },
        {
          value: 'heading-six',
          content: <Translation>{t => t('playground.editor.plugin.heading-six')}</Translation>,
        },
      ],
      value: HeadingEditor.queryActive(editor) ?? 'paragraph',
      onSelect: value => {
        HeadingEditor.toggle(editor, value as HeadingType)
      },
    },
  )
  items.push(
    'separator',
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.link')}</Translation>,
      active: LinkEditor.isActive(editor),
      onToggle: () => {
        LinkEditor.open(editor)
      },
      icon: <Icon name="link"/>,
    },
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.image')}</Translation>,
      active: ImageEditor.isActive(editor),
      onToggle: () => {
        ImageEditor.open(editor)
      },
      icon: <Icon name="image"/>,
    },
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.blockquote')}</Translation>,
      active: BlockquoteEditor.isActive(editor),
      onToggle: () => {
        BlockquoteEditor.toggle(editor)
      },
      icon: <Icon name="blockquote"/>,
    },
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.unordered-list')}</Translation>,
      active: !!UnorderedListEditor.queryActive(editor),
      onToggle: () => {
        UnorderedListEditor.toggle(editor)
      },
      icon: <Icon name="unorderedList"/>,
    },
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.ordered-list')}</Translation>,
      active: !!OrderedListEditor.queryActive(editor),
      onToggle: () => {
        OrderedListEditor.toggle(editor)
      },
      icon: <Icon name="orderedList"/>,
    },
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.task-list')}</Translation>,
      active: !!TaskListEditor.queryActive(editor),
      onToggle: () => {
        TaskListEditor.toggle(editor)
      },
      icon: <Icon name="taskList"/>,
    },
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.table')}</Translation>,
      disabled: !!TableEditor.isActive(editor),
      onToggle: () => {
        TableEditor.insert(editor)
      },
      icon: <Icon name="table"/>,
    },
    'separator',
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.hr')}</Translation>,
      active: HrEditor.isActive(editor),
      onToggle: () => {
        HrEditor.insert(editor)
      },
      icon: <Icon name="hr"/>,
    },
    'separator',
    {
      type: 'button',
      title: 'Line break',
      active: false,
      onToggle: () => {
        editor.insertText("\n" + EMPTY_LINE_WORDS);
      },
      icon: <LinkEnterIcon/>,
    },
    'separator',
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.code-block')}</Translation>,
      active: CodeBlockEditor.isActive(editor),
      onToggle: () => {
        if (CodeBlockEditor.isActive(editor)) {
          const element = getCodeBlockElement(editor);
          CodeBlockEditor.updateCodeBlock(editor, element, {language: editorSettings.defaultLanguage})
          return;
        }
        const code = readSelectText(editor)
        editor.deleteFragment();
        CodeBlockEditor.insert(editor, {
          code: code,
          language: editorSettings.defaultLanguage,
        })
      },
      icon: <Icon name="codeBlock"/>,
    },
  )

  const isCodeBlock = CodeBlockEditor.isActive(editor);

  if (isCodeBlock) {
    const element = getCodeBlockElement(editor);
    items.push({
      type: 'dropdown',
      title: <Translation>{t => t('playground.editor.plugin.codeblock-language-type')}</Translation>,
      items: languages.map(v => ({
        value: v.value,
        content: v.content,
      })),
      value: element.language,
      onSelect: value => {
        editorSettings.defaultLanguage = value;
        CodeBlockEditor.updateCodeBlock(editor, element, {language: value})
      },
    },)
  }

  const grid = Grid.above(editor)
  if (grid) {
    items.push(
      'separator',
      {
        type: 'button',
        title: <Translation>{t => t('playground.editor.base.merge-cells')}</Translation>,
        disabled: !Grid.canMerge(editor, grid),
        onToggle: () => {
          Grid.mergeCell(editor, grid)
        },
        icon: <Icon name="tableMerge"/>,
      },
      {
        type: 'button',
        title: <Translation>{t => t('playground.editor.base.split-cells')}</Translation>,
        icon: <Icon name="tableSplit"/>,
        disabled: !Grid.canSplit(editor, grid),
        onToggle: () => {
          Grid.splitCell(editor, grid)
        },
      },
      {
        type: 'button',
        title: 'Html table',
        icon: <HtmlIcon/>,
        active: isActiveTable(editor),
        onToggle: () => {
          const grid = Grid.above(editor);
          updateTableElement(editor, grid[0], {[xTableColumn]: !grid[0][xTableColumn]})
        },
      },
    )
  }
  return items
}


const LinkEnterIcon = React.memo<JSX.IntrinsicElements['svg']>(function IconRss(props) {
  return (
    <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
         width="14" height="14">
      <path
        d="M900.181333 385.792v-192a39.978667 39.978667 0 1 0-80 0v192a221.098667 221.098667 0 0 1-65.194666 157.44 221.184 221.184 0 0 1-157.397334 65.152H258.218667l112.384-112.298667a40.106667 40.106667 0 0 0-28.288-68.266666 39.808 39.808 0 0 0-28.330667 11.690666l-178.474667 178.474667a40.021333 40.021333 0 0 0 0 56.618667l183.68 183.808a39.978667 39.978667 0 1 0 56.618667-56.618667L262.4 688.384h335.189333a300.586667 300.586667 0 0 0 214.016-88.576 300.16 300.16 0 0 0 88.576-214.016z"
        fill="#000000"></path>
    </svg>
  )
})

const HtmlIcon = React.memo<JSX.IntrinsicElements['svg']>(function IconRss(props) {

  return (
    <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
         p-id="27610" width="14" height="14">
      <path
        d="M143.36 40.92928L143.34976 40.96 143.36 40.92928z m552.37632-13.824L726.4256 40.96h-18.47296l-12.22656-13.84448z m195.16416 220.98944L880.64 220.9792v15.50336l10.26048 11.61216zM880.6912 983.04H880.64h0.0512zM880.64 236.48256L707.96288 40.96H143.36v942.11072C143.36 982.9888 576.14336 983.04 576.14336 983.04v40.96H143.40096A41.03168 41.03168 0 0 1 102.4 983.07072V40.92928A40.93952 40.93952 0 0 1 143.34976 0H726.4256L921.6 220.9792v762.09152A40.96 40.96 0 0 1 880.6912 1024H745.23648v-40.96H880.64V236.48256zM880.6912 983.04H880.64h0.0512zM880.64 236.48256V220.9792l10.26048 27.11552L880.64 236.48256zM726.4256 40.96l-30.68928-13.84448L707.96288 40.96h18.47296zM880.64 236.48256L707.96288 40.96H143.36v942.11072C143.36 982.9888 576.14336 983.04 576.14336 983.04v40.96H143.40096A41.03168 41.03168 0 0 1 102.4 983.07072V40.92928A40.93952 40.93952 0 0 1 143.34976 0H726.4256L921.6 220.9792v762.09152A40.96 40.96 0 0 1 880.6912 1024H745.23648v-40.96H880.64V236.48256z"
        fill="#2c2c2c" p-id="27611"></path>
      <path d="M573.44 1003.52m-20.48 0a20.48 20.48 0 1 0 40.96 0 20.48 20.48 0 1 0-40.96 0Z" fill="#2c2c2c"
            p-id="27612"></path>
      <path d="M747.52 1003.52m-20.48 0a20.48 20.48 0 1 0 40.96 0 20.48 20.48 0 1 0-40.96 0Z" fill="#2c2c2c"
            p-id="27613"></path>
      <path
        d="M716.8 215.06048C716.8 215.01952 853.0944 215.04 853.0944 215.04l0.03072-15.70816 40.96 0.06144L894.0032 256H716.87168A40.99072 40.99072 0 0 1 675.84 215.06048V14.68416l40.96 1.06496v199.31136zM603.1872 548.47488l-0.22528-6.38976 26.27584-26.15296 27.46368 28.12928 98.62144 98.62144a21.43232 21.43232 0 0 1-0.02048 30.3104l-88.76032 86.87616-28.49792 28.0576-27.38176-26.86976-0.13312-3.6864 101.85728-99.69664-109.19936-109.19936z m-260.3008 203.20256l28.89728-22.05696 24.85248 32.5632-28.88704 22.04672L250.6752 667.62752a21.4528 21.4528 0 0 1 0.02048-30.34112l119.1424-117.84192 26.78784 26.91072v4.20864l-103.08608 101.94944L396.63616 755.2l-28.88704 29.0304-24.85248-32.5632z"
        fill="#2c2c2c" p-id="27614"></path>
      <path d="M380.928 768m-20.48 0a20.48 20.48 0 1 0 40.96 0 20.48 20.48 0 1 0-40.96 0Z" fill="#2c2c2c"
            p-id="27615"></path>
      <path d="M623.616 773.12m-20.48 0a20.48 20.48 0 1 0 40.96 0 20.48 20.48 0 1 0-40.96 0Z" fill="#2c2c2c"
            p-id="27616"></path>
      <path d="M386.048 532.48m-20.48 0a20.48 20.48 0 1 0 40.96 0 20.48 20.48 0 1 0-40.96 0Z" fill="#2c2c2c"
            p-id="27617"></path>
      <path d="M616.448 532.48m-20.48 0a20.48 20.48 0 1 0 40.96 0 20.48 20.48 0 1 0-40.96 0Z" fill="#2c2c2c"
            p-id="27618"></path>
    </svg>
  )
})
