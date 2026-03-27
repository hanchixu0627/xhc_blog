import { defineUserConfig } from "vuepress";
import { viteBundler } from "@vuepress/bundler-vite";
import theme from "./theme.js";

export default defineUserConfig({
  bundler: viteBundler(),
  base: "/xhc_blog/",
  lang: "zh-CN",
  title: "我的博客",
  description: "记录生活与技术的点滴",
  theme,
});
