<template>
  <view class="container">
    <view v-if="processingStatus === 'NOT_STARTED'" class="center-content">
      <view class="card">
        <view class="form-item">
          <text class="label">预计到达时间</text>
          <view class="picker-row">
            <picker
              mode="date"
              :value="date"
              @change="onDateChange"
              class="picker-flex"
            >
              <view class="picker-box">
                <text class="picker-value">{{ date || "选择日期" }}</text>
                <text class="picker-icon">▼</text>
              </view>
            </picker>
            <picker
              mode="time"
              :value="time"
              @change="onTimeChange"
              class="picker-flex"
            >
              <view class="picker-box">
                <text class="picker-value">{{ time || "选择时间" }}</text>
                <text class="picker-icon">▼</text>
              </view>
            </picker>
          </view>
        </view>

        <view class="form-item">
          <text class="label">备注</text>
          <textarea
            v-model="remark"
            class="textarea"
            placeholder="请输入备注"
            auto-height
          />
        </view>

        <button class="submit-btn" @tap="handleSubmit">提交</button>
      </view>
    </view>
    <view
      v-else-if="processingStatus === 'ARRIVAL_NOTIFIED'"
      class="center-content column-layout"
    >
      <view class="depart-btn-wrapper" @tap="handleDepart">
        <view class="ripple"></view>
        <view class="depart-btn">
          <text>已出发</text>
        </view>
      </view>
      <view class="remark-card">
        <text class="label">备注</text>
        <view class="textarea-wrapper">
          <textarea
            v-model="remark"
            class="textarea-custom"
            placeholder="请输入备注"
            placeholder-class="placeholder"
            auto-height
            :maxlength="200"
          />
        </view>
      </view>
    </view>
    <view
      v-else-if="processingStatus === 'DEPARTED'"
      class="center-content column-layout"
    >
      <view class="time-card">
        <text class="time-label">预定到达时间</text>
        <text class="time-value">{{ formatTime(estimatedArrivalTime) }}</text>
      </view>
      <view class="depart-btn-wrapper" @tap="handleArrive">
        <view class="ripple"></view>
        <view class="depart-btn">
          <text>已到达</text>
        </view>
      </view>
      <view class="remark-card">
        <text class="label">备注</text>
        <view class="textarea-wrapper">
          <textarea
            v-model="remark"
            class="textarea-custom"
            placeholder="请输入备注"
            placeholder-class="placeholder"
            auto-height
            :maxlength="200"
          />
        </view>
      </view>
    </view>
    <view v-else-if="processingStatus === 'ARRIVED'" class="center-content">
      <view class="card self-inspect-card">
        <view class="header-row">
          <view class="title-wrapper">
            <text class="section-title">完成自检</text>
            <text class="section-desc">请拍摄现场照片并填写备注</text>
          </view>
        </view>

        <view class="form-item">
          <view class="label-row">
            <text class="label">自检照片<text class="required">*</text></text>
            <text class="limit-text">{{ selfInspectionPhotos.length }}/9</text>
          </view>
          <view class="upload-grid">
            <view
              v-for="(img, index) in selfInspectionPhotos"
              :key="index"
              class="upload-item"
              @tap="handlePreviewImage(index)"
            >
              <image :src="img" mode="aspectFill" class="upload-img" />
              <view class="remove-btn" @tap.stop="handleRemoveImage(index)">
                <text class="remove-text">×</text>
              </view>
            </view>
            <view
              v-if="selfInspectionPhotos.length < 9"
              class="upload-add"
              @tap="handleChooseImages"
            >
              <text class="add-symbol">+</text>
              <text class="add-text">上传</text>
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="label">备注</text>
          <view class="textarea-wrapper">
            <textarea
              v-model="remark"
              class="textarea-custom"
              placeholder="请输入备注"
              placeholder-class="placeholder"
              auto-height
              :maxlength="200"
            />
          </view>
        </view>

        <button class="submit-btn" @tap="handleSelfInspect">完成自检</button>
      </view>
    </view>
    <view v-else-if="loading" class="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script>
import http from "@/apis/index.js";
import {
  getTaskProcessingDetail,
  updateTaskExecutionStatus,
} from "@/apis/modules/task.js";

export default {
  data() {
    return {
      workOrderId: "",
      processingStatus: "",
      estimatedArrivalTime: "",
      loading: false,
      date: "",
      time: "",
      remark: "",
      selfInspectionPhotos: [],
    };
  },
  onLoad(options) {
    this.workOrderId = options.id;
    this.initTime();
    if (this.workOrderId) {
      this.fetchDetail();
    } else {
      uni.showToast({ title: "参数错误", icon: "none" });
    }
  },
  methods: {
    initTime() {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const d = String(now.getDate()).padStart(2, "0");
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      this.date = `${y}-${m}-${d}`;
      this.time = `${hh}:${mm}`;
    },
    async fetchDetail() {
      this.loading = true;
      try {
        const data = await getTaskProcessingDetail(this.workOrderId);
        this.processingStatus = data.processingStatus;
        this.estimatedArrivalTime = data.estimatedArrivalTime;
      } catch (e) {
        console.error(e);
        uni.showToast({ title: "获取详情失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    onDateChange(e) {
      this.date = e.detail.value;
    },
    onTimeChange(e) {
      this.time = e.detail.value;
    },
    formatTime(dateTime) {
      if (!dateTime) return "-";
      const d = new Date(dateTime);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      return `${y}-${m}-${day} ${hh}:${mm}`;
    },
    async handleSubmit() {
      if (!this.date || !this.time) {
        return uni.showToast({ title: "请选择时间", icon: "none" });
      }

      // Combine date and time to construct UTC string
      const dateTimeStr = `${this.date}T${this.time}:00`;
      // Create date object (treats string as local time)
      const localDate = new Date(dateTimeStr);
      // Convert to UTC ISO string
      const estimatedArrivalTime = localDate.toISOString();

      const params = {
        workOrderId: +this.workOrderId,
        estimatedArrivalTime,
        arrivalNotifiedRemark: this.remark,
        processingStatus: "ARRIVAL_NOTIFIED",
      };

      try {
        await updateTaskExecutionStatus(params);
        uni.showToast({ title: "提交成功", icon: "success" });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      } catch (e) {
        console.error(e);
        uni.showToast({ title: "提交失败", icon: "none" });
      }
    },
    async handleDepart() {
      const params = {
        workOrderId: +this.workOrderId,
        processingStatus: "DEPARTED",
        departedRemark: this.remark,
      };
      try {
        await updateTaskExecutionStatus(params);
        uni.showToast({ title: "状态更新成功", icon: "success" });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      } catch (e) {
        console.error(e);
        uni.showToast({ title: "更新失败", icon: "none" });
      }
    },
    async handleArrive() {
      const params = {
        workOrderId: +this.workOrderId,
        processingStatus: "ARRIVED",
        arrivedRemark: this.remark,
      };
      try {
        await updateTaskExecutionStatus(params);
        uni.showToast({ title: "状态更新成功", icon: "success" });
        // setTimeout(() => {
        //   uni.navigateBack();
        // }, 1500);
        this.remark = "";
        this.fetchDetail();
      } catch (e) {
        console.error(e);
        uni.showToast({ title: "更新失败", icon: "none" });
      }
    },
    handleChooseImages() {
      if (this.selfInspectionPhotos.length >= 9) return;
      uni.chooseImage({
        count: 9 - this.selfInspectionPhotos.length,
        success: async (res) => {
          const tempFilePaths = res.tempFilePaths;
          uni.showLoading({ title: "上传中..." });
          try {
            const uploadPromises = tempFilePaths.map((path) =>
              http.upload(path)
            );
            const results = await Promise.all(uploadPromises);
            results.forEach((r) => {
              if (r?.fileUrl) {
                this.selfInspectionPhotos.push(r.fileUrl);
              }
            });
          } catch (error) {
            console.error(error);
            uni.showToast({ title: "上传失败", icon: "none" });
          } finally {
            uni.hideLoading();
          }
        },
      });
    },
    handleRemoveImage(index) {
      this.selfInspectionPhotos.splice(index, 1);
    },
    handlePreviewImage(index) {
      uni.previewImage({
        current: this.selfInspectionPhotos[index],
        urls: this.selfInspectionPhotos,
      });
    },
    async handleSelfInspect() {
      if (this.selfInspectionPhotos.length === 0)
        return uni.showToast({ title: "请上传自检照片", icon: "none" });
      const params = {
        workOrderId: +this.workOrderId,
        processingStatus: "SELF_INSPECTED",
        selfInspectionPhotos: this.selfInspectionPhotos,
        selfInspectedRemark: this.remark,
      };
      try {
        await updateTaskExecutionStatus(params);
        uni.showToast({ title: "自检完成", icon: "success" });
        setTimeout(() => {
          // uni.navigateBack();
          uni.redirectTo({
            url: `/pages/task/doneTask?id=${this.workOrderId}`,
          });
        }, 1500);
      } catch (e) {
        console.error(e);
        uni.showToast({ title: "提交失败", icon: "none" });
      }
    },
  },
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}
.center-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx;
}
.card {
  width: 100%;
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}
.form-item {
  margin-bottom: 30rpx;
}
.label {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 16rpx;
}
.picker-row {
  display: flex;
  gap: 24rpx;
}
.picker-flex {
  flex: 1;
}
.picker-box {
  background: #f7f8fa;
  padding: 24rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2rpx solid transparent;
  transition: all 0.3s;
}
.picker-box:active {
  background: #eef2f7;
  border-color: #14cccc;
}
.picker-value {
  flex: 1;
  text-align: center;
}
.picker-icon {
  color: #999;
  font-size: 24rpx;
  margin-left: 8rpx;
}
.textarea {
  width: 100%;
  background: #f5f7fa;
  padding: 20rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  min-height: 160rpx;
  box-sizing: border-box;
}
.submit-btn {
  background: #14cccc;
  color: #fff;
  border-radius: 40rpx;
  margin-top: 40rpx;
  font-size: 32rpx;
  font-weight: bold;
}
.column-layout {
  flex-direction: column;
  gap: 60rpx;
}
.time-card {
  background: #fff;
  padding: 30rpx 50rpx;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}
.time-label {
  font-size: 26rpx;
  color: #888;
  margin-bottom: 12rpx;
}
.time-value {
  font-size: 36rpx;
  color: #333;
  font-weight: bold;
}
.remark-card {
  width: 90%;
  background: #fff;
  padding: 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}
.textarea-wrapper {
  background: #f7f8fa;
  border-radius: 12rpx;
  padding: 20rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;
}
.textarea-custom {
  width: 100%;
  font-size: 28rpx;
  color: #333;
  min-height: 120rpx;
  line-height: 1.5;
}
.placeholder {
  color: #bbb;
}
.depart-btn-wrapper {
  position: relative;
  width: 240rpx;
  height: 240rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.depart-btn {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #14cccc, #007acc);
  box-shadow: 0 8rpx 24rpx rgba(20, 204, 204, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
  z-index: 2;
  position: relative;
}
.ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background: rgba(20, 204, 204, 0.3);
  animation: ripple 2s infinite ease-out;
  z-index: 1;
}
@keyframes ripple {
  0% {
    width: 200rpx;
    height: 200rpx;
    opacity: 0.8;
  }
  100% {
    width: 360rpx;
    height: 360rpx;
    opacity: 0;
  }
}
.loading {
  padding: 40rpx;
  text-align: center;
  color: #999;
  margin-top: 100rpx;
}
.header-row {
  margin-bottom: 40rpx;
  text-align: center;
  border-bottom: 1rpx solid #f0f0f0;
  padding-bottom: 20rpx;
}
.title-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}
.section-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}
.section-desc {
  font-size: 24rpx;
  color: #999;
}
.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.limit-text {
  font-size: 24rpx;
  color: #999;
}
.upload-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
}
.upload-item,
.upload-add {
  width: 150rpx;
  height: 150rpx;
  border-radius: 16rpx;
  position: relative;
  box-sizing: border-box;
}
.upload-item {
  border: 1rpx solid #eee;
  overflow: hidden;
}
.upload-img {
  width: 100%;
  height: 100%;
}
.remove-btn {
  position: absolute;
  top: 0;
  right: 0;
  width: 40rpx;
  height: 40rpx;
  background: rgba(0, 0, 0, 0.6);
  border-bottom-left-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
.remove-text {
  color: #fff;
  font-size: 28rpx;
  line-height: 1;
  margin-top: -4rpx;
}
.upload-add {
  background: #f8f9fc;
  border: 2rpx dashed #dce1e6;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}
.upload-add:active {
  background: #edf1f5;
  border-color: #14cccc;
}
.add-symbol {
  font-size: 48rpx;
  color: #c0c4cc;
  font-weight: 300;
  margin-bottom: 4rpx;
  line-height: 1;
}
.add-text {
  font-size: 22rpx;
  color: #909399;
}
</style>
