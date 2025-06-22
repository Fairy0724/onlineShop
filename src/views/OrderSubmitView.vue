<template>
  <div class="order-submit-page-wrapper">
    <!-- 顶部导航栏，包含品牌logo、搜索框和导航链接 -->
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

    <!-- 订单提交主内容区 -->
    <div class="order-submit-page container">
      <!-- 收货地址选择区域 -->
      <div class="submit-section address-section">
        <h2>收货地址</h2>
        <!-- 地址列表显示 -->
        <div v-if="addresses.length" class="address-list">
          <!-- 地址卡片循环渲染，支持点击选择 -->
          <div v-for="addr in addresses" :key="addr.id"
            :class="['address-card', { active: selectedAddressId === addr.id }]" @click="selectAddress(addr)">
            <div class="address-info">
              <div class="contact">
                <span class="name">{{ addr.name }}</span>
                <span class="phone">{{ addr.phone }}</span>
                <span v-if="addr.isDefault" class="default-tag">默认</span>
              </div>
              <div class="address">
                {{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}
              </div>
            </div>
          </div>
        </div>
        <!-- 无地址时的提示和添加按钮 -->
        <div v-else class="empty-address">
          <p>暂无收货地址</p>
          <el-button type="primary" @click="goToAddAddress">添加收货地址</el-button>
        </div>
      </div>

      <!-- 订单信息展示区域 -->
      <div class="submit-section order-info-section">
        <h2>支付订单</h2>
        <!-- 订单商品列表 -->
        <div class="order-items">
          <div v-for="item in orderItems" :key="item.productId" class="order-item">
            <div class="item-image">
              <img :src="item.image" :alt="item.productName">
            </div>
            <div class="item-info">
              <h3>{{ item.productName }}</h3>
              <p v-if="item.specName" class="spec">{{ item.specName }}</p>
              <div class="price-qty">
                <span class="price">¥{{ item.price }}</span>
                <span class="quantity">x{{ item.quantity }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 订单提交底部操作区 -->
      <div class="submit-footer">
        <div class="order-total">
          共{{ getTotalQuantity() }}件商品
          <span class="total-label">需支付：</span>
          <span class="total-price">¥{{ totalPrice }}</span>
        </div>
        <div class="submit-actions">
          <button class="btn-cancel" @click="cancelSubmit">取消</button>
          <!-- 支付按钮，地址未选择时禁用 -->
          <button class="btn-submit" @click="payOrder" :disabled="!selectedAddressId">
            立即支付
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import request from '../utils/http';
import { ElMessage } from 'element-plus';
import '../assets/styles/nav.css';

// 初始化路由、用户状态
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
// 搜索关键词
const searchQuery = ref('');
// 收货地址列表
const addresses = ref([]);
// 选中的地址ID
const selectedAddressId = ref('');
// 订单商品项
const orderItems = ref([]);
// 订单总价
const totalPrice = ref(0);

// 处理搜索功能
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      name: 'select',
      query: { q: searchQuery.value }
    });
  }
};

// 获取用户收货地址列表
const fetchAddresses = async () => {
  try {
    if (userStore.userInfo?.id) {
      const res = await request.get(`/addresses?userId=${userStore.userInfo.id}`);
      addresses.value = Array.isArray(res) ? res : [];
      // 自动选中默认地址
      const defaultAddress = addresses.value.find(addr => addr.isDefault);
      if (defaultAddress) {
        selectedAddressId.value = defaultAddress.id;
      }
    }
  } catch (error) {
    console.error('获取地址列表失败:', error);
    ElMessage.error('获取地址列表失败');
  }
};

// 选择收货地址
const selectAddress = (address) => {
  selectedAddressId.value = address.id;
};

// 跳转到添加地址页面
const goToAddAddress = () => {
  router.push({
    name: 'profile',
    query: { tab: 'address' }
  });
};

// 计算商品总数量
const getTotalQuantity = () => {
  return orderItems.value.reduce((total, item) => total + item.quantity, 0);
};

// 取消订单提交，返回上一页
const cancelSubmit = () => {
  router.back();
};

// 提交订单并支付
const payOrder = async () => {
  if (!selectedAddressId.value) {
    ElMessage.warning('请选择收货地址');
    return;
  }

  try {
    // 构建订单数据
    const order = {
      userId: userStore.userInfo.id,
      addressId: selectedAddressId.value,
      items: orderItems.value,
      totalPrice: totalPrice.value,
      status: 'paid',  // 模拟已支付状态
      statusText: '待发货',
      createTime: new Date().toISOString(),
      payTime: new Date().toISOString()  // 支付时间
    };

    // 保存订单到服务器
    await request.post('/orders', order);

    // 减少商品库存
    await Promise.all(
      orderItems.value.map(async (item) => {
        try {
          // 获取商品信息
          const productRes = await request.get('/products', {
            params: { id: item.productId }
          });

          if (Array.isArray(productRes) && productRes.length > 0) {
            const product = productRes[0];

            // 如果有规格，减少对应规格的库存
            if (item.specId && product.specs) {
              const specIndex = product.specs.findIndex(s => s.id === item.specId);
              if (specIndex !== -1) {
                // 如果规格有库存字段，减少规格库存
                if (product.specs[specIndex].stock !== undefined) {
                  product.specs[specIndex].stock = Math.max(0, product.specs[specIndex].stock - item.quantity);
                }
              }
            }

            // 减少商品总库存
            product.stock = Math.max(0, product.stock - item.quantity);

            // 更新商品信息
            await request.put(`/products/${product.id}`, product);
          }
        } catch (error) {
          console.error(`减少商品${item.productId}库存失败:`, error);
        }
      })
    );

    // 清空已支付的购物车项
    await Promise.all(
      orderItems.value
        .filter(item => item.cartId) // 只删除有购物车ID的项
        .map(item => request.delete(`/carts/${item.cartId}`))
    );

    ElMessage.success('支付成功');
    router.push('/orders');  // 跳转到订单列表
  } catch (error) {
    console.error('支付失败:', error);
    ElMessage.error('支付失败，请重试');
  }
};

// 用户退出登录
const logout = async () => {
  await userStore.logout();
  router.push('/login');
};

// 组件挂载时初始化
onMounted(async () => {
  if (!userStore.isLogin) {
    router.push('/login');
    return;
  }

  // 获取地址列表
  await fetchAddresses();

  // 解析路由传递的订单数据
  const routeData = route.params.orderData;
  if (routeData) {
    try {
      const data = JSON.parse(routeData);
      orderItems.value = data.items;
      totalPrice.value = data.totalPrice;
    } catch (error) {
      console.error('解析订单数据失败:', error);
      ElMessage.error('订单数据无效');
      router.push('/cart');
    }
  } else {
    router.push('/cart');
  }
});
</script>

<style scoped>
.order-submit-page {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.submit-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.submit-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e8f3e8;
}

/* 地址卡片样式 */
.address-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.address-card {
  padding: 20px;
  border: 1px solid #e8f3e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.address-card:hover {
  border-color: #2ecc71;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 204, 113, 0.1);
}

.address-card.active {
  border-color: #2ecc71;
  background: #f0f9f0;
}

.contact {
  margin-bottom: 10px;
}

.name {
  font-weight: 500;
  margin-right: 10px;
}

.phone {
  color: #666;
}

.default-tag {
  background: #2ecc71;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-left: 10px;
}

.address {
  color: #666;
  line-height: 1.5;
}

/* 订单商品样式 */
.order-items {
  margin-top: 20px;
}

.order-item {
  display: flex;
  gap: 20px;
  padding: 20px 0;
  border-bottom: 1px solid #e8f3e8;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
}

.item-info h3 {
  font-size: 16px;
  margin-bottom: 8px;
}

.spec {
  color: #666;
  font-size: 14px;
  background: #f0f9f0;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.price-qty {
  margin-top: 12px;
}

.price {
  color: #2ecc71;
  font-weight: bold;
  margin-right: 12px;
}

.quantity {
  color: #666;
}

/* 底部结算栏样式 */
.submit-footer {
  background: white;
  border-radius: 12px;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.order-total {
  color: #666;
}

.total-label {
  margin-left: 20px;
  font-size: 16px;
}

.total-price {
  color: #2ecc71;
  font-size: 26px;
  font-weight: bold;
}

.submit-actions {
  display: flex;
  gap: 15px;
}

.btn-cancel,
.btn-submit {
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel {
  background: white;
  border: 1px solid #ddd;
  color: #666;
}

.btn-cancel:hover {
  border-color: #2ecc71;
  color: #2ecc71;
}

.btn-submit {
  background: #2ecc71;
  color: white;
  border: none;
  box-shadow: 0 2px 8px rgba(46, 204, 113, 0.2);
  font-weight: 600;
  font-size: 18px;
  padding: 12px 40px;
}

.btn-submit:hover {
  background: #27ae60;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
}

.btn-submit:disabled {
  background: #a5e6bc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 空地址提示样式 */
.empty-address {
  text-align: center;
  padding: 40px 0;
}

.empty-address p {
  color: #666;
  margin-bottom: 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .submit-footer {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .submit-actions {
    width: 100%;
    justify-content: center;
  }

  .btn-cancel,
  .btn-submit {
    flex: 1;
  }
}
</style>