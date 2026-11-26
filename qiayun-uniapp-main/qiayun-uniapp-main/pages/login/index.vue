<template>
  <view class="container">
    <view class="top">
      <view class="logo-circle">
        <text class="logo-icon">⚡</text>
      </view>
      <view class="title-box">
        <text class="title">恰云电力服务有限公司</text>
        <text class="subtitle">专业电力服务 · 安全可靠运行</text>
      </view>
    </view>

    <view class="form">
      <view class="role-selector">
        <view
          class="role-item"
          :class="{ active: role === 'INDIVIDUAL' }"
          @tap="selectRole('INDIVIDUAL')"
        >
          个人用户
        </view>
        <view
          class="role-item"
          :class="{ active: role === 'ENTERPRISE' }"
          @tap="selectRole('ENTERPRISE')"
        >
          企业用户
        </view>
      </view>

      <button
        class="login-btn"
        open-type="getPhoneNumber"
        @getphonenumber="handleLogin"
        :disabled="loading"
      >
        {{ loading ? "登录中..." : "手机号快捷登录" }}
      </button>

      <button class="back-btn" @tap.stop="navToIndex">返回首页</button>

      <checkbox-group class="policy-row" @change="onPolicyChange">
        <label class="policy-item">
          <checkbox value="accept" :checked="policyAccepted" color="#14cccc" />
          <text class="policy-text">我已阅读并同意</text>
          <text class="policy-link" @tap.stop="navToAgreement"
            >《用户协议》</text
          >
          <text class="policy-text">和</text>
          <text class="policy-link" @tap.stop="navToPrivacy">《隐私政策》</text>
        </label>
      </checkbox-group>
    </view>
  </view>
</template>

<script>
import {
  login,
  getUserInfo,
  getCompanyUserInfo,
} from "@/apis/modules/login.js";
export default {
  data() {
    return {
      account: "",
      password: "",
      loading: false,
      redirect: "",
      policyAccepted: false,
      role: "INDIVIDUAL",
    };
  },
  onLoad(options) {
    console.log("login onLoad options===>", options);
    if (options.redirect) {
      this.redirect = options.redirect;
    }
  },
  methods: {
    navToIndex() {
      uni.switchTab({
        url: "/pages/task/index",
      });
    },
    selectRole(role) {
      this.role = role;
    },
    async handleLogin(e) {
      console.log("登录按钮点击", e);
      if (!this.role) {
        uni.showToast({
          title: "请选择登录角色",
          icon: "none",
        });
        return;
      }
      if (!this.policyAccepted) {
        uni.showToast({
          title: "请勾选同意《用户协议》和《隐私政策》",
          icon: "none",
        });
        return;
      }
      uni.login({
        success: async (res) => {
          console.log("login success===>", res);
          const params = {
            code: res.code,
            phoneEncryptedData: e.detail.encryptedData,
            phoneIv: e.detail.iv,
            loginRole: this.role,
          };
          try {
            this.loading = true;
            const result = await login(params);
            console.log("登录成功", result);
            uni.setStorageSync("token", result.token);
            uni.setStorageSync("userInfo", result.user);
            uni.setStorageSync("userRole", this.role);
            let info = null;
            if (this.role === "INDIVIDUAL") {
              info = await getUserInfo();
            } else {
              info = await getCompanyUserInfo();
            }
            console.log("个人信息详情", info);
            uni.setStorageSync("userInfo", info);
            this.loading = false;

            
            if (
              (this.role === "INDIVIDUAL" &&
                info.realAuthStatus === "UNAUTHORIZED") ||
              (this.role === "ENTERPRISE" && !info.enterpriseId)
            ) {
              uni.navigateTo({
                url: "/pages/login/guide",
              });
              return;
            }

            if (this.redirect === "mine") {
              uni.switchTab({
                url: "/pages/mine/index",
              });
            } else if (this.redirect) {
              uni.redirectTo({ url: this.redirect });
            } else {
              uni.switchTab({
                url: "/pages/customer/index",
              });
            }
          } catch (error) {
            console.log("登录失败", error);
            this.loading = false;
          }
        },
        fail: (err) => {
          console.log("login fail===>", err);
        },
      });
    },
    navToAgreement() {
      uni.navigateTo({ url: "/pages/login/agreement" });
    },
    navToPrivacy() {
      uni.navigateTo({ url: "/pages/login/privacy" });
    },
    onPolicyChange(e) {
      const values = e?.detail?.value || [];
      this.policyAccepted = values.includes("accept");
    },
  },
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #14cccc, #007acc);
  padding: 340rpx 48rpx 0;
  box-sizing: border-box;
}

.top {
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-bottom: 100rpx;
}

.logo-circle {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background-color: #14cccc;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(20, 204, 204, 0.3);
  margin-bottom: 24rpx;
}

.logo-icon {
  font-size: 56rpx;
  color: #fff;
  line-height: 1;
}

.title-box {
  margin-left: 24rpx;
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 36rpx;
  font-weight: 600;
  color: #ffffff;
}

.subtitle {
  margin-top: 8rpx;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
}

.form {
  margin-top: 20rpx;
  /* background-color: rgba(255, 255, 255, 0.96); */
  border-radius: 16rpx;
  padding: 32rpx 24rpx;
}

.role-selector {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40rpx;
}

.role-item {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 12rpx;
  font-size: 30rpx;
  color: #fff;
  margin: 0 16rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s;
}

.role-item.active {
  background-color: #fff;
  color: #14cccc;
  border-color: #fff;
  font-weight: 600;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.input-item {
  margin-bottom: 24rpx;
  border: 2rpx solid rgba(20, 204, 204, 0.12);
  border-radius: 12rpx;
  padding: 8rpx 16rpx;
  background-color: #fff;
}

.input {
  height: 88rpx;
  font-size: 30rpx;
  color: #222222;
}

.login-btn {
  margin-top: 12rpx;
  height: 88rpx;
  background-color: #14cccc;
  color: #ffffff;
  border-radius: 14rpx;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  /* box-shadow: 0 10rpx 24rpx rgba(20, 204, 204, 0.35); */
  box-shadow: 0 12rpx 28rpx rgba(0, 0, 0, 0.12);
}

.back-btn {
  margin-top: 24rpx;
  height: 88rpx;
  background-color: rgba(255, 255, 255, 0.9);
  color: #14cccc;
  border-radius: 14rpx;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  /* box-shadow: 0 10rpx 24rpx rgba(20, 204, 204, 0.35); */
  box-shadow: 0 12rpx 28rpx rgba(0, 0, 0, 0.12);
}
.login-btn[disabled] {
  opacity: 0.6;
}

.policy-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 32rpx;
}
.policy-item {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
}
.policy-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}
.policy-link {
  font-size: 24rpx;
  color: #ffffff;
  text-decoration: underline;
}
</style>
