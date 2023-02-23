const EOF = String.fromCharCode(8203).repeat(3);
const START_OF_DELI = String.fromCharCode(8205);

const EMPTY_LINE = '<p>&nbsp;</p>';
const ZERO_LENGTH_STR = '<p>' + EOF + '</p>';

const A_1 = '&amp;#124;'
const A_2 = '&#124;'

const B_0 = '<hr>'
const B_1 = '<p>___</p>'

class MarkdownConfig {

  unescape(html) {
    html = html.replaceAll(ZERO_LENGTH_STR, EMPTY_LINE);

    html = html.replaceAll(START_OF_DELI + A_2, START_OF_DELI + '|');

    html = html.replaceAll(B_1, B_0);

    return html;
  }


  escape(html) {
    // 保留空行
    html = html.replaceAll(EMPTY_LINE, ZERO_LENGTH_STR);

    // 移除行内代码的加粗
    let regex = /<code>\*\*(.+?)\*\*<\/code>/g;
    html = html.replaceAll(regex, '<code>$1</code>')

    // 处理表格中的竖线
    html = html.replaceAll(/<td>(.*?)\\\|(.*?)<\/td>/g, '<td>$1' + START_OF_DELI + A_1 + '$2</td>');

    // 处理横线
    html = html.replaceAll(B_0, B_1);

    return html;
  }

  beforeSave(text) {
    text = text.replaceAll(START_OF_DELI + '|', START_OF_DELI + A_2);
    return text;
  }
}


export const markdownConfig = new MarkdownConfig();
