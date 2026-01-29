import Taro from '@tarojs/taro';

const BASE_URL = 'https://api.example.com'; // 替换为您的后端 API 地址

const request = (options) => {
  const { url, method = 'GET', data = {} } = options;

  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        // 在这里添加其他请求头，例如 token
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
};

export default request;
