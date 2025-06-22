<template>
  <div class="order-page-wrapper">
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

    <div class="order-page container">
      <!-- 订单状态标签栏，支持点击切换不同状态的订单 -->
      <div class="order-tabs">
        <div v-for="status in orderStatus" :key="status.value"
          :class="['tab-item', { active: currentStatus === status.value }]" @click="currentStatus = status.value">
          {{ status.label }}
          <span v-if="status.count > 0" class="badge">{{ status.count }}</span>
        </div>
      </div>

      <!-- 订单列表区域，显示过滤后的订单 -->
      <div v-if="filteredOrders.length > 0" class="order-list">
        <!-- 订单卡片循环渲染 -->
        <div v-for="order in filteredOrders" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="order-info">
              <span class="order-id">订单号：{{ order.id }}</span>
              <span class="order-time">{{ formatDate(order.createTime) }}</span>
            </div>
            <div class="order-status">{{ order.statusText }}</div>
          </div>

          <div class="order-items">
            <!-- 订单商品项循环渲染 -->
            <div v-for="item in order.items" :key="item.productId" class="order-item">
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

          <div class="order-footer">
            <div class="order-total">
              共{{ getTotalQuantity(order) }}件商品
              合计：<span class="total-price">¥{{ order.totalPrice }}</span>
            </div>

            <div class="order-actions">
              <!-- 待付款状态订单操作按钮 -->
              <template v-if="order.status === 'pending'">
                <button class="btn-cancel" @click="cancelOrder(order)">取消订单</button>
                <button class="btn-primary" @click="payOrder(order)">立即付款</button>
              </template>

              <!-- 待发货状态订单操作按钮 -->
              <template v-if="order.status === 'paid'">
                <button class="btn-secondary" @click="viewLogistics(order)">
                  查看物流
                </button>
              </template>

              <!-- 待收货状态订单操作按钮 -->
              <template v-if="order.status === 'shipped'">
                <button class="btn-secondary" @click="viewLogistics(order)">
                  查看物流
                </button>
                <button class="btn-primary" @click="confirmReceive(order)">
                  确认收货
                </button>
              </template>

              <!-- 已完成状态订单操作按钮 -->
              <template v-if="order.status === 'finished'">
                <button class="btn-secondary" @click="viewLogistics(order)">查看物流</button>
                <button class="btn-primary" @click="buyAgain(order)">再次购买</button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- 无订单时的空状态提示 -->
      <div v-else class="empty-state">
        <img src="../assets/images/none.png" alt="暂无订单">
        <p>暂无相关订单</p>
        <RouterLink to="/" class="btn-primary">去逛逛</RouterLink>
      </div>

      <!-- 加载更多按钮，支持分页加载订单 -->
      <div v-if="hasMore" class="load-more">
        <button :disabled="loading" @click="loadMore">
          {{ loading ? '加载中...' : '加载更多' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import request from '../utils/http';
import { formatDate } from '../utils/date';
import { ElMessage, ElMessageBox } from 'element-plus';
import '../assets/styles/nav.css';

const router = useRouter();
const userStore = useUserStore();
const searchQuery = ref('');

// 处理搜索功能
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      name: 'select',
      query: { q: searchQuery.value }
    });
  }
};

// 定义订单状态选项
const orderStatus = [
  { label: '全部', value: 'all', count: 0 },
  { label: '待付款', value: 'pending', count: 0 },
  { label: '待发货', value: 'paid', count: 0 },
  { label: '待收货', value: 'shipped', count: 0 },
  { label: '已完成', value: 'completed', count: 0 }
];

// 当前选中的订单状态
const currentStatus = ref('all');
// 订单数据列表
const orders = ref([]);
// 当前页码
const page = ref(1);
// 加载状态
const loading = ref(false);
// 是否有更多数据
const hasMore = ref(true);
// 每页显示数量
const pageSize = 10;

// 获取订单列表数据
const fetchOrders = async (isLoadMore = false) => {
  if (loading.value) return;
  loading.value = true;

  try {
    const params = {
      userId: userStore.userInfo.id,
      _page: page.value,
      _limit: pageSize,
      _sort: 'createTime',
      _order: 'desc'
    };

    // 根据当前状态过滤订单
    if (currentStatus.value !== 'all') {
      params.status = currentStatus.value;
    }

    const res = await request.get('/orders', { params });

    // 处理加载更多逻辑
    if (isLoadMore) {
      orders.value.push(...res);
    } else {
      orders.value = res;
    }

    // 判断是否还有更多数据
    hasMore.value = res.length === pageSize;
  } catch (error) {
    console.error('获取订单列表失败:', error);
    ElMessage.error('获取订单列表失败');
  } finally {
    loading.value = false;
  }
};

// 更新各状态订单数量
const updateOrderCounts = async () => {
  try {
    if (!userStore.userInfo?.id) return;

    const userId = userStore.userInfo.id;
    const allOrders = await request.get('/orders', {
      params: { userId }
    });

    // 计算各状态订单数量
    orderStatus.forEach(status => {
      if (status.value === 'all') {
        status.count = allOrders.length;
      } else {
        status.count = allOrders.filter(order => order.status === status.value).length;
      }
    });
  } catch (error) {
    console.error('获取订单数量失败:', error);
  }
};

// 计算属性：过滤后的订单列表
const filteredOrders = computed(() => {
  if (currentStatus.value === 'all') return orders.value;
  return orders.value.filter(order => order.status === currentStatus.value);
});

// 计算订单商品总数量
const getTotalQuantity = (order) => {
  return order.items.reduce((total, item) => total + item.quantity, 0);
};

// 取消订单
const cancelOrder = async (order) => {
  try {
    // 确认对话框
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    // 更新订单状态为已取消
    await request.put(`/orders/${order.id}`, {
      ...order,
      status: 'cancelled',
      statusText: '已取消'
    });

    // 重新获取订单列表
    fetchOrders();
    ElMessage.success('订单已取消');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error);
      ElMessage.error('取消失败');
    }
  }
};

// 支付订单
const payOrder = async (order) => {
  try {
    // 更新订单状态为已支付
    await request.put(`/orders/${order.id}`, {
      ...order,
      status: 'paid',
      statusText: '待发货',
      payTime: new Date().toISOString()
    });

    // 重新获取订单列表
    fetchOrders();
    ElMessage.success('支付成功');
  } catch (error) {
    console.error('支付失败:', error);
    ElMessage.error('支付失败');
  }
};

// 查看物流（模拟功能）
const viewLogistics = () => {
  ElMessage('物流查询功能开发中');
};

// 确认收货
const confirmReceive = async (order) => {
  try {
    // 确认对话框
    await ElMessageBox.confirm('确定已收到商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    // 更新订单状态为已完成
    await request.put(`/orders/${order.id}`, {
      ...order,
      status: 'completed',
      statusText: '已完成',
      completedTime: new Date().toISOString()
    });

    // 重新获取订单列表
    fetchOrders();
    ElMessage.success('确认收货成功');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认收货失败:', error);
      ElMessage.error('确认失败');
    }
  }
};

// 退出登录
const logout = () => {
  userStore.logout();
  router.push('/login');
};

// 加载更多订单
const loadMore = () => {
  page.value++;
  fetchOrders(true);
};

// 监听订单状态变化，重置分页
watch(currentStatus, () => {
  page.value = 1;
  fetchOrders();
});

// 组件挂载时初始化
onMounted(async () => {
  if (!userStore.isLogin) {
    router.push('/login');
    return;
  }
  // 更新订单状态计数
  await updateOrderCounts();
  // 获取订单列表
  fetchOrders();
});
</script>

<style scoped>
.order-page-wrapper {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.order-page {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
}

.order-tabs {
  display: flex;
  gap: 40px;
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
}

.tab-item {
  position: relative;
  padding: 0 10px;
  color: #666;
  cursor: pointer;
}

.tab-item.active {
  color: #2ecc71;
  font-weight: bold;
}

.tab-item.active:after {
  content: '';
  position: absolute;
  bottom: -21px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #2ecc71;
}

.badge {
  position: absolute;
  top: -8px;
  right: -12px;
  background: #f56c6c;
  color: #fff;
  border-radius: 10px;
  padding: 0 6px;
  font-size: 12px;
  min-width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
}

.order-card {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 20px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.order-info {
  display: flex;
  gap: 20px;
  color: #666;
}

.order-status {
  color: #2ecc71;
  font-weight: bold;
}

.order-items {
  padding: 20px 0;
}

.order-item {
  display: flex;
  gap: 20px;
  padding: 20px 0;
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
}

.price-qty {
  margin-top: 12px;
}

.price {
  color: #f56c6c;
  font-weight: bold;
  margin-right: 12px;
}

.quantity {
  color: #666;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.order-total {
  color: #666;
}

.total-price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 18px;
}

.order-actions {
  display: flex;
  gap: 12px;
}

.btn-primary,
.btn-secondary,
.btn-cancel {
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #2ecc71;
  color: #fff;
  border: none;
}

.btn-secondary {
  background: #fff;
  color: #2ecc71;
  border: 1px solid #2ecc71;
}

.btn-cancel {
  background: #fff;
  color: #666;
  border: 1px solid #ddd;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}

.empty-state img {
  width: 200px;
  margin-bottom: 20px;
}

.empty-state p {
  color: #666;
  margin-bottom: 20px;
}

.load-more {
  text-align: center;
  margin-top: 40px;
}

.load-more button {
  padding: 10px 40px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #666;
  cursor: pointer;
}

.load-more button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>