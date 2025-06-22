<template>
  <div class="brands-container">
    <!-- 导航栏组件 -->
    <nav class="nav-container">
      <div class="nav-wrapper">
        <!-- 品牌logo -->
        <div class="logo">
          <img src="../assets/images/logo.png" alt="荔枝烧蓝莓 Logo">
        </div>

        <!-- 搜索框 -->
        <div class="search-bar">
          <input type="text" v-model="searchQuery" placeholder="搜索商品..." @keyup.enter="handleSearch">
          <button class="search-btn" @click="handleSearch">
            <i class="fa fa-search"></i>
          </button>
        </div>

        <!-- 导航链接 -->
        <div class="nav-links">
          <RouterLink to="/" class="nav-link">首页</RouterLink>

          <!-- 根据登录状态显示不同导航项 -->
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

    <!-- 品牌内容区 -->
    <div class="brands-content">
      <div class="section-wrapper">
        <!-- 标题显示当前品牌名称 -->
        <h2 class="section-title">{{ brandName ? brandName + ' 品牌产品' : '品牌产品' }}</h2>

        <!-- 搜索结果信息 -->
        <div class="search-info">
          <span v-if="searchQuery">当前搜索：{{ searchQuery }}</span>
          <span v-if="filteredProducts.length > 0">共 {{ filteredProducts.length }} 个相关商品</span>
        </div>

        <!-- 商品网格布局 -->
        <div class="product-grid">
          <!-- 无商品时的提示 -->
          <div v-if="filteredProducts.length === 0" class="no-products">
            暂无该品牌相关商品
          </div>

          <!-- 商品卡片列表 -->
          <div v-else v-for="product in filteredProducts" :key="product.id" class="product-card"
            @click="goToDetail(product.id)">
            <div class="product-image">
              <!-- 商品主图，使用图片占位符作为备选 -->
              <img :src="product.mainImage || `https://picsum.photos/seed/product${product.id}/400/400`"
                :alt="product.name" />

              <!-- 折扣标签 -->
              <div class="discount-badge" v-if="product.discount">{{ product.discount }}折</div>

              <!-- 悬停时显示的快速查看按钮 -->
              <button class="quick-view-btn">
                <i class="fa fa-eye"></i> 快速查看
              </button>
            </div>

            <!-- 商品信息 -->
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

// 初始化路由、路由跳转、用户状态管理
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 响应式数据
const filteredProducts = ref([]); // 过滤后的商品列表
const searchQuery = ref('');      // 搜索关键词
const brandId = ref('');          // 品牌ID
const brandName = ref('');        // 品牌名称

// 处理搜索逻辑
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    // 只在当前品牌下搜索
    fetchAndFilterProducts(searchQuery.value);
  }
};

// 获取并过滤商品数据
const fetchAndFilterProducts = async (query) => {
  try {
    const products = await request.get('/products');
    let brandProducts = products;

    // 如果有品牌名称，过滤该品牌的商品
    if (brandName.value) {
      brandProducts = products.filter(product => product.brandName === brandName.value);
    }

    // 如果有搜索关键词，进一步过滤
    if (query) {
      const searchLower = query.toLowerCase();
      filteredProducts.value = brandProducts.filter(product =>
        (product.name && product.name.toLowerCase().includes(searchLower))
      );
    } else {
      filteredProducts.value = brandProducts;
    }
  } catch (error) {
    filteredProducts.value = [];
    console.log(error)
  }
};

// 跳转到商品详情页
const goToDetail = (productId) => {
  router.push({
    name: 'productDetail',
    params: { id: productId }
  });
};

// 用户登出
const logout = async () => {
  await userStore.logout();
  router.push('/login');
};

// 监听路由参数变化，更新品牌信息和商品列表
watch(
  () => route.query,
  async (newQuery) => {
    brandId.value = newQuery.brandId;
    brandName.value = newQuery.brandName;
    await fetchAndFilterProducts(searchQuery.value);
  },
  { immediate: true }
);

// 组件挂载时初始化
onMounted(async () => {
  brandId.value = route.query.brandId;
  brandName.value = route.query.brandName;
  await fetchAndFilterProducts('');
});
</script>

<style scoped>
:root {
  --primary-color: #e53935;
  /* 主色调定义 */
}

.brands-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.brands-content {
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

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  text-align: center;
  position: relative;
  margin-bottom: 30px;
}

/* 标题下划线装饰 */
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

.search-info {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  color: #666;
  font-size: 14px;
}

/* 商品网格布局 */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
  margin-top: 30px;
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

/* 卡片悬停效果 */
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

/* 图片悬停放大效果 */
.product-card:hover .product-image img {
  transform: scale(1.05);
}

.discount-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #ff9800;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
  z-index: 10;
}

/* 快速查看按钮动画效果 */
.quick-view-btn {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0;
  transition: all 0.3s ease;
  cursor: pointer;
  z-index: 20;
}

.product-card:hover .quick-view-btn {
  bottom: 20px;
  opacity: 1;
}

.quick-view-btn:hover {
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-info {
  padding: 1.5rem;
}

.brand {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
}

/* 商品名称多行省略 */
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
  margin-bottom: 1rem;
}

.current-price {
  font-size: 1.25rem;
  font-weight: 600;
  color: #e53935;
}

.original-price {
  font-size: 0.875rem;
  color: #999;
  text-decoration: line-through;
}
</style>