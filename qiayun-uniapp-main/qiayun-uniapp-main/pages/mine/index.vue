<template>
  <view class="container">
    <view class="header" @tap="handleEnter('userInfo')">
      <view class="user-info">
        <view class="avatar">
          <image
            class="avatar-img"
            :src="user.avatarUrl || '/static/avatar.png'"
            alt="avatar"
          />
          <uv-icon name="arrow-right" class="arrow" />
        </view>
        <view class="info">
          <view class="name">{{ user.nickname }}</view>
          <view class="phone"
            >{{ user.company }} <text v-if="user.jobName">|</text
            > {{ user.jobName || "" }}</view
          >
          <view class="phone">{{ user.phone || "" }}</view>
        </view>
      </view>
    </view>

    <div class="mine-content">
      <view class="section-card">
        <view class="section-title">个人中心</view>
        <view class="list">
          <view class="list-item" @tap="handleEnter('task')">
            <view class="item-left">
              <view class="item-icon star">⭐</view>
              <text v-if="userRole === 'INDIVIDUAL'" class="item-text"
                >我的工单</text
              >
              <text v-if="userRole === 'ENTERPRISE'" class="item-text"
                >我的发布</text
              >
            </view>
            <text class="item-arrow">›</text>
          </view>
          <view
            v-if="userRole === 'ENTERPRISE'"
            class="list-item"
            @tap="handleEnter('enterprise')"
          >
            <view class="item-left">
              <view class="item-icon target">🎯</view>
              <text class="item-text">企业信息</text>
            </view>
            <text class="item-arrow">›</text>
          </view>
          <view
            v-if="userRole === 'ENTERPRISE'"
            class="list-item"
            @tap="handleEnter('equipment')"
          >
            <view class="item-left">
              <view class="item-icon device">🧰</view>
              <text class="item-text">设备信息</text>
            </view>
            <text class="item-arrow">›</text>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-title">服务支持</view>
        <view class="list">
          <view class="list-item" @tap="navTo('contact')">
            <view class="item-left">
              <view class="item-icon phone">📞</view>
              <text class="item-text">联系客服</text>
            </view>
            <text class="item-arrow">›</text>
          </view>
          <view class="list-item" @tap="navTo('agreement')">
            <view class="item-left">
              <view class="item-icon policy">📜</view>
              <text class="item-text">服务协议</text>
            </view>
            <text class="item-arrow">›</text>
          </view>
          <view class="list-item" @tap="navTo('privacy')">
            <view class="item-left">
              <view class="item-icon privacy">🔒</view>
              <text class="item-text">隐私政策</text>
            </view>
            <text class="item-arrow">›</text>
          </view>
          <view class="list-item" @tap="navTo('about')">
            <view class="item-left">
              <view class="item-icon info">ℹ️</view>
              <text class="item-text">关于我们</text>
            </view>
            <text class="item-arrow">›</text>
          </view>
        </view>
      </view>

      <view class="app-info-card">
        <view class="app-icon">⚡</view>
        <view class="app-meta">
          <text class="app-name">恰云电力服务</text>
          <text class="app-version">版本 v1.0.0</text>
        </view>
      </view>
    </div>
    <!-- 底部退出登录 -->
    <view class="fixed-logout">
      <button class="btn danger" @tap="handleLogout">退出登录</button>
    </view>
  </view>
</template>

<script>
import { getUserInfo, getCompanyUserInfo } from "@/apis/modules/login.js";
export default {
  data() {
    return {
      user: {
        avatarUrl: "",
        nickname: "",
        jobName: "",
      },
      stats: {
        all: 5,
        pending: 1,
        inProgress: 2,
        completed: 2,
      },
      userRole: uni.getStorageSync("userRole") || "",
    };
  },
  computed: {
    userAvatar() {
      return (this.user && this.user.avatarUrl) || "/static/logo.png";
    },
    userNickname() {
      const s = String(this.user.nickname || "").trim();
      return s || "未登录用户";
    },
  },
  onShow() {
    const token = uni.getStorageSync("token");
    console.log("token====>mine", token);
    if (!token) {
      uni.showToast({ title: "请先登录", icon: "none" });
      setTimeout(() => {
        uni.reLaunch({ url: "/pages/login/index?redirect=mine" });
      }, 400);
    }
    const user = uni.getStorageSync("userInfo") || {};
    console.log("user====>", user);
    if (user) {
      this.user = {
        nickname:
          this.userRole === "ENTERPRISE"
            ? user.contactName
            : user.realName || "",
        company:
          this.userRole === "ENTERPRISE" ? user.enterprise.enterpriseName : "",
        jobName:
          this.userRole === "ENTERPRISE" ? user.contactPosition : user.jobName,
        phone: user.phone,
        avatarUrl:
          this.userRole === "ENTERPRISE"
            ? user.avatarUrl
            : user.wechatInfo.avatarUrl,
      };
    }
    this.getUserInfo();
  },
  methods: {
    getUserInfo() {
      if (this.userRole === "INDIVIDUAL") {
        getUserInfo().then((res) => {
          console.log("个人信息详情", res);
          this.user = {
            avatarUrl: res.wechatInfo.avatarUrl || "",
            nickname: res.realName || "",
            phone: res.phone || "",
            jobName: res.jobName || "",
          };
          uni.setStorageSync("userInfo", res);
        });
      } else {
        getCompanyUserInfo().then((res) => {
          console.log("企业相关信息详情", res);
          this.user = {
            nickname: res.contactName || "",
            company: res.enterprise.enterpriseName,
            jobName: res.contactPosition,
            phone: res.phone,
            avatarUrl: res.avatarUrl,
          };
          uni.setStorageSync("userInfo", res);
        });
      }
    },
    navTo(url) {
      console.log("url====>", url);
      switch (url) {
        // case "contact":
        //   uni.navigateTo({ url: "/pages/login/contact" });
        //   break;
        case "agreement":
          uni.navigateTo({ url: "/pages/login/agreement" });
          break;
        case "privacy":
          uni.navigateTo({ url: "/pages/login/privacy" });
          break;
        // case "about":
        //   uni.navigateTo({ url: "/pages/login/about" });
        //   break;
        default:
          break;
      }
    },
    handleEnter(key) {
      let url = "";
      switch (key) {
        case "task":
          url = "/pages/mine/task";
          break;
        case "equipment":
          url = "/pages/mine/equipment";
          break;
        case "enterprise":
          url = "/pages/login/company";
          break;
        case "userInfo":
          if (this.userRole === "ENTERPRISE") {
            url = "/pages/login/entUserInfo";
          } else {
            url = "/pages/login/userInfo";
          }
          break;
        default:
          url = "/pages/customer/index";
          break;
      }
      if (!url) {
        uni.showToast({ title: "页面不存在", icon: "none" });
        return;
      }
      uni.navigateTo({ url });
    },
    handleLogout() {
      uni.clearStorageSync();
      uni.showToast({ title: "已退出登录", icon: "none" });
      setTimeout(() => {
        uni.reLaunch({ url: "/pages/login/index" });
      }, 400);
    },
  },
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f7f8fa;
  padding: 24rpx 24rpx 160rpx;
  box-sizing: border-box;
  background: #fff;
}

.header {
  height: 160rpx;
  padding: 24px;
  position: relative;
  background: linear-gradient(135deg, #14cccc, #007acc);
  border-radius: 12px;
  box-shadow: 0 -6rpx 24rpx rgba(0, 0, 0, 0.06);
}

.user-info {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  /* padding-top: 20px; */
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  border: 2px solid #fff;
  margin-right: 16px;
}

.avatar .avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar .arrow {
  position: absolute;
  right: -4px;
  bottom: -4px;
  color: #fff;
  font-size: 16px;
}

.info {
  color: #fff;
}

.info .name {
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 4px;
}

.info .phone {
  font-size: 14px;
  opacity: 0.8;
}

.menu {
  position: relative;
  margin-top: -60px;
  padding: 0 16px;
  z-index: 1;
}

.menu .menu-grid {
  display: flex;
  justify-content: space-between;
  background: #fff;
  border-radius: 12px;
  padding: 10px;
}

.menu .menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  cursor: pointer;
}

.menu-item .menu-icon {
  width: 28px;
  height: 28px;
  margin-bottom: 8px;
}

.menu-item .menu-title {
  font-size: 14px;
  color: #333;
}

/* 底部退出登录（保留） */
.fixed-logout {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.94);
  border-top: 2rpx solid #f0f0f0;
  box-shadow: 0 -6rpx 24rpx rgba(0, 0, 0, 0.06);
  z-index: 10;
}
.btn {
  height: 84rpx;
  padding: 0 24rpx;
  border-radius: 12rpx;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn.danger {
  background: linear-gradient(135deg, #ff4d4f, #ff7875);
  color: #fff;
  box-shadow: 0 8rpx 20rpx rgba(255, 77, 79, 0.25);
  border: none;
}

.task-title {
  margin: 24rpx 6rpx 12rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: #2a2a2a;
  display: flex;
  align-items: center;
}
.task-title::before {
  content: "";
  width: 8rpx;
  height: 32rpx;
  border-radius: 8rpx;
  margin-right: 12rpx;
  background: linear-gradient(180deg, #14cccc, #007acc);
  box-shadow: 0 4rpx 10rpx rgba(20, 204, 204, 0.12);
}

.mine-content {
  margin-top: 50rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
.section-card {
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 12rpx 28rpx rgba(0, 0, 0, 0.08);
  overflow: hidden;
}
.section-title {
  font-size: 28rpx;
  color: #666;
  padding: 24rpx;
  background: #f7f9fc;
}
.list {
  background: #fff;
}
.list-item {
  height: 96rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2rpx solid #f0f2f5;
}
.list-item:last-child {
  border-bottom: none;
}
.item-left {
  display: inline-flex;
  align-items: center;
  gap: 16rpx;
}
.item-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  background: #f3f6fa;
  border: 2rpx solid #eef2f6;
}
.item-text {
  font-size: 28rpx;
  color: #333;
}
.item-arrow {
  font-size: 36rpx;
  color: #bbb;
}

.policy-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  color: #666;
  font-size: 26rpx;
  padding: 24rpx 0 8rpx;
}
.policy-link {
  color: #666;
}
.policy-divider {
  color: #ccc;
}

.app-info-card {
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 12rpx 28rpx rgba(0, 0, 0, 0.08);
  padding: 36rpx 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
}
.app-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #14cccc, #007acc);
  color: #fff;
  font-size: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.app-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.app-name {
  font-size: 30rpx;
  color: #222;
  font-weight: 700;
}
.app-version {
  margin-top: 6rpx;
  font-size: 24rpx;
  color: #888;
}
</style>
