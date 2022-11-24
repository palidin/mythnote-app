const EMPTY_LINE = '<p>&nbsp;</p>';
const ZERO_LENGTH_STR = '<p>‎</p>';

class MarkdownConfig {

    unescape(html) {
        html = html.replaceAll(ZERO_LENGTH_STR, EMPTY_LINE);
        return html;
    }


    escape(html) {
        // 保留空行
        html = html.replaceAll(EMPTY_LINE, ZERO_LENGTH_STR);

        // 移除行内代码的加粗
        let regex = /<code>\*\*(.+?)\*\*<\/code>/g;
        html = html.replaceAll(regex, '<code>$1</code>')

        return html;
    }
}


export const markdownConfig = new MarkdownConfig();