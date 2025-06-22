<template>
  <div class="login-page">
    <!-- 顶部导航栏，包含logo和返回首页链接，带有阴影效果 -->
    <header class="header">
      <div class="container">
        <div class="logo-wrapper">
          <img src="../assets/images/logo.png" alt="荔枝烧蓝莓 Logo" class="logo">
        </div>
        <a href="/" class="go-home">
          <span>进入网站首页</span>
          <i class="fa fa-angle-right"></i>
        </a>
      </div>
    </header>

    <!-- 主要内容区，使用淡绿色渐变背景 -->
    <main class="main-content">
      <div class="container">
        <div class="login-container">
          <!-- 左侧Banner区域，展示促销信息，使用渐变背景 -->
          <div class="banner-section">
            <div class="banner-content">
              <h2 class="title">清凉夏日·上新特惠</h2>
              <p class="summer-text">SUMMER</p>
              <p class="description">登录账户，享受夏日专属优惠，全场美妆满减，限时折扣低至5折！</p>
              <div class="cta-buttons">
                <button class="btn btn-primary">
                  <i class="fa fa-shopping-bag"></i> 了解更多
                </button>
                <button class="btn btn-secondary">
                  <i class="fa fa-gift"></i> 查看活动
                </button>
              </div>
            </div>
            <!-- 装饰元素，圆形图案 -->
            <div class="decorations">
              <div class="circle circle-large"></div>
              <div class="circle circle-medium"></div>
              <div class="circle circle-small"></div>
            </div>
          </div>

          <!-- 右侧登录框，白色背景，包含表单和其他登录方式 -->
          <div class="login-section">
            <div class="login-box">
              <div class="login-header">
                <h3 class="login-title">账户登录</h3>
                <p class="login-subtitle">欢迎回来，请登录您的账户</p>
              </div>

              <form class="login-form">
                <div class="form-group">
                  <label for="account" class="form-label">账户</label>
                  <div class="input-wrapper">
                    <i class="fa fa-user input-icon"></i>
                    <input type="text" id="account" v-model="account" placeholder="请输入账户" class="form-input">
                  </div>
                </div>

                <div class="form-group">
                  <label for="password" class="form-label">密码</label>
                  <div class="input-wrapper">
                    <i class="fa fa-lock input-icon"></i>
                    <input type="password" id="password" v-model="password" placeholder="请输入密码" class="form-input">
                  </div>
                </div>

                <div class="agreement">
                  <input type="checkbox" id="agree" v-model="isAgree" class="form-checkbox">
                  <label for="agree" class="form-label">
                    我已同意<a href="#" class="link">隐私条款</a>和<a href="#" class="link">服务条款</a>
                  </label>
                </div>

                <button type="button" class="login-button" @click="handleLogin">
                  点击登录
                </button>
              </form>

              <!-- 注册链接 -->
              <div class="register-link">
                <span class="text">还没有账户？</span>
                <RouterLink to="/register" class="link">立即注册</RouterLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部信息，包含公司信息、链接和联系方式 -->
    <footer class="footer">
      <div class="container">
        <div class="footer-top">
          <div class="footer-logo">
            <img src="../assets/images/logo.png" alt="荔枝烧蓝莓 Logo" class="logo">
            <p class="slogan">新鲜·亲民·快捷</p>
          </div>

          <div class="footer-links">
            <div class="footer-col">
              <h4 class="footer-title">关于我们</h4>
              <ul class="footer-list">
                <li><a href="#" class="footer-link">公司简介</a></li>
                <li><a href="#" class="footer-link">加入我们</a></li>
                <li><a href="#" class="footer-link">联系方式</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4 class="footer-title">客户服务</h4>
              <ul class="footer-list">
                <li><a href="#" class="footer-link">帮助中心</a></li>
                <li><a href="#" class="footer-link">售后服务</a></li>
                <li><a href="#" class="footer-link">配送说明</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4 class="footer-title">支付方式</h4>
              <ul class="footer-list">
                <li><a href="#" class="footer-link">在线支付</a></li>
                <li><a href="#" class="footer-link">银行转账</a></li>
                <li><a href="#" class="footer-link">货到付款</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4 class="footer-title">关注我们</h4>
              <div class="social-media">
                <a href="#" class="social-icon weixin">
                  <i class="fa fa-weixin"></i>
                </a>
                <a href="#" class="social-icon weibo">
                  <i class="fa fa-weibo"></i>
                </a>
                <a href="#" class="social-icon instagram">
                  <i class="fa fa-instagram"></i>
                </a>
              </div>
              <p class="contact">客服电话：400-123-4567</p>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p class="copyright">CopyRight © 2025 荔枝烧蓝莓美妆商城. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';

// 引入用户状态管理和路由
const userStore = useUserStore();
const router = useRouter();

// 定义表单数据响应式变量
const account = ref('');       // 登录账户
const password = ref('');      // 登录密码
const isAgree = ref(false);    // 协议同意状态

// 登录处理函数
const handleLogin = async () => {
  // 表单验证
  if (!account.value || !password.value || !isAgree.value) {
    alert('请填写完整信息并勾选协议');
    return;
  }
  try {
    // 调用用户存储中的登录方法
    await userStore.login(account.value, password.value);
    // 获取登录前的页面路径并跳转
    const redirect = router.currentRoute.value.query.redirect || '/';
    router.push(redirect);
  } catch (error) {
    console.error('登录失败:', error);
    alert('登录失败，请检查账户和密码或联系管理员');
  }
};
</script>

<style scoped>
/* 全局样式变量定义 */
:root {
  --primary-color: #00b38a;
  /* 主色调：绿色 */
  --primary-dark: #009974;
  /* 主色调深色 */
  --secondary-color: #87e8de;
  /* 辅助色：浅绿色 */
  --text-color: #333;
  /* 文本主色 */
  --text-light: #666;
  /* 文本浅色 */
  --text-lighter: #999;
  /* 文本更浅色 */
  --bg-light: #f8f9fa;
  /* 背景浅色 */
  --bg-gray: #e9ecef;
  /* 背景灰色 */
  --border-radius: 8px;
  /* 边框圆角 */
  --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  /* 盒子阴影 */
}

/* 基础样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: var(--text-color);
}

a {
  text-decoration: none;
  color: inherit;
}

ul {
  list-style: none;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 头部导航样式 */
.header {
  background-color: white;
  box-shadow: var(--box-shadow);
  padding: 20px 0;
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-wrapper {
  display: flex;
  align-items: center;
}

.logo {
  width: 70px;
  height: 60px;
  border-radius: 8px;
  margin-right: 10px;
}

.brand-name {
  font-size: 18px;
  font-weight: bold;
  color: var(--primary-color);
}

.go-home {
  color: var(--primary-color);
  font-size: 14px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.go-home:hover {
  color: var(--primary-dark);
  transform: translateX(2px);
}

.go-home i {
  margin-left: 5px;
}

/* 主要内容区样式 */
.main-content {
  padding: 60px 0;
  background: linear-gradient(135deg, #e5f6e5 0%, #d1f0d1 100%);
}

.login-container {
  display: flex;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--box-shadow);
}

/* 左侧Banner区域样式 */
.banner-section {
  flex: 1;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  padding: 60px;
  position: relative;
  overflow: hidden;
}

.banner-content {
  position: relative;
  z-index: 10;
}

.title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
}

.summer-text {
  font-size: 60px;
  font-weight: 900;
  margin-bottom: 30px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.description {
  font-size: 16px;
  margin-bottom: 40px;
  max-width: 300px;
}

.cta-buttons {
  display: flex;
  gap: 20px;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.btn-primary {
  background-color: white;
  color: var(--primary-color);
  border: none;
}

.btn-primary:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-secondary {
  background-color: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn i {
  margin-right: 8px;
}

.decorations {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
}

.circle-large {
  width: 300px;
  height: 300px;
  top: -100px;
  right: -100px;
}

.circle-medium {
  width: 200px;
  height: 200px;
  top: 200px;
  right: -50px;
}

.circle-small {
  width: 100px;
  height: 100px;
  bottom: 100px;
  right: 100px;
}

/* 右侧登录框样式 */
.login-section {
  flex: 1;
  background-color: white;
  padding: 60px;
  display: flex;
  justify-content: center;
}

.login-box {
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.login-subtitle {
  color: var(--text-light);
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-lighter);
}

.form-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 179, 138, 0.2);
}

.agreement {
  display: flex;
  align-items: center;
  margin: 10px 0;
}

.form-checkbox {
  margin-right: 10px;
}

.link {
  color: var(--primary-color);
  text-decoration: none;
  transition: all 0.3s ease;
}

.link:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

.login-button {
  width: 100%;
  padding: 14px;
  background-color: #00b38a;
  color: white;
  font-size: 16px;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-button:hover {
  background-color: #009974;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 179, 138, 0.2);
}

/* 注册链接样式 */
.register-link {
  text-align: center;
  font-size: 14px;
  margin-top: 20px;
}

/* 底部信息样式 */
.footer {
  background-color: white;
  padding: 60px 0;
  border-top: 1px solid #eee;
}

.footer-top {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.footer-logo {
  flex: 1;
  margin-right: 40px;
  min-width: 200px;
}

.footer-logo img {
  width: 90px;
  height: 80px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.footer-logo .slogan {
  font-size: 18px;
  color: var(--text-light);
}

.footer-links {
  flex: 3;
  display: flex;
  flex-wrap: wrap;
}

.footer-col {
  flex: 1;
  min-width: 150px;
  margin-bottom: 20px;
}

.footer-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
}

.footer-list {
  font-size: 14px;
  color: var(--text-light);
}

.footer-list li {
  margin-bottom: 10px;
}

.social-media {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.social-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.social-icon:hover {
  background-color: var(--primary-color);
  color: white;
}

.contact {
  font-size: 14px;
  color: var(--text-light);
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #eee;
  font-size: 12px;
  color: var(--text-lighter);
}

/* 响应式设计 */
@media (max-width: 992px) {
  .login-container {
    flex-direction: column;
  }

  .banner-section,
  .login-section {
    padding: 40px;
  }

  .summer-text {
    font-size: 40px;
  }

  .footer-top {
    flex-direction: column;
  }

  .footer-logo {
    margin-bottom: 40px;
  }
}

@media (max-width: 576px) {

  .banner-section,
  .login-section {
    padding: 30px;
  }

  .title {
    font-size: 24px;
  }

  .summer-text {
    font-size: 30px;
  }

  .description {
    font-size: 14px;
  }

  .btn {
    padding: 10px 16px;
    font-size: 14px;
  }
}
</style>