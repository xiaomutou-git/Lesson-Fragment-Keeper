/* ============================================================
 * Word 导出功能单元测试
 *
 * 运行方式（项目根目录执行）：
 *   node --test test/
 * 或指定文件：
 *   node --test test/word-export.test.js
 *
 * 覆盖对象：
 *   - markdown-export.js（纯转换模块）中的三个纯函数：
 *       escapeHtml / inlineMarkdown / markdownToHtml
 *   说明：downloadWord 只是「转换结果 + Blob 下载」的薄壳，
 *   依赖浏览器环境，其核心行为全部收敛在被测的三个纯函数上。
 * 创建时间：2026-09-09
 * ============================================================ */
const test = require('node:test');
const assert = require('node:assert/strict');

// 引入被测模块（UMD 兼容 Node）
const { escapeHtml, inlineMarkdown, markdownToHtml } = require('../markdown-export.js');

/* ============================ escapeHtml ============================ */

test('escapeHtml：转义所有特殊字符', () => {
  assert.equal(escapeHtml('<a href="x">&'), '&lt;a href=&quot;x&quot;&gt;&amp;');
});

test('escapeHtml：空字符串原样返回', () => {
  assert.equal(escapeHtml(''), '');
});

test('escapeHtml：普通文本不受影响', () => {
  assert.equal(escapeHtml('教案碎片·课堂实录'), '教案碎片·课堂实录');
});

test('escapeHtml：非字符串输入按字符串处理', () => {
  assert.equal(escapeHtml(123), '123');
});

/* ============================ inlineMarkdown ============================ */

test('inlineMarkdown：加粗语法转换为 <b>', () => {
  assert.equal(inlineMarkdown('这是**重点**内容'), '这是<b>重点</b>内容');
});

test('inlineMarkdown：行内代码转换为 <code>', () => {
  assert.equal(inlineMarkdown('标签：`课堂实录`'), '标签：<code>课堂实录</code>');
});

test('inlineMarkdown：加粗与代码可组合', () => {
  assert.equal(
    inlineMarkdown('**粗** 与 `码`'),
    '<b>粗</b> 与 <code>码</code>'
  );
});

test('inlineMarkdown：文本中的特殊字符先转义再套样式', () => {
  assert.equal(inlineMarkdown('**a<b>**'), '<b>a&lt;b&gt;</b>');
});

test('inlineMarkdown：未闭合的语法按普通文本处理', () => {
  assert.equal(inlineMarkdown('半个**加粗'), '半个**加粗');
});

/* ============================ markdownToHtml ============================ */

test('markdownToHtml：产出完整 HTML 文档骨架', () => {
  const html = markdownToHtml('# 标题');
  assert.ok(html.startsWith('<!DOCTYPE html>'));
  assert.ok(html.includes('<meta charset="utf-8">'));
  assert.ok(html.endsWith('</html>'));
});

test('markdownToHtml：# 标题转为 h1', () => {
  assert.ok(markdownToHtml('# 教案碎片素材导出').includes('<h1>教案碎片素材导出</h1>'));
});

test('markdownToHtml：## 次级标题转为 h2', () => {
  const html = markdownToHtml('## 素材 1\n\n## 素材 2');
  const h2s = html.match(/<h2>/g) || [];
  assert.equal(h2s.length, 2);
});

test('markdownToHtml：超过 6 级的井号不构成标题，按普通文本处理', () => {
  const html = markdownToHtml('####### 七个井号');
  assert.ok(!html.includes('<h7>'), '不应产生 h7');
  assert.ok(!html.includes('<h6>'), '7 个井号不视为 h6 标题');
  assert.ok(html.includes('<p>####### 七个井号</p>'), '7 个井号按段落文本输出');
});

test('markdownToHtml：1~6 级井号均能正确转标题', () => {
  for (let i = 1; i <= 6; i++) {
    const md = '#'.repeat(i) + ' 标题';
    const html = markdownToHtml(md);
    assert.ok(html.includes(`<h${i}>标题</h${i}>`), `h${i} 转换失败`);
  }
});

test('markdownToHtml：引用行转为 blockquote', () => {
  assert.ok(markdownToHtml('> 导出时间：2026-09-09').includes('<blockquote>导出时间：2026-09-09</blockquote>'));
});

test('markdownToHtml：无序列表转为 ul/li', () => {
  const html = markdownToHtml('- 第一点\n- 第二点');
  assert.ok(html.includes('<ul>'));
  assert.equal((html.match(/<li>/g) || []).length, 2);
});

test('markdownToHtml：列表中间空行会闭合列表', () => {
  const html = markdownToHtml('- 项\n\n- 项');
  assert.equal((html.match(/<ul>/g) || []).length, 2, '两个空白分隔的列表片段应生成两个 ul');
});

test('markdownToHtml：--- 转为分隔线', () => {
  assert.ok(markdownToHtml('正文\n\n---\n\n续').includes('<hr>'));
});

test('markdownToHtml：普通行转为 p 段落', () => {
  assert.ok(markdownToHtml('一段普通素材内容').includes('<p>一段普通素材内容</p>'));
});

test('markdownToHtml：空行不产生多余标签', () => {
  const html = markdownToHtml('第一行\n\n\n第二行');
  assert.equal((html.match(/<p>/g) || []).length, 2);
});

test('markdownToHtml：标签行内标记套 code 样式', () => {
  assert.ok(markdownToHtml('标签：`课堂实录`').includes('<code>课堂实录</code>'));
});

test('markdownToHtml：加粗标记套 b 样式', () => {
  assert.ok(markdownToHtml('**重点**').includes('<b>重点</b>'));
});

test('markdownToHtml：XSS 载荷被完整转义，不产生可执行标签', () => {
  const payload = '<script>alert(1)</script><img src=x onerror=alert(2)>';
  const html = markdownToHtml(payload);
  assert.ok(!html.includes('<script>'), '不应出现 <script>');
  assert.ok(!html.includes('<img'), '不应出现 <img');
  assert.ok(html.includes('&lt;script&gt;'), '尖括号应被转义');
});

test('markdownToHtml：引号全部转义为实体', () => {
  assert.ok(markdownToHtml('他说："你好"').includes('&quot;你好&quot;'));
});

test('markdownToHtml：多行完整文档冒烟测试', () => {
  const md = [
    '# 教案碎片素材导出',
    '',
    '> 导出时间：2026-09-09 12:00',
    '> 素材数量：2 条',
    '',
    '## 素材 1',
    '',
    '**课堂提问**：1/2 与 1/3 能否直接相加？',
    '',
    '标签：`课堂实录`、`教学灵感`',
    '',
    '---',
    '',
    '## 素材 2',
    '',
    '- 第一点',
    '- 第二点',
  ].join('\n');

  const html = markdownToHtml(md);
  assert.ok(html.includes('<h1>教案碎片素材导出</h1>'));
  assert.equal((html.match(/<h2>/g) || []).length, 2);
  assert.equal((html.match(/<blockquote>/g) || []).length, 2);
  assert.ok(html.includes('<b>课堂提问</b>'));
  assert.ok(html.includes('<code>课堂实录</code>'));
  assert.ok(html.includes('<hr>'));
  assert.equal((html.match(/<ul>/g) || []).length, 1);
  assert.equal((html.match(/<li>/g) || []).length, 2);
  assert.ok(html.includes('</body></html>'));
});