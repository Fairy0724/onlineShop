<template>
  <div>
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

        <!-- 导航链接（根据登录状态动态显示） -->
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

    <!-- 购物车主容器 -->
    <div class="cart-container">
      <h1>购物车</h1>

      <!-- 购物车为空时的提示 -->
      <div v-if="!cartItems.length" class="empty-state">
        <img src="../assets/images/none.png" alt="购物车为空" />
        <p>购物车是空的</p>
        <router-link to="/" class="btn-primary">去逛逛</router-link>
      </div>

      <!-- 购物车有商品时的列表 -->
      <div v-else class="cart-list">
        <!-- 购物车表头 -->
        <div class="cart-header">
          <label class="checkbox-wrapper">
            <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" />
            <span class="checkmark"></span>
            全选
          </label>
          <span class="header-product">商品信息</span>
          <span class="header-price">单价</span>
          <span class="header-quantity">数量</span>
          <span class="header-total">小计</span>
          <span class="header-action">操作</span>
        </div>

        <!-- 购物车商品项列表 -->
        <div v-for="item in cartItems" :key="item.id" class="cart-item">
          <!-- 商品选择复选框 -->
          <label class="checkbox-wrapper">
            <input type="checkbox" v-model="item.selected" @change="updateSelection" />
            <span class="checkmark"></span>
          </label>

          <!-- 商品图片 -->
          <img v-if="item.product?.mainImage" :src="item.product.mainImage" :alt="item.product?.name"
            class="product-image" />

          <!-- 商品信息（名称+规格） -->
          <div class="item-info">
            <h3>{{ item.product?.name || '商品已下架' }}</h3>
            <p class="spec" v-if="item.specName">规格：{{ item.specName }}</p>
          </div>

          <!-- 商品单价 -->
          <div class="item-price">¥{{ item.product?.price || 0 }}</div>

          <!-- 数量选择器 -->
          <div class="quantity-selector">
            <button @click="updateQuantity(item, -1)" :disabled="item.quantity <= 1">-</button>
            <input type="number" v-model="item.quantity" min="1" @change="updateQuantity(item)" />
            <button @click="updateQuantity(item, 1)">+</button>
          </div>

          <!-- 商品小计金额 -->
          <div class="item-total">¥{{ (item.product?.price || 0) * item.quantity }}</div>

          <!-- 移除商品按钮 -->
          <button class="btn-remove" @click="removeFromCart(item.id)">
            <i class="fa fa-trash"></i> 移除
          </button>
        </div>

        <!-- 购物车底部结算区 -->
        <div class="cart-footer">
          <div class="footer-left">
            <!-- 已选商品数量 -->
            <span class="selected-count">已选择 {{ selectedCount }} 件商品</span>
          </div>
          <div class="footer-right">
            <!-- 合计金额 -->
            <div class="total">
              合计：<span class="total-price">¥{{ selectedTotalPrice }}</span>
            </div>
            <!-- 结算按钮（选中商品时可用） -->
            <button class="btn-checkout" @click="checkout" :disabled="selectedCount === 0">
              结算 ({{ selectedCount }})
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated, onDeactivated } from 'vue';
import request from '../utils/http';
import { useUserStore } from '../stores/userStore';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import '../assets/styles/nav.css';

// 初始化路由和用户状态
const router = useRouter();
const userStore = useUserStore();

// 响应式数据定义
const cartItems = ref([]);              // 购物车商品列表
const searchQuery = ref('');             // 搜索关键词
const selectedCount = ref(0);            // 已选商品数量
const selectedTotalPrice = ref(0);       // 已选商品总价
const isAllSelected = ref(false);        // 全选状态

// 数据是否已加载的标志
const dataLoaded = ref(false);

// 处理搜索功能
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      name: 'select',
      query: { q: searchQuery.value }
    });
  }
};

// 全选/取消全选功能
const toggleSelectAll = () => {
  const newState = !isAllSelected.value;
  cartItems.value.forEach(item => {
    item.selected = newState;
  });
  updateSelection();
};

// 更新选择状态及计算总价
const updateSelection = () => {
  // 计算已选商品数量和总价
  const selectedItems = cartItems.value.filter(item => item.selected && item.product);
  selectedCount.value = selectedItems.length;
  selectedTotalPrice.value = selectedItems.reduce((total, item) => {
    const itemPrice = Number(item.price || item.product.price || 0);
    return total + (itemPrice * item.quantity);
  }, 0);
  // 更新全选状态
  isAllSelected.value = cartItems.value.length > 0 && cartItems.value.every(item => item.selected);
};

// 用户登出功能
const logout = async () => {
  await userStore.logout();
  router.push('/login');
};

// 获取购物车商品数据
const fetchCartItems = async () => {
  try {
    // 检查用户登录状态
    if (!userStore.userInfo || !userStore.userInfo.id) {
      router.push('/login');
      return;
    }

    // 获取购物车数据
    const cartRes = await request.get('/carts', {
      params: { userId: userStore.userInfo.id }
    });

    // 获取商品数据
    const productsRes = await request.get('/products');
    const products = productsRes || [];

    // 合并购物车项和商品信息
    const cartItemsWithProducts = cartRes.map(item => {
      const product = products.find(p => String(p.id) === String(item.productId));
      const spec = product?.specs?.find(s => String(s.id) === String(item.specId));
      return {
        ...item,
        product,
        specName: spec?.name,
        selected: false // 初始化选择状态为未选
      };
    });
    // 更新购物车商品列表
    cartItems.value = cartItemsWithProducts;
    updateSelection();
    dataLoaded.value = true;
  } catch (error) {
    console.error('获取购物车信息失败:', error);
    ElMessage.error('获取购物车信息失败');
  }
};

// 更新商品数量
const updateQuantity = async (item, change) => {
  // 计算新的数量
  const newQuantity = change ? item.quantity + change : item.quantity;
  if (newQuantity < 1) return;

  try {
    // 发送更新请求
    await request.put(`/carts/${item.id}`, {
      ...item,
      quantity: newQuantity
    });

    // 本地更新数量
    if (change) {
      item.quantity = newQuantity;
    }

    updateSelection();
  } catch (error) {
    console.error('更新商品数量失败:', error);
    ElMessage.error('更新失败');
  }
};

// 从购物车移除商品
const removeFromCart = async (id) => {
  try {
    // 发送删除请求
    await request.delete(`/carts/${id}`);
    // 本地过滤商品
    cartItems.value = cartItems.value.filter(item => item.id !== id);
    // 更新选择状态及总价
    updateSelection();
    ElMessage.success('移除成功');
  } catch (error) {
    console.error('移除商品失败:', error);
    ElMessage.error('移除失败');
  }
};

// 结算功能（跳转到订单提交页）
const checkout = () => {
  const selectedItems = cartItems.value.filter(item => item.selected);
  if (selectedItems.length === 0) {
    ElMessage.warning('请选择要结算的商品');
    return;
  }

  // 准备订单数据
  const orderData = {
    items: selectedItems.map(item => ({
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      specId: item.specId,
      specName: item.specName,
      image: item.product.mainImage,
      cartId: item.id
    })),
    totalPrice: selectedTotalPrice.value
  };

  // 跳转到订单提交页并传递订单数据
  router.push({
    name: 'orderSubmit',
    params: { orderData: JSON.stringify(orderData) }
  });
};

// 初始化数据
const initData = async () => {
  if (!userStore.isLogin) {
    router.push('/login');
    return;
  }

  if (!dataLoaded.value) {
    await fetchCartItems();
  }
};

// 组件挂载时初始化
onMounted(() => {
  initData();
});

// keep-alive 生命周期钩子
onActivated(() => {
  console.log('CartView 被激活');
  // 每次激活时刷新购物车数据，确保数据最新
  if (userStore.isLogin) {
    fetchCartItems();
  }
});

onDeactivated(() => {
  console.log('CartView 被停用');
  // 可以在这里保存一些状态
});
</script>

<style scoped>
.cart-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.cart-container h1 {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 3px solid #2ecc71;
}

/* 购物车列表容器样式 */
.cart-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* 表头样式（网格布局） */
.cart-header {
  display: grid;
  grid-template-columns: 60px 2fr 1fr 1fr 1fr 80px;
  align-items: center;
  padding: 25px;
  background: #f8faf8;
  border-bottom: 1px solid #e8f3e8;
  color: #2c3e50;
  font-weight: 500;
  font-size: 15px;
}

.cart-header span {
  text-align: center;
}

/* 购物车商品项样式（网格布局） */
.cart-item {
  display: grid;
  grid-template-columns: 80px 0.6fr 1fr 0.5fr 0.9fr 140px 60px;
  align-items: center;
  padding: 25px;
  border-bottom: 1px solid #e8f3e8;
  transition: background-color 0.3s;
}

.cart-item:hover {
  background: #f9fff9;
}

.cart-item:last-child {
  border-bottom: none;
}

/* 商品图片样式（悬停放大效果） */
.product-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  margin-right: 15px;
}

.product-image:hover {
  transform: scale(1.05);
}

/* 商品信息样式 */
.item-info {
  padding: 0 30px;
}

.item-info h3 {
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 8px;
  font-weight: 500;
}

.spec {
  color: #666;
  font-size: 14px;
  background: #f0f9f0;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

/* 价格样式（绿色高亮） */
.item-price,
.item-total {
  color: #2ecc71;
  font-weight: 600;
  font-size: 16px;
}

/* 数量选择器样式（绿色主题） */
.quantity-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0f9f0;
  padding: 6px 12px;
  border-radius: 16px;
  border: 1px solid #d4edda;
  width: 166px;
}

.quantity-selector button {
  width: 36px;
  height: 36px;
  border: none;
  background: #fff;
  color: #2ecc71;
  font-size: 18px;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(46, 204, 113, 0.1);
}

.quantity-selector button:hover:not(:disabled) {
  background: #2ecc71;
  color: white;
  box-shadow: 0 4px 12px rgba(46, 204, 113, 0.2);
  transform: translateY(-1px);
}

.quantity-selector button:disabled {
  background: #f5f5f5;
  color: #ddd;
  cursor: not-allowed;
  box-shadow: none;
}

.quantity-selector input {
  width: 50px;
  height: 36px;
  text-align: center;
  border: 1px solid #d4edda;
  border-radius: 18px;
  font-size: 16px;
  background: #fff;
}

/* 复选框样式 */
.checkbox-wrapper {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.checkbox-wrapper input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  accent-color: #2ecc71;
}

/* 移除按钮样式（悬停变红） */
.btn-remove {
  padding: 8px 10px;
  background: none;
  border: 1px solid #e8f3e8;
  color: #666;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-remove:hover {
  background: #fff2f2;
  border-color: #ff6b6b;
  color: #ff6b6b;
}

/* 底部结算区样式 */
.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px;
  background: #f8faf8;
  border-top: 1px solid #e8f3e8;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 25px;
}

.selected-count {
  color: #666;
  background: #fff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 30px;
}

.total-price {
  color: #2ecc71;
  font-size: 24px;
  font-weight: 600;
}

/* 结算按钮样式（绿色主色调） */
.btn-checkout {
  padding: 12px 36px;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(46, 204, 113, 0.2);
}

.btn-checkout:hover:not(:disabled) {
  background: #27ae60;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
}

.btn-checkout:disabled {
  background: #a5e6bc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 空购物车样式 */
.empty-state {
  text-align: center;
  padding: 80px 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.empty-state img {
  width: 200px;
  margin-bottom: 30px;
  opacity: 0.8;
}

.empty-state p {
  color: #666;
  font-size: 16px;
  margin-bottom: 30px;
}

.empty-state .btn-primary {
  display: inline-block;
  padding: 12px 36px;
  background: #2ecc71;
  color: white;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(46, 204, 113, 0.2);
}

.empty-state .btn-primary:hover {
  background: #27ae60;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
}

/* 响应式布局（移动端适配） */
@media (max-width: 768px) {
  .cart-header {
    display: none;
  }

  .cart-item {
    grid-template-columns: 1fr;
    gap: 15px;
    text-align: center;
  }

  .product-image {
    margin: 0 auto;
  }

  .quantity-selector {
    justify-content: center;
  }

  .item-info {
    padding: 0;
  }

  .cart-footer {
    flex-direction: column;
    gap: 20px;
    padding: 20px;
  }

  .footer-right {
    width: 100%;
    justify-content: center;
  }
}
</style>
