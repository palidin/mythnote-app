const EMPTY_LINE = '<p>&nbsp;</p>';
const ZERO_LENGTH_STR = '<p>‎</p>';

const A_0 = '<code>|</code>'
const A_1 = '&amp;#124;'
const A_2 = '&#124;'

const B_0 = '<hr>'
const B_1 = '<p>___</p>'

class MarkdownConfig {

  unescape(html) {
    html = html.replaceAll(ZERO_LENGTH_STR, EMPTY_LINE);

    html = html.replaceAll(A_1, A_0);
    html = html.replaceAll(A_2, A_0);

    html = html.replaceAll(B_1, B_0);

    return html;
  }


  escape(html) {
    // 保留空行
    html = html.replaceAll(EMPTY_LINE, ZERO_LENGTH_STR);

    // 移除行内代码的加粗
    let regex = /<code>\*\*(.+?)\*\*<\/code>/g;
    html = html.replaceAll(regex, '<code>$1</code>')

    // 处理竖线
    html = html.replaceAll(A_0, A_1);

    // 处理横线
    html = html.replaceAll(B_0, B_1);

    return html;
  }
}


export const markdownConfig = new MarkdownConfig();
