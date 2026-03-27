---
title: 用 VuePress 搭建个人博客
icon: pen-to-square
date: 2026-03-27
category:
  - 技术
tag:
  - VuePress
  - Vue.js
  - 博客
star: true
---

# 用 VuePress 搭建个人博客

VuePress 是一款以 Markdown 为中心的静态网站生成器，非常适合搭建个人博客和文档站点。

<!-- more -->

## 为什么选择 VuePress

- **Markdown 优先**：专注内容写作，无需关心页面布局
- **Vue 驱动**：可以在 Markdown 中使用 Vue 组件
- **性能优秀**：静态生成，加载速度快
- **生态丰富**：插件和主题众多

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run docs:dev
```

打开浏览器访问 `http://localhost:8080` 即可看到博客。

### 构建生产版本

```bash
npm run docs:build
```

## 目录结构

```
blog/
├── src/
│   ├── .vuepress/
│   │   ├── config.ts    # VuePress 配置
│   │   └── theme.ts     # 主题配置
│   ├── posts/
│   │   ├── tech/        # 技术文章
│   │   └── life/        # 生活随笔
│   ├── about.md         # 关于页面
│   └── README.md        # 首页
└── package.json
```

## 写作技巧

### Front Matter

每篇文章顶部的 YAML 配置（Front Matter）控制文章的元信息：

```yaml
---
title: 文章标题
date: 2026-03-27
category:
  - 分类名称
tag:
  - 标签1
  - 标签2
---
```

### 摘要分隔符

在文章中加入 `<!-- more -->` 标记，该标记之前的内容会作为摘要显示在列表页。

## 部署

构建完成后，将 `src/.vuepress/dist` 目录部署到任意静态托管服务即可，例如：
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
