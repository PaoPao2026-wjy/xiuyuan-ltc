<template>
  <view class="container">
    <view class="card header-card card-elevated">
      <text class="title">请完善您的信息</text>
    </view>

    <view class="card avatar-card card-elevated">
      <!-- <text class="section-title">微信头像</text> -->
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
        <text class="label">真实姓名<text class="required">*</text></text>
        <input
          class="input"
          type="text"
          v-model="form.realName"
          placeholder="请输入真实姓名"
        />
      </view>

      <view  class="form-row">
        <text class="label">手机号</text>
        <input
          class="input"
          type="number"
          maxlength="11"
          v-model="form.phone"
          disabled
          placeholder="请输入11位手机号"
        />
      </view>

      <view class="form-row">
        <text class="label">身份证号<text class="required">*</text></text>
        <input
          class="input"
          type="idcard"
          maxlength="18"
          v-model="form.idCardNo"
          placeholder="请输入身份证号"
        />
      </view>

      <view class="form-column">
        <text class="label">身份证照片<text class="required">*</text></text>
        <view class="idcard-upload-row">
          <view
            class="upload-box"
            @tap="uploadImage('idCardFrontPhoto')"
          >
            <image
              v-if="form.idCardFrontPhoto"
              class="uploaded-img"
              :src="form.idCardFrontPhoto"
              mode="aspectFit"
            />
            <view v-else class="upload-placeholder">
              <text class="plus-icon">+</text>
              <text class="tip-text">人像面</text>
            </view>
          </view>
          <view
            class="upload-box"
            @tap="uploadImage('idCardBackPhoto')"
          >
            <image
              v-if="form.idCardBackPhoto"
              class="uploaded-img"
              :src="form.idCardBackPhoto"
              mode="aspectFit"
            />
            <view v-else class="upload-placeholder">
              <text class="plus-icon">+</text>
              <text class="tip-text">国徽面</text>
            </view>
          </view>
        </view>
      </view>

      <view class="form-column">
        <text class="label">从业证件 <text class="sub-label">（最多9张）</text></text>
        <view class="certs-grid">
          <view
            class="cert-item"
            v-for="(img, index) in form.certificates"
            :key="index"
          >
            <image class="cert-img" :src="img" mode="aspectFill" @tap="previewImage(img)" />
            <view class="delete-btn" @tap.stop="removeCertificate(index)">×</view>
          </view>
          <view
            class="upload-box small"
            v-if="form.certificates.length < 9"
            @tap="uploadCertificates"
          >
            <text class="plus-icon">+</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 从业资历 -->
    <view class="card work-card card-elevated">
      <view class="card-header-row">
        <text class="section-title">从业资历</text>
        <view class="add-link" @tap="addWorkExperience">
          <text class="plus">+</text> 新增
        </view>
      </view>

      <view
        v-for="(item, index) in form.workExperience"
        :key="index"
        class="work-item"
      >
        <view class="work-item-header">
          <text class="work-index">经历 {{ index + 1 }}</text>
          <view class="delete-btn-text" @tap="removeWorkExperience(index)">删除</view>
        </view>

        <view class="form-row">
          <text class="label">公司名称</text>
          <input
            class="input"
            type="text"
            v-model="item.companyName"
            placeholder="请输入公司名称"
          />
        </view>

        <view class="form-row">
          <text class="label">入职时间</text>
          <picker
            mode="date"
            :value="item.startTime"
            @change="(e) => onWorkDateChange(e, index, 'startTime')"
          >
            <view class="picker-input">
              {{ item.startTime || "请选择入职时间" }}
            </view>
          </picker>
        </view>

        <view class="form-row">
          <text class="label">离职时间</text>
          <view class="flex-1 flex-row center-align gap-8">
             <picker
              class="flex-1"
              mode="date"
              :value="item.endTime || ''"
              @change="(e) => onWorkDateChange(e, index, 'endTime')"
            >
              <view class="picker-input">
                {{ item.endTime || "至今" }}
              </view>
            </picker>
            <view v-if="item.endTime" class="clear-date" @tap="clearWorkEndDate(index)">
               设为至今
            </view>
          </view>
        </view>

        <view class="form-column">
          <text class="label">工作描述</text>
          <textarea
            class="textarea"
            v-model="item.jobDesc"
            placeholder="请输入工作描述"
            auto-height
          />
        </view>
      </view>
      
      <view v-if="form.workExperience.length === 0" class="empty-tip">
        暂无从业资历，请点击右上角新增
      </view>
    </view>

    <view class="card skills-card card-elevated">
      <view class="skills-header">
        <text class="section-title">技能</text>
        <text class="tips">可多选</text>
      </view>

      <checkbox-group @change="handleSkillChange">
        <view class="skill-grid">
          <label
            v-for="(opt, i) in skillOptions"
            :key="i"
            class="skill-item"
            :class="isChecked(opt) ? 'checked' : ''"
          >
            <checkbox
              class="skill-checkbox"
              :value="opt"
              :checked="isChecked(opt)"
            />
            <text class="skill-text">{{ opt }}</text>
          </label>
        </view>
      </checkbox-group>

      <view class="selected-wrap" v-if="form.skills.length">
        <text class="selected-title">已选择：</text>
        <view class="selected-chips">
          <text v-for="(s, i) in form.skills" :key="i" class="chip">{{
            s
          }}</text>
        </view>
      </view>
    </view>

    <view class="bottom-actions">
      <button class="btn primary" @tap="handleSubmit">保存</button>
    </view>
  </view>
</template>

<script>
import http from "@/apis/index.js";
import { updateUserInfo } from "@/apis/modules/login.js";
export default {
  data() {
    return {
      defaultAvatar: "/static/avatar.png",
      form: {
        avatarUrl: "",
        realName: "",
        phone: "",
        idCardNo: "",
        idCardFrontPhoto: "",
        idCardBackPhoto: "",
        certificates: [],
        workExperience: [],
        skills: [],
      },
      skillOptions: [
        "电路安装与维修",
        "电气设备调试",
        "PLC编程",
        "电机控制",
        "高低压操作",
        "电气安全",
        "自动化控制",
        "仪表测量",
        "配电系统维护",
        "电气故障诊断",
      ],
      userRole: uni.getStorageSync("userRole"),
    };
  },
  onLoad() {
    const userInfo = uni.getStorageSync("userInfo");
    if (userInfo) {
      this.form = {
        ...this.form,
        ...userInfo,
        avatarUrl: (userInfo.wechatInfo && userInfo.wechatInfo.avatarUrl) || "",
        idCardNo: userInfo.idCardNo || "",
        idCardFrontPhoto: userInfo.idCardFrontPhoto || "",
        idCardBackPhoto: userInfo.idCardBackPhoto || "",
        certificates: userInfo.certificates || [],
        workExperience: userInfo.workExperience || [],
      };
    }

  },
  methods: {
    selectAvatarWx(e) {
      const url = e?.detail?.avatarUrl;
      console.log("选择的头像URL:", url);
      if (url) {
        this.form.avatarUrl = url;
      } else {
        uni.showToast({ title: "选择头像失败", icon: "none" });
      }
    },
    handleSkillChange(e) {
      const values = Array.isArray(e?.detail?.value) ? e.detail.value : [];
      this.form.skills = values;
    },
    isChecked(opt) {
      return this.form.skills.includes(opt);
    },
    // 单图上传
    uploadImage(key) {
      uni.chooseImage({
        count: 1,
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0];
          try {
            uni.showLoading({ title: "上传中..." });
            const uploadRes = await http.upload(tempFilePath);
            this.form[key] = uploadRes?.fileUrl || "";
            uni.hideLoading();
          } catch (error) {
            uni.hideLoading();
            console.error("上传失败", error);
            uni.showToast({ title: "上传失败", icon: "none" });
          }
        },
      });
    },
    // 多图上传
    uploadCertificates() {
      const remainCount = 9 - this.form.certificates.length;
      if (remainCount <= 0) return;
      
      uni.chooseImage({
        count: remainCount,
        success: async (res) => {
          const tempFilePaths = res.tempFilePaths;
          uni.showLoading({ title: "上传中..." });
          try {
            // 并发上传
            const uploadPromises = tempFilePaths.map(path => http.upload(path));
            const results = await Promise.all(uploadPromises);
            
            results.forEach(r => {
              if (r?.fileUrl) {
                this.form.certificates.push(r.fileUrl);
              }
            });
            uni.hideLoading();
          } catch (error) {
            uni.hideLoading();
            console.error("上传失败", error);
            uni.showToast({ title: "部分图片上传失败", icon: "none" });
          }
        },
      });
    },
    removeCertificate(index) {
      this.form.certificates.splice(index, 1);
    },
    previewImage(url) {
      uni.previewImage({
        urls: this.form.certificates,
        current: url
      });
    },
    // 从业资历
    addWorkExperience() {
      this.form.workExperience.push({
        companyName: "",
        startTime: "",
        endTime: null,
        jobDesc: "",
      });
    },
    removeWorkExperience(index) {
      uni.showModal({
        title: "提示",
        content: "确定删除该条从业资历吗？",
        success: (res) => {
          if (res.confirm) {
            this.form.workExperience.splice(index, 1);
          }
        },
      });
    },
    onWorkDateChange(e, index, key) {
      this.form.workExperience[index][key] = e.detail.value;
    },
    clearWorkEndDate(index) {
      this.form.workExperience[index].endTime = null;
    },
    async handleSubmit() {
      if (this.form.avatarUrl && this.form.avatarUrl.indexOf("qiayun") === -1) {
        const res = await http.upload(this.form.avatarUrl);
        this.form.avatarUrl = res?.fileUrl || "";
      }
      // 基础校验
      if(!this.form.idCardNo.trim()) {
        uni.showToast({ title: "请填写身份证号", icon: "none" });
        return;
      }
      if(!this.form.idCardFrontPhoto.trim()) {
        uni.showToast({ title: "请上传身份证正面照片", icon: "none" });
        return;
      }
      if(!this.form.idCardBackPhoto.trim()) {
        uni.showToast({ title: "请上传身份证反面照片", icon: "none" });
        return;
      }
      if (!this.form.realName.trim()) {
        uni.showToast({ title: "请填写真实姓名", icon: "none" });
        return;
      }
      const phone = this.form.phone.trim();
      if (!phone) {
        uni.showToast({ title: "请填写手机号", icon: "none" });
        return;
      }
      const payload = {
        realName: this.form.realName,
        phone,
        idCardNo: this.form.idCardNo,
        idCardFrontPhoto: this.form.idCardFrontPhoto,
        idCardBackPhoto: this.form.idCardBackPhoto,
        certificates: this.form.certificates,
        workExperience: this.form.workExperience,
        skills: this.form.skills,
        avatarUrl: this.form.avatarUrl,
      };
      console.log("保存用户信息:", payload);
      await updateUserInfo(payload);
      uni.showToast({ title: "保存成功", icon: "success" });
      // 保存成功后可返回或跳转
      setTimeout(() => {
        const pages = getCurrentPages();
        if (pages && pages.length > 1) {
          uni.navigateBack();
        }
      }, 600);
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
.subtitle {
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #586174;
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

.avatar-block:after {
  display: none;
}

/* 表单 */
.form-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 8rpx;
}
.label {
  min-width: 180rpx;
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

.form-column {
  margin-top: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.sub-label {
  font-size: 24rpx;
  color: #999;
  font-weight: normal;
}
.idcard-upload-row {
  display: flex;
  gap: 24rpx;
}
.upload-box {
  flex: 1;
  height: 180rpx;
  border: 2rpx dashed #ccc;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  position: relative;
  overflow: hidden;
}
.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.plus-icon {
  font-size: 48rpx;
  color: #ccc;
  line-height: 1;
}
.tip-text {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}
.uploaded-img {
  width: 100%;
  height: 100%;
}

/* 从业证件 */
.certs-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.cert-item {
  width: 160rpx;
  height: 160rpx;
  position: relative;
  border-radius: 12rpx;
  overflow: hidden;
  border: 2rpx solid #eee;
}
.cert-img {
  width: 100%;
  height: 100%;
}
.delete-btn {
  position: absolute;
  top: 0;
  right: 0;
  width: 40rpx;
  height: 40rpx;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom-left-radius: 12rpx;
  font-size: 32rpx;
  line-height: 1;
}
.upload-box.small {
  width: 160rpx;
  height: 160rpx;
  flex: none;
}

/* 技能 */
.skills-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.tips {
  font-size: 24rpx;
  color: #888;
}
.skill-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14rpx;
  margin-top: 12rpx;
}
.skill-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx;
  border: 2rpx solid #eaeaea;
  border-radius: 12rpx;
  background: #fafafa;
}
.skill-item.checked {
  border-color: #14cccc;
  background: rgba(20, 204, 204, 0.08);
}
.skill-checkbox {
  transform: scale(0.9);
}
.skill-text {
  font-size: 28rpx;
  color: #333;
}

/* 已选展示 */
.selected-wrap {
  margin-top: 12rpx;
}
.selected-title {
  font-size: 26rpx;
  color: #888;
}
.selected-chips {
  margin-top: 8rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.chip {
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: #f2f7f9;
  color: #0b78d3;
  border: 2rpx solid #e3eef5;
  font-size: 24rpx;
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
}

/* 从业资历 */
.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}
.add-link {
  font-size: 28rpx;
  color: #0b78d3;
  display: flex;
  align-items: center;
  gap: 4rpx;
}
.plus {
  font-size: 32rpx;
  font-weight: bold;
}
.work-item {
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 24rpx;
  border: 2rpx solid #eee;
}
.work-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
  padding-bottom: 12rpx;
  border-bottom: 2rpx dashed #ddd;
}
.work-index {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}
.delete-btn-text {
  font-size: 26rpx;
  color: #ff4d4f;
}
.picker-input {
  flex: 1;
  height: 72rpx;
  line-height: 72rpx;
  padding: 0 16rpx;
  border: 2rpx solid #eaeaea;
  border-radius: 12rpx;
  font-size: 28rpx;
  background: #fff;
  color: #333;
}
.textarea {
  width: 100%;
  min-height: 120rpx;
  padding: 16rpx;
  border: 2rpx solid #eaeaea;
  border-radius: 12rpx;
  font-size: 28rpx;
  background: #fff;
  box-sizing: border-box;
}
.empty-tip {
  text-align: center;
  color: #999;
  font-size: 26rpx;
  padding: 40rpx 0;
}
.flex-1 {
  flex: 1;
}
.flex-row {
  display: flex;
  flex-direction: row;
}
.center-align {
  align-items: center;
}
.gap-8 {
  gap: 16rpx;
}
.clear-date {
  font-size: 24rpx;
  color: #0b78d3;
  white-space: nowrap;
}
</style>
