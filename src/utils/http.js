import axios from 'axios';

// 封装axios请求实例
const instance = axios.create({
  baseURL: 'http://localhost:3000', // JSON Server 地址
  timeout: 5000
});

// 请求拦截器（可加 token）
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // 假设 token 存在 localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('请求失败:', error);
    return Promise.reject(error);
  }
);

export default instance;