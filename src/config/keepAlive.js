// keep-alive 配置文件
export const KEEP_ALIVE_CONFIG = {
  // 需要缓存的页面
  include: [
    'HomeView',
    'CartView',
    'ProfileView',
    'OrderView',
    'SelectView',
    'BrandsView'
  ],

  // 不需要缓存的页面
  exclude: [
    'ProductDetailView',
    'LoginView',
    'RegisterView',
    'OrderSubmitView'
  ],

  // 最大缓存数量
  max: 10
};

// 根据路由名称判断是否需要缓存
export const shouldKeepAlive = (routeName) => {
  return KEEP_ALIVE_CONFIG.include.includes(routeName);
};

// 根据路由名称判断是否需要排除缓存
export const shouldExcludeFromKeepAlive = (routeName) => {
  return KEEP_ALIVE_CONFIG.exclude.includes(routeName);
};
