/* ============================================================
 * Markdown → Word(.doc) 纯转换模块
 *
 * 用途：
 *   - 在浏览器中通过全局对象 `MarkdownExport` 调用（HTML 里以
 *     普通 <script> 引入）；
 *   - 在 Node 中通过 require 引入，供单元测试直接调用。
 * 不含任何 DOM 依赖，可在两个环境复用。
 * 创建时间：2026-09-09
 * ============================================================ */
(function (root, factory) {
  // UMD 兼容：Node 环境走 module.exports，浏览器环境挂到全局
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.MarkdownExport = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * HTML 特殊字符转义，防止素材内容被浏览器当作标签/脚本执行
   * @param {string} s - 原始字符串
   * @returns {string} 转义后的安全字符串
   * @example escapeHtml('<a>') // '&lt;a&gt;'
   */
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * Markdown 行内语法转换：先整体做 HTML 转义防注入，再处理 **加粗** 与 `行内标记`
   * @param {string} s - 原始行文本（未转义）
   * @returns {string} 处理行内语法和转义后的 HTML 片段
   * @example inlineMarkdown('**粗** 和 `码`') // '<b>粗</b> 和 <code>码</code>'
   */
  function inlineMarkdown(s) {
    const esc = escapeHtml(s);
    return esc
      .replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>') // **加粗**
      .replace(/`([^`\n]+)`/g, '<code>$1</code>'); // `行内标记`
  }

  /**
   * 把 Markdown 文本转换为 Word 兼容的 HTML 文档
   * 支持：# 标题 / > 引用 / - 列表 / --- 分隔线 / **加粗** / `行内标记` / 普通段落
   * @param {string} md - Markdown 文本
   * @returns {string} 完整 HTML 文档字符串（含样式、UTF-8 声明、body 内容）
   * @example markdownToHtml('# 标题\n\n正文') // '<!DOCTYPE html><html ...>...'
   */
  function markdownToHtml(md) {
    const body = [];
    let inList = false; // 当前是否处于无序列表中
    const closeList = () => {
      if (inList) {
        body.push('</ul>');
        inList = false;
      }
    };

    md.split('\n').forEach((raw) => {
      const line = raw.trimEnd();
      const t = line.trim();

      if (t === '') { closeList(); return; } // 空行：结束列表

      if (/^#{1,6}\s/.test(t)) {
        // 标题（## 素材 N 等）
        closeList();
        const level = Math.min(/^#+/.exec(t)[0].length, 6);
        body.push(`<h${level}>${inlineMarkdown(t.replace(/^#+\s*/, ''))}</h${level}>`);
        return;
      }
      if (t === '---' || t === '***') {
        // 分隔线
        closeList();
        body.push('<hr>');
        return;
      }
      if (/^>\s?/.test(t)) {
        // 引用段落（如导出时间、素材数量）
        closeList();
        body.push(`<blockquote>${inlineMarkdown(t.replace(/^>\s?/, ''))}</blockquote>`);
        return;
      }
      if (/^[-*]\s/.test(t)) {
        // 无序列表项
        if (!inList) { body.push('<ul>'); inList = true; }
        body.push(`<li>${inlineMarkdown(t.replace(/^[-*]\s/, ''))}</li>`);
        return;
      }
      // 普通段落
      closeList();
      body.push(`<p>${inlineMarkdown(t)}</p>`);
    });
    closeList();

    // Word / WPS 打开 .doc 时使用内嵌 CSS 呈现纸墨风格
    return (
      '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8">' +
      '<title>教案碎片素材导出</title>' +
      '<style>' +
      'body{font-family:"SimSun","宋体",serif;color:#322c22;line-height:1.9;padding:30px 42px;max-width:760px;margin:0 auto;}' +
      'h1{font-family:"KaiTi","楷体",serif;font-size:20pt;color:#a2402c;border-bottom:2px solid #a2402c;padding-bottom:8px;margin-bottom:20px;}' +
      'h2{font-family:"KaiTi","楷体",serif;font-size:14pt;color:#a2402c;margin:18px 0 6px;}' +
      'p{margin:6px 0;font-size:12pt;}' +
      'blockquote{color:#8a7c5d;border-left:3px solid #c6b689;padding-left:12px;margin:8px 0;font-size:10.5pt;}' +
      'ul{margin:6px 0;}' +
      'li{margin:3px 0;font-size:12pt;}' +
      'hr{border:none;border-top:1px solid #dcd0b3;margin:18px 0;}' +
      'code{color:#a2402c;background:#f4ead3;padding:1px 6px;border-radius:3px;}' +
      'b{color:#a2402c;}' +
      '</style></head><body>' + body.join('') + '</body></html>'
    );
  }

  return { escapeHtml, inlineMarkdown, markdownToHtml };
});