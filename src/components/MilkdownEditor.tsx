import React from "react";
import {Crepe} from "@milkdown/crepe";
import {Milkdown, MilkdownProvider, useEditor} from "@milkdown/react";
import {eclipse} from "@uiw/codemirror-theme-eclipse";


import "@milkdown/crepe/theme/common/style.css";
import "../../node_modules/@milkdown/crepe/lib/theme/frame/style.css";

interface EditorProps {
  markdown?: string;
  updateBody?: (markdown: string) => void;
}

const CrepeEditor: React.FC<EditorProps> = ({markdown, updateBody}) => {
  useEditor((root) => {
    const crepe = new Crepe({
      root,
      defaultValue: markdown || "",
      features: {
        [Crepe.Feature.BlockEdit]: false,
      },
      featureConfigs: {
        [Crepe.Feature.CodeMirror]: {
          theme: eclipse,
        },
      },
    });

    // 通过 crepe 内部的 editor 配置监听器
    crepe.on(listener => {
      listener.markdownUpdated((_, markdown, prevMarkdown) => {
        if (markdown == prevMarkdown) return;
        updateBody(markdown);
      });

    });

    return crepe;
  }, [updateBody]); // 依赖 onChange 确保回调最新

  return <Milkdown/>;
};

export const MilkdownEditor: React.FC<EditorProps> = ({markdown, updateBody}) => {
  return (
    <MilkdownProvider>
      <CrepeEditor markdown={markdown} updateBody={updateBody}/>
    </MilkdownProvider>
  );
};

export default MilkdownEditor;
