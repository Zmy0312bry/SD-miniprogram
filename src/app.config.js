export default defineAppConfig({
  plugins: {
    WechatSI: {
      version: "0.3.6",
      provider: "wx069ba97219f66d99",
    },
  },
  permission: {
    "scope.record": {
      desc: "用于语音输入，将语音转成文字后发送给 AI 助手",
    },
  },
  pages: [
    "pages/index/index",
    "Chat/chat/index",
    "PersonalDetails/profile/index",
    "PersonalDetails/profile-info/index",
    "PersonalDetails/about/index",
    "ContactCommunity/Contact/index",
    "HealthService/index",
    "ResourceList/index",
    "ServiceMap/index",
    "Feedback/index",
    "HealthGuidance/index",
    "HealthGuidance/preview/index",
    "PolicyPreview/index",
    "ElderlyCareMeal/index",
    "MoreServices/index",
  ],
  subPackages: [
    {
      root: "PolicyRegulation",
      pages: [
        "index",
        "policy/index",
        "guide/index",
        "guide/detail",
        "guide/content",
        "guide/placeholder",
      ],
    },
  ],
  preloadRule: {
    "PolicyRegulation/index": {
      network: "all",
      packages: ["PolicyRegulation"],
    },
  },
  tabBar: {
    custom: true,
    color: "#000000",
    selectedColor: "#FF6B6B",
    backgroundColor: "#ffffff",
    list: [
      {
        pagePath: "pages/index/index",
        text: "首页",
      },
      {
        pagePath: "Chat/chat/index",
        text: "AI聊天",
      },
      {
        pagePath: "PersonalDetails/profile/index",
        text: "我的",
      },
    ],
  },
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "WeChat",
    navigationBarTextStyle: "black",
  },
});
