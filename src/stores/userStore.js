import { defineStore } from 'pinia';
import request from '../utils/http';

// 用户信息管理store
export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: (() => {
      try {
        // 尝试从localStorage获取用户信息
        return JSON.parse(localStorage.getItem('userInfo')) || null;
      } catch {
        return null;
      }
    })(),
    token: localStorage.getItem('token') || ''
  }),
  getters: {
    isLogin: (state) => !!state.userInfo && !!state.token
  },
  actions: {
    async login(username, password) {
      try {
        const res = await request.get(`/users?username=${username}&password=${password}`);
        if (res && res.length > 0) {
          this.userInfo = res[0];
          this.token = 'mock-token';
          localStorage.setItem('token', 'mock-token');
          localStorage.setItem('userInfo', JSON.stringify(res[0]));
        } else {
          throw new Error('用户名或密码错误');
        }
      } catch (error) {
        console.error('登录失败:', error.response?.data?.message || error.message);
        throw error;
      }
    },
    async register(username, password, email, phone) {
      try {
        // 检查用户名是否已存在
        const existingUser = await request.get(`/users?username=${username}`);
        if (existingUser && existingUser.length > 0) {
          throw new Error('用户名已存在');
        }

        // 创建新用户
        const newUser = {
          username,
          password,
          email,
          phone,
          createTime: new Date().toISOString(),
          avatar: `https://picsum.photos/seed/${username}/200/200`
        };
        // 发送POST请求创建用户
        const res = await request.post('/users', newUser);
        return res;
      } catch (error) {
        console.error('注册失败:', error.response?.data?.message || error.message);
        throw error;
      }
    },

    logout() {
      this.userInfo = null;
      this.token = '';
      // 清除本地存储的用户信息和token
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    },
    // 更新用户信息
    async updateProfile(data) {
      try {
        const res = await request.put(`/users/${this.userInfo.id}`, data);
        this.userInfo = { ...this.userInfo, ...res };
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo));
      } catch (error) {
        console.error('更新个人信息失败:', error.response?.data?.message || error.message);
        throw error;
      }
    }
  }
});