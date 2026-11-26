<template>
  <view class="container">
    <view class="guide-card">
      <view class="icon-wrap">
        <text class="icon">📝</text>
      </view>
      <text class="title">{{ title }}</text>
      <text class="subtitle">{{ subtitle }}</text>
    </view>

    <view class="section-title">请按顺序完善以下信息</view>
    <view
      v-if="userRole === 'INDIVIDUAL'"
      class="info-step-card"
      :class="{ completed: isUserInfoComplete, pending: !isUserInfoComplete }"
    >
      <!-- completed -->
      <view class="step-header">
        <view class="step-number">1</view>
        <view class="step-content">
          <view class="step-title">个人基本信息</view>
          <view class="step-desc">姓名、手机号、技能信息</view>
        </view>
        <!-- <view class="step-status">✓</view> -->
        <div class="step-status">{{ isUserInfoComplete ? "✓" : "!" }}</div>
      </view>
      <view class="step-details">
        <view class="detail-item">
          <span class="label">姓名:</span>
          <span class="value">{{ userInfo.realName || "" }}</span>
        </view>
        <view class="detail-item">
          <span class="label">手机:</span>
          <span class="value">{{ userInfo.phone || "" }}</span>
        </view>
        <view v-if="userInfo.skillStr" class="detail-item">
          <span class="label">技能:</span>
          <span class="value">{{ userInfo.skillStr || "" }}</span>
        </view>
      </view>
      <view class="step-action">
        <button class="btn btn-outline" @click="chooseavatar">修改信息</button>
      </view>
    </view>
    <view
      v-if="userRole === 'ENTERPRISE'"
      class="info-step-card"
      :class="{
        completed: isEntUserInfoComplete,
        pending: !isEntUserInfoComplete,
      }"
    >
      <!-- completed -->
      <view class="step-header">
        <view class="step-number">1</view>
        <view class="step-content">
          <view class="step-title">个人基本信息</view>
          <view class="step-desc">联系人、联系电话、职位信息</view>
        </view>
        <!-- <view class="step-status">✓</view> -->
        <div class="step-status">{{ isEntUserInfoComplete ? "✓" : "!" }}</div>
      </view>
      <view class="step-details">
        <view v-if="userInfo.contactName" class="detail-item">
          <span class="label">联系人:</span>
          <span class="value">{{ userInfo.contactName || "" }}</span>
        </view>
        <view class="detail-item">
          <span class="label">联系电话:</span>
          <span class="value">{{ userInfo.phone || "" }}</span>
        </view>
        <view v-if="userInfo.contactPosition" class="detail-item">
          <span class="label">职位:</span>
          <span class="value">{{ userInfo.contactPosition || "" }}</span>
        </view>
      </view>
      <view class="step-action">
        <button class="btn btn-outline" @click="toEntUserInfo">修改信息</button>
      </view>
    </view>
    <div
      v-if="userRole === 'ENTERPRISE'"
      class="info-step-card"
      :class="{
        completed: relatedEnterpriseInfo,
        pending: !relatedEnterpriseInfo,
      }"
    >
      <div class="step-header">
        <div class="step-number">2</div>
        <div class="step-content">
          <div class="step-title">企业基础信息</div>
          <div class="step-desc">企业名称、地址、类型等信息</div>
        </div>
        <div class="step-status">{{ relatedEnterpriseInfo ? "✓" : "!" }}</div>
      </div>
      <view v-if="relatedEnterpriseInfo" class="step-details">
        <view class="detail-item">
          <span class="label">企业名称:</span>
          <span class="value">{{
            userInfo.enterprise.enterpriseName || ""
          }}</span>
        </view>
        <view class="detail-item">
          <span class="label">企业地址:</span>
          <span class="value">{{
            userInfo.enterprise.enterpriseAddress || ""
          }}</span>
        </view>
        <view v-if="userInfo.enterprise.enterpriseType" class="detail-item">
          <span class="label">企业类型:</span>
          <span class="value">{{
            enterpriseTypeMap[userInfo.enterprise.enterpriseType] || ""
          }}</span>
        </view>
      </view>
      <div class="step-action">
        <button class="btn btn-primary" @click="toCompany">
          {{ relatedEnterpriseInfo ? "编辑企业" : "立即填写" }}
        </button>
      </div>
    </div>

    <div
      v-if="userRole === 'ENTERPRISE'"
      class="info-step-card"
      :class="{
        completed: equipmentList.length > 0,
        pending: equipmentList.length === 0,
      }"
    >
      <div class="step-header">
        <div class="step-number">3</div>
        <div class="step-content">
          <div class="step-title">电力设备信息</div>
          <div class="step-desc">设备名称、电压等级、容量、配置等</div>
        </div>
        <div class="step-status">
          {{ equipmentList.length > 0 ? "✓" : "!" }}
        </div>
      </div>
      <div class="step-action">
        <button class="btn btn-outline" @click="toEquipment">
          {{ equipmentList.length > 0 ? "新增设备" : "立即填写" }}
        </button>
      </div>
    </div>

    <div class="section-title">信息完善后您将享受</div>
    <div class="service-preview">
      <div class="preview-item">
        <div class="preview-icon">🔍</div>
        <div class="preview-content">
          <div class="preview-title">专属设备台账</div>
          <div class="preview-desc">个性化设备管理和维保计划</div>
        </div>
      </div>
      <div class="preview-item">
        <div class="preview-icon">🔔</div>
        <div class="preview-content">
          <div class="preview-title">智能提醒服务</div>
          <div class="preview-desc">设备维保周期和故障预警</div>
        </div>
      </div>
      <div class="preview-item">
        <div class="preview-icon">🎆</div>
        <div class="preview-content">
          <div class="preview-title">优惠服务享受</div>
          <div class="preview-desc">会员优惠和专业技术支持</div>
        </div>
      </div>
    </div>
    <div class="btn-wrap">
      <button
        class="complete-guide-btn"
        :class="{
          disabled:
            (!isUserInfoComplete && userRole === 'INDIVIDUAL') ||
            (!relatedEnterpriseInfo && userRole === 'ENTERPRISE'),
        }"
        @click="toCustomerCenter"
      >
        完成信息填写，进入客户中心
      </button>
    </div>
  </view>
</template>

<script>
import { getUserInfo, getCompanyUserInfo } from "@/apis/modules/login.js";
import { getEquipmentList } from "@/apis/modules/equipment.js";
export default {
  data() {
    return {
      title: "信息完善引导",
      subtitle: "为您提供更精准的电力服务，请完善以下信息",
      userInfo: {},
      enterpriseTypeMap: {
        STATE_OWNED: "国有企业",
        PRIVATE: "民营企业",
        FOREIGN: "外资企业",
        JOINT_VENTURE: "合资企业",
      },
      equipmentList: [],
      userRole: uni.getStorageSync("userRole"),
    };
  },
  computed: {
    relatedEnterpriseInfo() {
      return !!this.userInfo.enterprise;
    },
    isUserInfoComplete() {
      return (
        this.userInfo.realName && this.userInfo.phone && this.userInfo.skillStr
      );
    },
    isEntUserInfoComplete() {
      return (
        this.userInfo.contactName &&
        this.userInfo.phone &&
        this.userInfo.contactPosition
      );
    },
  },
  onShow() {
    this.checkUserInfo();
    if (this.userRole === "ENTERPRISE") {
      this.getEquipmentList();
    }
  },
  methods: {
    async getEquipmentList() {
      const res = await getEquipmentList({
        page: 1,
        pageSize: 1,
      });
      console.log("电力设备列表", res);
      this.equipmentList = res.items || [];
    },
    checkUserInfo() {
      if (this.userRole === "INDIVIDUAL") {
        getUserInfo().then((res) => {
          console.log("个人信息详情", res);
          res.skillStr = Array.isArray(res.skills) ? res.skills.join("、") : "";
          this.userInfo = res;
          uni.setStorageSync("userInfo", res);
        });
      } else {
        getCompanyUserInfo().then((res) => {
          console.log("企业相关信息详情", res);
          this.userInfo = res;
          uni.setStorageSync("userInfo", res);
        });
      }
    },
    chooseavatar() {
      uni.navigateTo({
        url: "/pages/login/userInfo",
      });
    },
    toEntUserInfo() {
      uni.navigateTo({
        url: "/pages/login/entUserInfo",
      });
    },
    toCompany() {
      uni.navigateTo({
        url: "/pages/login/company",
      });
    },
    toEquipment() {
      if (!this.relatedEnterpriseInfo) {
        uni.showToast({
          title: "请先完善企业信息",
          icon: "none",
        });
        return;
      }
      uni.navigateTo({
        url: "/pages/mine/addEquipment",
      });
    },
    toCustomerCenter() {
      if (
        (!this.isUserInfoComplete && this.userRole === "INDIVIDUAL") ||
        (!this.relatedEnterpriseInfo && this.userRole === "ENTERPRISE")
      ) {
        uni.showToast({
          title:
            this.userRole === "INDIVIDUAL"
              ? "请先完善个人信息"
              : "请先完善企业信息",
          icon: "none",
        });
        return;
      }
      /*
      if (this.equipmentList.length === 0) {
        uni.showToast({
          title: "请先完善电力设备信息",
          icon: "none",
        });
        return;
      }*/
      uni.switchTab({
        url: "/pages/customer/index",
      });
    },
  },
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f7f8fa;
  padding: 32rpx;
  box-sizing: border-box;
}

/* 顶部标题卡片 */
.guide-card {
  padding: 48rpx 24rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #e6f7ff, #bae7ff);
  box-shadow: 0 12rpx 28rpx rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18rpx;
  margin-bottom: 24rpx;
}
.icon-wrap {
  width: 96rpx;
  height: 96rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(255, 255, 255, 0.4) inset;
}
.icon {
  font-size: 56rpx;
  line-height: 1;
}
.title {
  font-size: 40rpx;
  font-weight: 800;
  color: #0977d3;
  letter-spacing: 1rpx;
}
.subtitle {
  margin-top: 4rpx;
  font-size: 28rpx;
  color: #586174;
  text-align: center;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 20px 0 12px;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: "";
  width: 4px;
  height: 16px;
  background: #14cccc;
  border-radius: 2px;
  margin-right: 8px;
}

.info-step-card {
  background: white;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #f5f5f5;
}

.info-step-card.completed {
  border-left-color: #52c41a;
}

.info-step-card.pending {
  border-left-color: #ffa500;
}

.step-header {
  display: flex;
  align-items: center;
  padding: 16px;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f5f5f5;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 12px;
}

.completed .step-number {
  background: #52c41a;
  color: white;
}

.pending .step-number {
  background: #ffa500;
  color: white;
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.step-desc {
  font-size: 12px;
  color: #666;
}

.step-status {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.completed .step-status {
  background: #f6ffed;
  color: #52c41a;
}

.pending .step-status {
  background: #fff7e6;
  color: #ffa500;
}

.step-details {
  padding: 0 16px 0 60px;
  border-top: 1px solid #f0f0f0;
  background: #f9f9f9;
  margin-bottom: 24rpx;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
}

.detail-item .label {
  width: 130rpx;
  color: #666;
}

.detail-item .value {
  color: #333;
  font-weight: 500;
}

.step-action {
  padding: 0 16px 16px;
}

.btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 服务预览样式 */
.service-preview {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.preview-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.preview-item:last-child {
  border-bottom: none;
}

.preview-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #14cccc, #007acc);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-right: 12px;
}

.preview-content {
  flex: 1;
}

.preview-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.preview-desc {
  font-size: 12px;
  color: #666;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 20px 0 12px;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: "";
  width: 4px;
  height: 16px;
  background: #14cccc;
  border-radius: 2px;
  margin-right: 8px;
}

.btn-wrap {
  display: flex;
  justify-content: center;
}
/* 完成按钮 */
.complete-guide-btn {
  display: inline-block;
  background: #14cccc;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 20px auto;
}

.complete-guide-btn:hover {
  background: #007acc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(20, 204, 204, 0.3);
}

.complete-guide-btn.disabled {
  background: #d9d9d9;
  color: #999;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn {
  display: inline-block;
  padding: 16rpx 32rpx;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  text-align: center;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-outline {
  background: transparent;
  color: #14cccc;
  border: 1px solid #14cccc;
}

.btn-primary {
  background: #14cccc;
  color: white;
}
</style>
