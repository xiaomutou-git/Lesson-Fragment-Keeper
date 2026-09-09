# 教案碎片收纳盒（Lesson Fragment Keeper）

教师备课场景下的本地素材收纳工具：随手记录零散教学灵感、课堂实录、习题与金句，打标签分类、拖拽排序，一键导出为 Markdown 或 Word。

## 功能特性

- **素材录入**：文本快速记录，支持自定义多标签；Ctrl / ⌘ + Enter 快捷提交
- **标签管理**：标签创建、重命名、删除；按标签快速筛选与分类查看
- **拖拽排序**：按住卡片左侧手柄拖动，调整素材展示顺序
- **搜索过滤**：关键词实时过滤，与标签筛选叠加使用
- **导出能力**：
  - 选中素材一键复制为 Markdown（含标签）
  - 导出前预览、可编辑，再复制或下载
  - 下载 Word 兼容 `.doc` 文件（内嵌纸墨质感样式，无需第三方库）
- **数据安全**：localStorage 本地持久化；支持 JSON 备份导出 / 导入恢复
- **内置示例**：首次打开自动注入 60 条备课场景示例数据（6 标签 × 10 条），可快速体验全部功能；用户数据不受影响
- **教师节彩蛋**：右下角隐藏粉笔图标，悬停显形，点击弹出祝福

## 快速开始

纯前端单页应用，无后端、无依赖、无需构建：

```bash
# 方式一：直接双击 index.html 用浏览器打开
# 方式二：本地起一个静态服务
python -m http.server 8080
# 访问 http://localhost:8080
```

## 运行测试

Word 导出转换逻辑的单元测试（Node 内置 test runner，无第三方依赖）：

```bash
node --test test/word-export.test.js
```

## 项目结构

```
├── index.html            # 页面结构
├── style.css             # 浅米色纸墨质感样式
├── app.js                # 应用逻辑（LessonBoxApp 类）
├── markdown-export.js    # Markdown → Word(.doc) 纯转换模块（浏览器/Node 双端）
└── test/
    └── word-export.test.js   # 转换逻辑单元测试
```

## 技术栈

原生 HTML / CSS / JavaScript（ES2020+），localStorage 持久化，UMD 模块化转换逻辑。
