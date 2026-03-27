import { hopeTheme } from "vuepress-theme-hope";

export default hopeTheme({
  hostname: "https://your-domain.com",

  author: {
    name: "Your Name",
    url: "https://your-domain.com",
  },

  iconAssets: "fontawesome-with-brands",

  logo: "/logo.png",

  repo: "your-github-username/blog",

  docsDir: "src",

  navbar: [
    "/",
    {
      text: "博客",
      icon: "pen-to-square",
      prefix: "/posts/",
      children: [
        { text: "技术", icon: "code", link: "tech/" },
        { text: "生活", icon: "leaf", link: "life/" },
      ],
    },
    { text: "标签", icon: "tag", link: "/tag/" },
    { text: "时间线", icon: "clock", link: "/timeline/" },
    { text: "关于", icon: "circle-info", link: "/about" },
  ],

  sidebar: {
    "/posts/": [
      { text: "技术", icon: "code", prefix: "tech/", children: "structure" },
      { text: "生活", icon: "leaf", prefix: "life/", children: "structure" },
    ],
  },

  footer: "用 VuePress & Hope 主题搭建",
  displayFooter: true,

  blog: {
    description: "一名热爱技术的开发者",
    intro: "/about",
    medias: {
      GitHub: "https://github.com/your-github-username",
    },
  },

  plugins: {
    blog: true,

    comment: false,

    components: {
      components: ["Badge", "VPCard"],
    },

    mdEnhance: {
      align: true,
      attrs: true,
      codetabs: true,
      component: true,
      demo: true,
      figure: true,
      imgLazyload: true,
      imgSize: true,
      include: true,
      mark: true,
      plantuml: true,
      spoiler: true,
      stylize: [
        {
          matcher: "Recommended",
          replacer: ({ tag }) => {
            if (tag === "em")
              return {
                tag: "Badge",
                attrs: { type: "tip" },
                content: "Recommended",
              };
          },
        },
      ],
      sub: true,
      sup: true,
      tabs: true,
      tasklist: true,
      vPre: true,
    },
  },
});
