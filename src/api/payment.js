import instance from './axios';

/**
 * 支付相关 API
 */
export const payment = {
  /**
   * 创建充值订单
   * @param {Object} params - 订单参数
   * @param {string} params.coinType - 币种 (CNY/USD/USDT)
   * @param {number} params.amount - 充值金额
   * @param {string} params.paymentMethod - 支付方式 (alipay/wechat/usdt/bank/creem)
   * @returns {Promise} 订单信息
   */
  createRechargeOrder: async (params) => {
    try {
      const { data } = await instance.post('/productx/recharge/create', {
        coinType: params.coinType,
        amount: params.amount,
        paymentMethod: params.paymentMethod,
        // creem 支付特定参数
        ...(params.paymentMethod === 'creem' && {
          creemProductId: params.creemProductId,
          creemPriceId: params.creemPriceId,
        }),
      });
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '创建订单失败',
        error: error,
      };
    }
  },

  /**
   * 查询订单状态
   * @param {string} orderNo - 订单号
   * @returns {Promise} 订单状态信息
   */
  getOrderStatus: async (orderNo) => {
    try {
      const { data } = await instance.get(`/productx/recharge/order/${orderNo}/status`);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '查询订单状态失败',
        error: error,
      };
    }
  },

  /**
   * 获取订单详情
   * @param {string} orderNo - 订单号
   * @returns {Promise} 订单详情
   */
  getOrderDetail: async (orderNo) => {
    try {
      const { data } = await instance.get(`/productx/recharge/order/${orderNo}`);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取订单详情失败',
        error: error,
      };
    }
  },

  /**
   * 取消订单
   * @param {string} orderNo - 订单号
   * @returns {Promise} 取消结果
   */
  cancelOrder: async (orderNo) => {
    try {
      const { data } = await instance.post(`/productx/recharge/order/${orderNo}/cancel`);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '取消订单失败',
        error: error,
      };
    }
  },

  /**
   * 创建 Creem 支付会话
   * @param {Object} params - 支付参数
   * @param {string} params.orderNo - 订单号
   * @returns {Promise} 支付会话信息（包含支付链接或 checkout session ID）
   */
  createCreemCheckout: async (params) => {
    try {
      const { data } = await instance.post('/productx/recharge/creem/checkout', {
        orderNo: params.orderNo,
      });
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '创建支付会话失败',
        error: error,
      };
    }
  },

  /**
   * 获取所有启用的支付方式
   * @param {string} currencyCode - 可选，币种代码，如果提供则只返回支持该币种的支付方式
   * @returns {Promise} 支付方式列表
   */
  getActivePaymentMethods: async (currencyCode = null) => {
    try {
      const params = currencyCode ? { currencyCode } : {};
      const { data } = await instance.get('/productx/sys-payment-methods/active', { params });
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取支付方式失败',
        error: error,
      };
    }
  },

  /**
   * 获取系统支持的货币列表
   * @returns {Promise} 货币列表
   */
  getSupportedCurrencies: async () => {
    try {
      const { data } = await instance.get('/productx/sys-currencies/supported-list');
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取货币列表失败',
        error: error,
      };
    }
  },

  /**
   * 获取 Creem 产品配置列表
   * @param {string} coinType - 币种 (CNY/USD/USDT)
   * @returns {Promise} Creem 产品配置列表
   */
  getCreemProducts: async (coinType) => {
    try {
      const { data } = await instance.get('/productx/creem/product/list', {
        params: { coinType }
      });
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取 Creem 产品列表失败',
        error: error,
      };
    }
  },
};

export default payment;

