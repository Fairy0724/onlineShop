<template>
  <div id="layout">
    <!-- 头部导航 -->
    <!-- <header>
      <div class="wrapper">
        <nav>
          <template v-if="userStore.isLogin">
            <RouterLink :to="{name: 'cart'}">购物车</RouterLink>
            <RouterLink to="/orders">订单</RouterLink>
            <RouterLink to="/profile">个人中心</RouterLink>
            <a @click="userStore.logout">退出登录</a>
          </template>
<template v-else>
            <RouterLink to="/login">登录</RouterLink>
            <RouterLink to="/register">注册</RouterLink>
          </template>
</nav>
</div>
</header> -->
    <!-- 主内容区域 -->
    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup>
defineOptions({
  name: 'LayoutPage',
});
// import { RouterLink, RouterView } from 'vue-router';
// import { useUserStore } from '../stores/userStore';

// const userStore = useUserStore();
</script>

<style scoped>
#layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.wrapper {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

nav {
  font-size: 16px;
}

nav a {
  display: inline-block;
  padding: 10px 15px;
  color: #333;
  text-decoration: none;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

nav a:hover {
  background-color: #e0e0e0;
}

main {
  flex: 1;
  width: 100%;
  /* max-width: 1200px; */
  margin: 0 auto;
  background: #fff;
  min-height: 800px;
  box-sizing: border-box;
}

header {
  background: #fff;
  border-bottom: 1px solid #eee;
}

footer {
  background: #222;
  color: #fff;
  text-align: center;
  border-top: none;
  font-size: 15px;
  letter-spacing: 1px;
}
</style>