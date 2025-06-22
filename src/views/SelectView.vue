<template>
  <div class="select-container">
    <nav class="nav-container">
      <div class="nav-wrapper">
        <div class="logo">
          <img src="../assets/images/logo.png" alt="荔枝烧蓝莓 Logo">
        </div>
        <div class="search-bar">
          <input type="text" v-model="searchQuery" placeholder="搜索商品..." @keyup.enter="handleSearch">
          <button class="search-btn" @click="handleSearch">
            <i class="fa fa-search"></i>
          </button>
        </div>
        <div class="nav-links">
          <RouterLink to="/" class="nav-link">首页</RouterLink>
          <template v-if="userStore.isLogin">
            <RouterLink to="/profile" class="nav-link">个人中心</RouterLink>
            <RouterLink :to="{ name: 'cart' }" class="nav-link cart-link">购物车</RouterLink>
            <RouterLink :to="{ name: 'orders' }" class="nav-link">订单</RouterLink>
            <a href="#" class="nav-link" @click.prevent="logout">退出登录</a>
          </template>
          <template v-else>
            <RouterLink to="/login" class="nav-link">登录</RouterLink>
            <RouterLink to="/register" class="nav-link">注册</RouterLink>
          </template>
        </div>
      </div>
    </nav>

    <div class="select-content">
      <div class="section-wrapper">
        <h2 class="section-title">搜索结果</h2>
        <div class="search-info">
          <span v-if="searchQuery">当前搜索：{{ searchQuery }}</span>
          <span v-if="filteredProducts.length > 0">找到 {{ filteredProducts.length }} 个相关商品</span>
        </div>

        <div class="product-grid">
          <div v-if="filteredProducts.length === 0" class="no-products">
            未找到相关商品，试试其他关键词
          </div>
          <div v-else v-for="product in filteredProducts" :key="product.id" class="product-card"
            @click="goToDetail(product.id)">
            <div class="product-image">
              <img :src="product.mainImage || `https://picsum.photos/seed/product${product.id}/400/400`"
                :alt="product.name" />
              <div class="discount-badge" v-if="product.discount">{{ product.discount }}折</div>
              <button class="quick-view-btn">
                <i class="fa fa-eye"></i> 快速查看
              </button>
            </div>
            <div class="product-info">
              <div class="brand">{{ product.brandName }}</div>
              <h3>{{ product.name }}</h3>
              <div class="price">
                <span class="current-price">¥{{ product.price }}</span>
                <span class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import request from '../utils/http';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const filteredProducts = ref([]);
const searchQuery = ref('');
// 页面：商品搜索与筛选
// 搜索处理
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      name: 'select',
      query: { q: searchQuery.value }
    });
  }
};
// 获取并过滤商品
const fetchAndFilterProducts = async (query) => {
  try {
    // 获取所有商品
    const products = await request.get('/products');
    if (query) {
      // 将搜索词转为小写，用于不区分大小写的搜索
      const searchLower = query.toLowerCase();
      // 过滤商品
      filteredProducts.value = products.filter(product =>
        // 检查商品名称
        (product.name && product.name.toLowerCase().includes(searchLower)) ||
        // 检查品牌名称
        (product.brandName && product.brandName.toLowerCase().includes(searchLower))
      );
    } else {
      // 如果没有搜索词，则显示所有商品
      filteredProducts.value = [];
    }
    console.log('搜索结果:', filteredProducts.value); // 添加调试日志
  } catch (error) {
    console.error('获取商品失败:', error);
    filteredProducts.value = [];
  }
};


// 跳转到商品详情
const goToDetail = (productId) => {
  router.push({
    name: 'productDetail',
    params: { id: productId }
  });
};
// 退出登录
const logout = async () => {
  await userStore.logout();
  router.push('/login');
};
// 监听路由变化，响应搜索词变化
watch(
  () => route.query.q,
  async (newQuery) => {
    if (newQuery) {
      searchQuery.value = newQuery;
      await fetchAndFilterProducts(newQuery);
    }
  }
);
// 生命周期：页面挂载时加载搜索结果
onMounted(async () => {
  // 从 URL 获取搜索词
  const queryParam = route.query.q;
  if (queryParam) {
    searchQuery.value = queryParam;
    await fetchAndFilterProducts(queryParam);
  }
});
</script>

<style scoped>
/* 定义CSS变量 */
:root {
  --bg-light: #f5f5f5;
  --primary-color: #e53935;
  --secondary-color: #ff9800;
  --text-color: #333;
  --text-light: #666;
}

/* 搜索结果页面样式 */
.select-container {
  min-height: 100vh;
  background-color: var(--bg-light);
}

.select-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.section-wrapper {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

/* 标题样式 */
.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  text-align: center;
  position: relative;
  margin-bottom: 30px;
}

.section-title::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -10px;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background-color: var(--primary-color);
  border-radius: 2px;
}

/* 搜索信息 */
.search-info {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  color: #666;
  font-size: 14px;
}

/* 商品网格 */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
}

/* 商品卡片样式 */
.product-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  overflow: hidden;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.product-image {
  position: relative;
  overflow: hidden;
  height: 300px;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.discount-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: var(--secondary-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.quick-view-btn {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 255, 255, 0.9);
  color: var(--text-color);
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0;
  transition: all 0.3s ease;
  cursor: pointer;
}

.product-card:hover .quick-view-btn {
  bottom: 20px;
  opacity: 1;
}

.product-info {
  padding: 1.5rem;
}

.brand {
  font-size: 0.875rem;
  color: var(--text-light);
  margin-bottom: 0.5rem;
}

.product-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  line-height: 1.4;
  height: 3.36rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.current-price {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color);
}

.original-price {
  font-size: 0.875rem;
  color: var(--text-light);
  text-decoration: line-through;
}

.no-products {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 14px;
}
</style>