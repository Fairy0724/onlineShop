<template>
  <div class="product-detail-page">
    <!-- 顶部导航 -->
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
    <div class="container">
      <div class="product-detail">
        <!-- 商品图片展示区 -->
        <div class="product-gallery">
          <div class="main-image">
            <img :src="product.mainImage" :alt="product.name" />
          </div>
          <div class="thumbnail-list">
            <img v-for="(img, index) in product.images" :key="index" :src="img" :alt="product.name"
              @click="changeMainImage(img)" :class="{ active: img === product.mainImage }" />
          </div>
        </div>

        <!-- 商品信息区 -->
        <div class="product-info">
          <h1 class="product-name">{{ product.name }}</h1>
          <div class="product-brief">{{ product.brief }}</div>
          <div class="price-section">
            <div class="current-price">¥{{ currentPrice }}</div>
            <div class="original-price">¥{{ product.originalPrice }}</div>
            <div class="discount-tag" v-if="product.discount">{{ product.discount }}折</div>
          </div>

          <!-- 规格选择 -->
          <div class="specs" v-if="product.specs?.length">
            <div class="spec-title">规格</div>
            <div class="spec-options">
              <button v-for="spec in product.specs" :key="spec.id" :class="{ active: selectedSpec === spec.id }"
                @click="selectSpec(spec)" :disabled="(spec.stock || product.stock) <= 0">
                {{ spec.name }}
                <span v-if="(spec.stock || product.stock) <= 0">(已售罄)</span>
              </button>
            </div>
          </div>

          <!-- 数量选择 -->
          <div class="quantity">
            <div class="spec-title">数量</div>
            <div class="quantity-selector">
              <button @click="quantity > 1 && quantity--" :disabled="quantity <= 1">-</button>
              <input type="number" v-model="quantity" min="1" :max="currentStock" @change="validateQuantity" />
              <button @click="quantity < currentStock && quantity++" :disabled="quantity >= currentStock">+</button>
            </div>
            <span class="stock">库存: {{ currentStock }}件</span>
          </div>

          <!-- 操作按钮 -->
          <div class="actions">
            <button class="btn-add-cart" @click="addToCart">加入购物车</button>
            <button class="btn-buy-now" @click="buyNow">立即购买</button>
            <button class="btn-favorite" @click="toggleFavorite">
              <i :class="isFavorite ? 'icon-heart-filled' : 'icon-heart'"></i>
              收藏
            </button>
          </div>

          <!-- 服务承诺 -->
          <div class="service-promises">
            <div class="promise-item">
              <i class="icon-genuine"></i>
              <span>正品保证</span>
            </div>
            <div class="promise-item">
              <i class="icon-shipping"></i>
              <span>全场包邮</span>
            </div>
            <div class="promise-item">
              <i class="icon-return"></i>
              <span>7天无理由退货</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 商品详情 tabs -->
      <div class="product-tabs">
        <div class="tab-headers">
          <div v-for="tab in tabs" :key="tab.key" :class="['tab-header', { active: currentTab === tab.key }]"
            @click="currentTab = tab.key">
            {{ tab.label }}
          </div>
        </div>

        <div class="tab-content">
          <!-- 商品详情 -->
          <div v-if="currentTab === 'detail'" class="detail-content">
            <div v-html="product.detail"></div>
          </div>
          <!-- 规格参数 -->
          <div v-if="currentTab === 'params'" class="params-content">
            <table>
              <tr v-for="param in product.params" :key="param.key">
                <td class="param-key">{{ param.key }}</td>
                <td class="param-value">{{ param.value }}</td>
              </tr>
            </table>
          </div>
          <!-- 用户评价 -->
          <div v-if="currentTab === 'reviews'" class="reviews-content">
            <div v-for="review in product.reviews" :key="review.id" class="review-item">
              <div class="user-info">
                <img :src="review.userAvatar" :alt="review.userName" />
                <span>{{ review.userName }}</span>
                <div class="rating">
                  <i v-for="n in 5" :key="n" :class="['icon-star', { filled: n <= review.rating }]">
                  </i>
                </div>
              </div>
              <div class="review-content">{{ review.content }}</div>
              <div class="review-images">
                <img v-for="img in review.images" :key="img" :src="img" @click="showImage(img)" />
              </div>
              <div class="review-time">{{ review.time }}</div>
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
import { ElMessage } from 'element-plus';
import '../assets/styles/nav.css';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const product = ref({});
const quantity = ref(1);
const selectedSpec = ref(null);
const currentPrice = ref(0);
const currentStock = ref(0);
const currentTab = ref('detail');
const isFavorite = ref(false);
const searchQuery = ref('');

// 搜索处理
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      name: 'select',
      query: { q: searchQuery.value }
    });
  }
};

const tabs = [
  { key: 'detail', label: '商品详情' },
  { key: 'params', label: '规格参数' },
  { key: 'reviews', label: '用户评价' }
];

// 检查收藏状态
const checkFavorite = async () => {
  isFavorite.value = false;
  if (!userStore.isLogin || !userStore.userInfo) {
    return;
  }

  try {
    const res = await request.get('/favorites', {
      params: {
        userId: userStore.userInfo.id,
        productId: route.params.id
      }
    });
    isFavorite.value = Array.isArray(res) && res.length > 0;
  } catch (error) {
    console.error('检查收藏状态失败:', error);
  }
};

// 选择规格
const selectSpec = (spec) => {
  selectedSpec.value = spec.id;
  // 更新价格和库存
  currentPrice.value = spec.price || product.value.price;
  currentStock.value = spec.stock || product.value.stock;
  // 如果当前数量大于库存，调整数量
  if (quantity.value > currentStock.value) {
    quantity.value = currentStock.value;
  }
};

// 修改收藏操作
const toggleFavorite = async () => {
  if (!userStore.isLogin) {
    router.push('/login');
    return;
  }

  try {
    if (isFavorite.value) {
      // 查找当前用户的收藏记录
      const favorites = await request.get('/favorites', {
        params: {
          userId: userStore.userInfo.id,
          productId: route.params.id
        }
      });
      if (Array.isArray(favorites) && favorites.length > 0) {
        await request.delete(`/favorites/${favorites[0].id}`);
      }
    } else {
      await request.post('/favorites', {
        userId: userStore.userInfo.id,
        productId: route.params.id,
        createTime: new Date().toISOString()
      });
    }
    isFavorite.value = !isFavorite.value;
    ElMessage.success(isFavorite.value ? '收藏成功' : '取消收藏成功');
  } catch (error) {
    console.error('操作收藏失败:', error);
    ElMessage.error('操作失败，请重试');
  }
};

// 添加到购物车
const addToCart = async () => {
  if (!userStore.isLogin) {
    router.push('/login');
    return;
  }

  if (!selectedSpec.value && product.value.specs?.length > 0) {
    ElMessage.warning('请选择商品规格');
    return;
  }

  try {
    await request.post('/carts', {
      userId: userStore.userInfo.id,
      productId: route.params.id,
      quantity: quantity.value,
      specId: selectedSpec.value,
      price: currentPrice.value,
      createTime: new Date().toISOString()
    });
    ElMessage.success('添加成功');
  } catch (error) {
    console.error('添加购物车失败:', error);
    ElMessage.error('添加购物车失败');
  }
};

// 立即购买
const buyNow = async () => {
  if (!userStore.isLogin) {
    router.push('/login');
    return;
  }
  // 检查规格是否选择
  if (!selectedSpec.value && product.value.specs?.length > 0) {
    ElMessage.warning('请选择商品规格');
    return;
  }
  // 检查库存是否足够
  const orderData = {
    items: [{
      productId: route.params.id,
      productName: product.value.name,
      quantity: quantity.value,
      price: currentPrice.value,
      specId: selectedSpec.value,
      specName: product.value.specs?.find(s => s.id === selectedSpec.value)?.name,
      image: product.value.mainImage
    }],
    totalPrice: currentPrice.value * quantity.value
  };

  // 跳转到订单提交页面
  router.push({
    name: 'orderSubmit',
    params: { orderData: JSON.stringify(orderData) }
  });
};

// 修改商品主图
const changeMainImage = (img) => {
  if (!img) return;
  product.value.mainImage = img;
};

// 输入框数量变化验证
const validateQuantity = () => {
  const maxStock = currentStock.value;
  if (quantity.value > maxStock) {
    quantity.value = maxStock;
    ElMessage.warning(`当前规格库存只有${maxStock}件`);
  }
  if (quantity.value < 1) {
    quantity.value = 1;
  }
};

// 监听数量变化
watch(quantity, validateQuantity);

// 初始化商品信息
const initProductInfo = () => {
  if (product.value.specs?.length > 0) {
    const defaultSpec = product.value.specs[0];
    selectedSpec.value = defaultSpec.id;
    // 如果规格没有价格，使用商品价格
    currentPrice.value = defaultSpec.price || product.value.price;
    // 如果规格没有库存，使用商品库存
    currentStock.value = defaultSpec.stock || product.value.stock;
  } else {
    currentPrice.value = product.value.price;
    currentStock.value = product.value.stock;
  }
};

// 获取商品详情
const fetchProduct = async () => {
  try {
    const res = await request.get('/products', {
      params: { id: route.params.id }
    });

    if (Array.isArray(res) && res.length > 0) {
      product.value = res[0];
      // 确保images数组存在，并将主图添加到头部
      if (!product.value.images) {
        product.value.images = [];
      }
      // 如果主图不在images数组中，添加到头部
      if (!product.value.images.includes(product.value.mainImage)) {
        product.value.images.unshift(product.value.mainImage);
      }
      // 初始化商品信息
      initProductInfo();
    }
    else {
      ElMessage.error('商品不存在');
      router.push('/');
    }
  } catch (error) {
    console.error('获取商品详情失败:', error);
    ElMessage.error('获取商品详情失败');
    router.push('/');
  }
};

// 退出登录
const logout = () => {
  userStore.logout();
  router.push('/login');
};

onMounted(() => {
  fetchProduct();
  // 只有在用户登录时才检查收藏状态
  if (userStore.isLogin) {
    checkFavorite();
  }
});
</script>

<style scoped>
.product-detail-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.product-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 60px;
}

.product-gallery {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.main-image {
  width: 100%;
  height: 400px;
  margin-bottom: 20px;
  overflow: hidden;
  border-radius: 8px;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-list {
  display: flex;
  gap: 10px;
}

.thumbnail-list img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
}

.thumbnail-list img.active {
  border-color: #2ecc71;
}

.product-info {
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-name {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
}

.product-brief {
  color: #666;
  margin-bottom: 20px;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 30px;
}

.current-price {
  font-size: 28px;
  color: #2ecc71;
  font-weight: bold;
}

.original-price {
  color: #999;
  text-decoration: line-through;
}

.discount-tag {
  background: #2ecc71;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.specs,
.quantity {
  margin-bottom: 30px;
}

.spec-title {
  font-size: 16px;
  color: #666;
  margin-bottom: 12px;
}

.spec-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.spec-options button {
  padding: 8px 20px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.spec-options button.active {
  border-color: #2ecc71;
  color: #2ecc71;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quantity-selector button {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
}

.quantity-selector input {
  width: 60px;
  height: 36px;
  text-align: center;
  border: 1px solid #ddd;
}

.stock {
  color: #666;
  margin-left: 12px;
}

.actions {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.btn-add-cart,
.btn-buy-now,
.btn-favorite {
  padding: 12px 30px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.btn-add-cart {
  background: #fff;
  border: 1px solid #2ecc71;
  color: #2ecc71;
}

.btn-buy-now {
  background: #2ecc71;
  color: #fff;
  flex: 2;
}

.btn-favorite {
  background: #f8f9fa;
  color: #666;
}

.service-promises {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
  border-top: 1px solid #eee;
}

.promise-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.product-tabs {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 40px;
}

.tab-headers {
  display: flex;
  border-bottom: 1px solid #eee;
}

.tab-header {
  padding: 20px 40px;
  cursor: pointer;
  color: #666;
}

.tab-header.active {
  color: #2ecc71;
  border-bottom: 2px solid #2ecc71;
}

.tab-content {
  padding: 40px;
}

.params-content table {
  width: 100%;
  border-collapse: collapse;
}

.params-content td {
  padding: 12px;
  border: 1px solid #eee;
}

.param-key {
  background: #f8f9fa;
  width: 200px;
}

.reviews-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.user-info img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.rating {
  color: #ffd700;
}

.review-images {
  display: flex;
  gap: 8px;
  margin: 12px 0;
}

.review-images img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
}

.review-time {
  color: #999;
  font-size: 14px;
}
</style>