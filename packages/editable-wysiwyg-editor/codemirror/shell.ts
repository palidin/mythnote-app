function tokenBase(stream, state) {
  if (stream.sol()) { // 如果在新行开始
    let ch = stream.peek();
    if (!/\s/.test(ch)) { // 非空白字符
      if (stream.match(/[a-zA-Z_][a-zA-Z0-9_\-.]*/, true)) { // 匹配关键字
        return "keyword";
      }
    } else { // 空白字符
      // 手动实现跳过空白字符的功能
      let whitespace = "";
      while (!stream.eol() && /\s/.test(stream.peek())) {
        whitespace += stream.next();
      }
      return whitespace ? "text" : null;
    }
  }

  if (stream.skipTo("#")) { // 找到#开头的注释
    stream.skipToEnd(); // 跳过至行尾
    return "comment";
  }


  stream.next(); // 否则，移动到下一个字符
  return null; // 或者返回空，表示没有特定的词法类别
}

// 创建并注册模式
export const shell = {
  token: tokenBase,
  languageData: {
    commentTokens: {line: "#"},
    tokenHooks: {},
    indent: () => 0,
  },
};
