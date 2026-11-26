import { API_BASE_URL } from "../config/index.js";

// 请求基础配置
const defaultConfig = {
  baseURL: API_BASE_URL,
  timeout: 3600000,
  headers: {
    "Content-Type": "application/json",
  },
  withToken: true, // 是否自动附带本地 token（Authorization: Bearer xxx）
  showLoading: false, // 是否显示全局 loading
};

// 拦截器容器
const requestInterceptors = [];
const responseInterceptors = [];

function setBaseURL(url) {
  defaultConfig.baseURL = url || "";
}
function addRequestInterceptor(interceptorFn) {
  if (typeof interceptorFn === "function")
    requestInterceptors.push(interceptorFn);
}
function addResponseInterceptor(interceptorFn) {
  if (typeof interceptorFn === "function")
    responseInterceptors.push(interceptorFn);
}

// 核心请求方法
function request({ url, method = "GET", data = {}, header = {}, config = {} }) {
  const cfg = { ...defaultConfig, ...config };

  // 拼接完整 URL
  const isFullUrl = /^https?:\/\//i.test(url);
  const fullUrl = isFullUrl ? url : cfg.baseURL + url;

  // 合并头
  const finalHeader = { ...cfg.headers, ...header };
  if (cfg.withToken) {
    const token = uni.getStorageSync("token");
    if (token) finalHeader["Authorization"] = `Bearer ${token}`;
  }

  // 构造请求对象
  let req = {
    url: fullUrl,
    method,
    data,
    header: finalHeader,
    timeout: cfg.timeout,
  };

  // 请求拦截器
  requestInterceptors.forEach((fn) => {
    const next = fn(req, cfg);
    if (next) req = next;
  });

  // 全局 Loading
  let needHideLoading = false;
  if (cfg.showLoading) {
    uni.showLoading({ title: "加载中...", mask: true });
    needHideLoading = true;
  }

  return new Promise((resolve, reject) => {
    uni.request({
      ...req,
      success: (res) => {
        if (needHideLoading) uni.hideLoading();

        let resp = res;
        // 响应拦截器
        responseInterceptors.forEach((fn) => {
          const next = fn(resp, cfg);
          if (next) resp = next;
        });

        const { statusCode, data: body } = resp;
        console.log("resp===>", resp);

        if (statusCode >= 200 && statusCode < 300) {
          if (body && typeof body === "object" && "code" in body) {
            resolve(body.data);
          } else {
            // 非约定结构，直接返回
            resolve(body);
          }
        } else {
          const bizMsg = body.message || body.msg || "请求失败";
          // token 失效处理
          if (statusCode === 401 || statusCode === 403) {
            uni.removeStorageSync("token");
            uni.showToast({
              title: "登录已过期，请重新登录",
              icon: "none",
            });
            setTimeout(() => {
              uni.reLaunch({ url: "/pages/login/index" });
            }, 600);
          } else {
            uni.showToast({ title: bizMsg, icon: "none" });
          }
          reject(resp.data);
        }
      },
      fail: (err) => {
        if (needHideLoading) uni.hideLoading();
        uni.showToast({ title: "网络异常，请稍后重试", icon: "none" });
        reject(err);
      },
    });
  });
}

// 工具：拼接查询参数
function appendQuery(url, params) {
  const keys = Object.keys(params || {});
  if (!keys.length) return url;
  const qs = keys
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join("&");
  return url.includes("?") ? `${url}&${qs}` : `${url}?${qs}`;
}

// 常用方法
const http = {
  setBaseURL,
  addRequestInterceptor,
  addResponseInterceptor,

  get(url, params = {}, config = {}) {
    const finalUrl = appendQuery(url, params);
    return request({ url: finalUrl, method: "GET", config });
  },
  post(url, data = {}, config = {}) {
    return request({ url, method: "POST", data, config });
  },
  put(url, data = {}, config = {}) {
    return request({ url, method: "PUT", data, config });
  },
  delete(url, data = {}, config = {}) {
    return request({ url, method: "DELETE", data, config });
  },
  upload(filePath, formData = {}, config = {}) {
    const cfg = { ...defaultConfig, ...config };

    const finalHeader = { ...cfg.headers };
    if (cfg.withToken) {
      const token = uni.getStorageSync("token");
      if (token) finalHeader["Authorization"] = `Bearer ${token}`;
    }

    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: cfg.baseURL + "/api/v1/app/oss/upload",
        filePath,
        name: "file",
        formData,
        header: finalHeader,
        timeout: cfg.timeout,
        success: (res) => {
          try {
            const body = JSON.parse(res.data);
            if (body.code === 200 || body.code === 0) {
              resolve(body.data);
            } else {
              uni.showToast({
                title: body.message || "上传失败",
                icon: "none",
              });
              reject(body);
            }
          } catch (e) {
            resolve(res.data);
          }
        },
        fail: (err) => {
          uni.showToast({ title: "上传失败，请稍后重试", icon: "none" });
          reject(err);
        },
      });
    });
  },
};

export default http;
