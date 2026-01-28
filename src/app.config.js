export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/chat/index',
    'pages/profile/index',
    'pages/profile-info/index',
    'pages/about/index',
    'pages/contact-community/index'
  ],
  tabBar: {
    custom: true,
    color: '#000000',
    selectedColor: '#FF6B6B',
    backgroundColor: '#ffffff',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页'
      },
      {
        pagePath: 'pages/chat/index',
        text: 'AI聊天'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  }
})
