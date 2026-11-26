<template>
  <view class="container">
    <view class="card header-card card-elevated">
      <text class="title">请完善您的信息</text>
    </view>

    <view class="card avatar-card card-elevated">
      <button
        class="avatar-block"
        open-type="chooseAvatar"
        @chooseavatar="selectAvatarWx"
      >
        <image
          class="avatar"
          :src="form.avatarUrl || defaultAvatar"
          mode="aspectFill"
        />
        <view class="edit-tip">点击更换头像</view>
      </button>
    </view>

    <view class="card info-card card-elevated">
      <text class="section-title">基础信息</text>

      <view class="form-row">
        <text class="label">联系人 <text class="required">*</text></text>
        <input
          class="input"
          type="text"
          v-model="form.contactName"
          placeholder="请输入联系人姓名"
        />
      </view>

      <view class="form-row">
        <text class="label">职务 <text class="required">*</text></text>
        <input
          class="input"
          type="text"
          v-model="form.contactPosition"
          placeholder="请输入职务"
        />
      </view>

      <view class="form-row">
        <text class="label">联系方式</text>
        <input
          class="input disabled"
          type="text"
          v-model="form.phone"
          placeholder="暂无联系方式"
          disabled
        />
      </view>
    </view>

    <view class="bottom-actions">
      <button class="btn primary" @tap="handleSubmit">保存</button>
    </view>
  </view>
</template>

<script>
import http from "@/apis/index.js";
import { updateCompanyUserInfo } from "@/apis/modules/login.js";

export default {
  data() {
    return {
      defaultAvatar: "/static/avatar.png",
      form: {
        avatarUrl: "",
        contactName: "",
        contactPosition: "",
        phone: "",
      },
    };
  },
  async onLoad() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      try {
        const userInfo = uni.getStorageSync("userInfo");
        console.log("企业个人信息:", userInfo);
        if (userInfo) {
          this.form = {
            avatarUrl: userInfo.avatarUrl || "",
            contactName: userInfo.contactName || "",
            contactPosition: userInfo.contactPosition || "",
            phone: userInfo.phone || "",
          };
        }
      } catch (error) {
        console.error("获取信息失败", error);
      }
    },
    selectAvatarWx(e) {
      const url = e?.detail?.avatarUrl;
      console.log("选择的头像URL:", url);
      if (url) {
        this.form.avatarUrl = url;
      }
    },
    async handleSubmit() {
      if (!this.form.contactName || !this.form.contactName.trim()) {
        uni.showToast({ title: "请填写联系人姓名", icon: "none" });
        return;
      }
      if (!this.form.contactPosition || !this.form.contactPosition.trim()) {
        uni.showToast({ title: "请填写职务", icon: "none" });
        return;
      }

      // 上传头像逻辑：如果头像路径不包含 "qiayun" (假设是本地路径或微信临时路径)，则上传
      if (this.form.avatarUrl && this.form.avatarUrl.indexOf("qiayun") === -1) {
        try {
          uni.showLoading({ title: "上传头像中..." });
          const res = await http.upload(this.form.avatarUrl);
          this.form.avatarUrl = res?.fileUrl || "";
          uni.hideLoading();
        } catch (error) {
          uni.hideLoading();
          uni.showToast({ title: "头像上传失败", icon: "none" });
          console.error("上传失败", error);
          return;
        }
      }

      const payload = {
        avatarUrl: this.form.avatarUrl,
        contactName: this.form.contactName,
        contactPosition: this.form.contactPosition,
      };

      console.log("保存企业个人信息:", payload);
      try {
        await updateCompanyUserInfo(payload);
        uni.showToast({ title: "保存成功", icon: "success" });
        setTimeout(() => {
          const pages = getCurrentPages();
          if (pages && pages.length > 1) {
            uni.navigateBack();
          }
        }, 600);
      } catch (error) {
        console.error(error);
      }
    },
  },
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f7f8fa;
  padding: 24rpx 24rpx 120rpx;
  box-sizing: border-box;
}
.card {
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 12rpx 28rpx rgba(0, 0, 0, 0.08);
  padding: 24rpx;
  margin-bottom: 24rpx;
}
.header-card {
  background: linear-gradient(180deg, #e9f6ff 0%, #d8f0ff 100%);
  color: #0b78d3;
}
.title {
  font-size: 36rpx;
  font-weight: 700;
}
.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #222;
  margin-bottom: 12rpx;
}

/* 头像 */
.avatar-card .avatar-block {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background-color: #fff;
  border: none;
  padding: 0;
  margin: 0;
  line-height: normal;
}
.avatar-card .avatar-block::after {
  border: none;
}
.avatar-card .avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 999rpx;
  background: #f2f4f7;
  border: 2rpx solid #eaeaea;
}
.avatar-card .edit-tip {
  font-size: 26rpx;
  color: #888;
}

/* 表单 */
.form-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 8rpx;
  margin-bottom: 24rpx;
}
.label {
  width: 160rpx;
  font-size: 28rpx;
  color: #555;
}
.input {
  flex: 1;
  height: 72rpx;
  padding: 0 16rpx;
  border: 2rpx solid #eaeaea;
  border-radius: 12rpx;
  font-size: 28rpx;
  background: #fff;
}
.input.disabled {
  background: #f5f5f5;
  color: #999;
}

.bottom-actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 24rpx;
  padding: 0 24rpx;
  box-sizing: border-box;
}
.btn.primary {
  width: 100%;
  height: 84rpx;
  border-radius: 12rpx;
  background: linear-gradient(135deg, #14cccc, #0aa6db);
  color: #fff;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
