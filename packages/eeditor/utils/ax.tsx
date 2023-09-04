import {parseDataTransfer, readClipboardData} from "@editablejs/editor";

export function readCopyText() {
  return readClipboardData()
    .then(clipboardData => {
      return formatTextFromClipboard(clipboardData);
    })
}

export function formatTextFromClipboard(clipboardData: DataTransfer) {
  const {text} = parseDataTransfer(clipboardData)
  const textFixed = HTMLDecode(text)
  return textFixed;
}

function HTMLDecode(text) {
  let temp = document.createElement("div");
  temp.innerHTML = text;
  let output = temp.innerText || temp.textContent;
  temp = null;
  return output;
}
