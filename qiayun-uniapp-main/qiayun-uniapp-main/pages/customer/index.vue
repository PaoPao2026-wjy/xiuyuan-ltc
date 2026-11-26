<template>
  <view class="container">
    <view class="profile-card">
      <view class="left">
        <view class="avatar-wrap">
          <image
            class="avatar"
            :src="user.avatar || defaultAvatar"
            mode="aspectFill"
          />
        </view>
      </view>

      <view class="right">
        <text class="name">{{ user.name }}</text>
        <text class="company"
          >{{ user.company }} <text v-if="user.jobName && user.company">|</text>
          {{ user.jobName }}
        </text>

        <view v-if="user.isVip && userRole === 'INDIVIDUAL'" class="vip-badge">
          <text class="vip-star">⭐</text>
          <text class="vip-text">VIP会员</text>
        </view>
      </view>
    </view>

    <view class="header">
      <view class="title-wrap">
        <text v-if="userRole === 'INDIVIDUAL'" class="title">我的任务</text>
        <text v-else class="title">我的发布</text>
      </view>
      <view class="btn-wrap">
        <button
          v-if="userRole === 'ENTERPRISE'"
          class="add-btn disabled"
          disabled
        >
          <text class="add-text">发布任务</text>
        </button>
        <button v-if="taskList.length > 0" class="add-btn" @tap="toMyTask">
          <text class="add-text">查看更多</text>
        </button>
      </view>
    </view>

    <view v-if="taskList.length" class="taskList">
      <view
        v-for="(item, idx) in taskList"
        :key="item.orderNo || idx"
        class="card card-elevated"
        @tap="handleDetail(item)"
      >
        <view class="card-header">
          <text class="card-title">{{ item.title || "未命名任务" }}</text>
          <text class="status-tag" :class="statusClass(item.status)">
            {{ item.processingStatusText }}
          </text>
        </view>

        <view class="divider"></view>

        <view class="card-body">
          <view class="row">
            <text class="label">工单号</text>
            <text class="chip">{{ item.orderNo || "-" }}</text>
          </view>
          <view class="row">
            <text class="label">地址</text>
            <text class="value address">{{
              item.workAddress || item.address || "-"
            }}</text>
          </view>
          <view class="row">
            <text class="label">开始时间</text>
            <text class="value">{{ formatTime(item.plannedStartTime) }}</text>
          </view>
        </view>

        <view class="card-footer">
          <view class="actions">
            <button class="btn outline" @tap.stop="handleContact(item)">
              联系客户
            </button>
            <button
              v-if="item.processingStatus === 'NOT_STARTED'"
              class="btn outline danger"
              @tap.stop="handleRejectOpen(item)"
            >
              拒绝工单
            </button>
            <button
              v-if="item.processingStatus === 'NOT_STARTED'"
              class="btn primary"
              @tap.stop="handleAction('start', item)"
            >
              开始任务
            </button>
            <button
              v-else-if="item.status === 'IN_PROGRESS'"
              class="btn primary"
              @tap.stop="handleAction('continue', item)"
            >
              继续任务
            </button>
            <button
              v-else-if="item.status === 'COMPLETED'"
              class="btn outline"
              @tap.stop="handleAction('report', item)"
            >
              查看报告
            </button>
          </view>
        </view>
      </view>
    </view>

    <view v-if="userRole === 'ENTERPRISE'" class="header device-header">
      <view class="title-wrap">
        <text class="title">我的设备</text>
      </view>
      <button class="add-btn" @tap="toAddEquipment">
        <text class="add-text">新增设备</text>
      </button>
    </view>

    <view v-if="userRole === 'ENTERPRISE'" class="device-list">
      <view
        v-for="(eq, idx) in equipmentList"
        :key="idx"
        class="card card-elevated"
        @tap="handleEquipmentDetail(eq)"
      >
        <view class="card-title">{{ eq.name }}</view>

        <view class="rows">
          <view class="row first-row">
            <text class="label">设备编号：</text>
            <text class="value">{{ eq.equipmentNo }}</text>
          </view>

          <view class="row">
            <text class="label">设备类型：</text>
            <text class="value">{{ typeMap[eq.type] || "" }}</text>
          </view>
          <view class="row first-row">
            <text class="label">生产日期：</text>
            <text class="value">{{ formatTime(eq.manufactureDate) }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="more-device" @tap="toEquipmentList">
      <text class="add-text">查看更多设备</text>
    </view>

    <view v-if="userRole === 'INDIVIDUAL'" class="header device-header">
      <view class="title-wrap">
        <text class="title">会员权益</text>
      </view>
    </view>

    <view v-if="userRole === 'INDIVIDUAL'" class="vip-card">
      <view class="vip-header">
        <text class="vip-title">VIP会员特权</text>
        <view class="points-pill">
          <text class="points-label">积分：</text>
          <text class="points-value">{{ vipPoints }}</text>
        </view>
      </view>

      <view v-if="userRole === 'INDIVIDUAL'" class="vip-grid">
        <view class="vip-item" v-for="(b, i) in vipBenefits" :key="i">
          <text class="vip-emoji">{{ b.emoji }}</text>
          <text class="vip-label">{{ b.title }}</text>
        </view>
      </view>
    </view>
    <!-- 拒绝弹窗 -->
    <view v-if="showRejectModal" class="modal-mask">
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">拒绝工单</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label required">拒绝原因</text>
            <textarea
              v-model="rejectForm.rejectReason"
              class="form-textarea"
              placeholder="请输入拒绝原因"
              :maxlength="200"
            />
          </view>
          <view class="form-item">
            <text class="form-label">备注</text>
            <textarea
              v-model="rejectForm.remark"
              class="form-textarea"
              placeholder="请输入备注"
              :maxlength="200"
            />
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn outline" @tap="handleRejectClose">取消</button>
          <button class="btn primary" :loading="rejecting" @tap="confirmReject">
            确定
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import {
  getMyTaskList,
  getEntTaskList,
  rejectTask,
} from "@/apis/modules/task.js";
import { getUserInfo, getCompanyUserInfo } from "@/apis/modules/login.js";
import { getEquipmentList } from "@/apis/modules/equipment.js";
export default {
  data() {
    return {
      user: {
        name: "",
        company: "",
        department: "",
        isVip: true,
        avatar: "",
        jobName: "",
      },
      defaultAvatar: "/static/avatar.png",
      taskList: [],
      equipmentList: [],
      vipPoints: 0,
      vipBenefits: [
        { emoji: "🏆", title: "优先服务" },
        { emoji: "💰", title: "9折优惠" },
        { emoji: "☎️", title: "专属客服" },
        { emoji: "🎁", title: "积分兑换" },
      ],
      typeMap: {
        HIGH_VOLTAGE_CABINET: "高压柜",
        LOW_VOLTAGE_CABINET: "低压柜",
        TRANSFORMER: "变压器",
      },
      userRole: uni.getStorageSync("userRole") || "INDIVIDUAL",
      showRejectModal: false,
      rejectForm: {
        workOrderId: "",
        rejectReason: "",
        remark: "",
      },
      rejecting: false,
    };
  },
  onShow() {
    const token = uni.getStorageSync("token");
    console.log("token====>customer", token);
    if (!token) {
      uni.showToast({ title: "请先登录", icon: "none" });
      setTimeout(() => {
        uni.reLaunch({ url: "/pages/login/index" });
      }, 400);
      return;
    }
    this.fetchTaskList();
    if (this.userRole === "ENTERPRISE") {
      this.getEquipmentList();
    }
    const user = uni.getStorageSync("userInfo");
    if (user) {
      this.user = {
        name:
          this.userRole === "ENTERPRISE"
            ? user.contactName
            : user.realName || "",
        company:
          this.userRole === "ENTERPRISE" ? user.enterprise.enterpriseName : "",
        jobName:
          this.userRole === "ENTERPRISE" ? user.contactPosition : user.jobName,
        isVip: true,
        phone: user.phone,
        avatar:
          this.userRole === "ENTERPRISE"
            ? user.avatarUrl
            : user.wechatInfo.avatarUrl,
      };
      this.vipPoints = user.points || 0;
    }
    this.getUserInfo();
  },
  methods: {
    getUserInfo() {
      if (this.userRole === "INDIVIDUAL") {
        getUserInfo().then((res) => {
          console.log("个人信息详情", res);
          this.user = {
            avatar: res.wechatInfo.avatarUrl || "",
            name: res.realName || "",
            isVip: true,
            phone: res.phone || "",
            jobName: res.jobName || "",
          };
          this.vipPoints = res.points || 0;
          uni.setStorageSync("userInfo", res);
        });
      } else {
        getCompanyUserInfo().then((res) => {
          console.log("企业相关信息详情", res);
          this.user = {
            name: res.contactName || "",
            company: res.enterprise.enterpriseName,
            jobName: res.contactPosition,
            phone: res.phone,
            avatar: res.avatarUrl,
          };
          uni.setStorageSync("userInfo", res);
        });
      }
    },
    handleDetail(item) {
      uni.navigateTo({
        url: "/pages/task/detail?type=detail&id=" + item.workOrderId,
      });
    },
    handleEquipmentDetail(eq) {
      const url = "/pages/mine/addEquipment?id=" + eq.id;
      uni.navigateTo({ url });
    },
    handleContact(item) {
      const phone = item?.contactPhone;
      if (phone) {
        uni.makePhoneCall({ phoneNumber: String(phone) });
      } else {
        uni.showToast({ title: "暂无联系方式", icon: "none" });
      }
    },
    handleRejectOpen(item) {
      this.rejectForm = {
        workOrderId: item.workOrderId,
        rejectReason: "",
        remark: "",
      };
      this.showRejectModal = true;
    },
    handleRejectClose() {
      this.showRejectModal = false;
      this.rejectForm = { workOrderId: "", rejectReason: "", remark: "" };
    },
    async confirmReject() {
      if (!this.rejectForm.rejectReason) {
        uni.showToast({ title: "请输入拒绝原因", icon: "none" });
        return;
      }
      this.rejecting = true;
      try {
        await rejectTask(this.rejectForm);
        uni.showToast({ title: "已拒绝", icon: "success" });
        this.handleRejectClose();
        this.fetchTaskList(true);
      } catch (e) {
        console.error(e);
        uni.showToast({ title: "操作失败", icon: "none" });
      } finally {
        this.rejecting = false;
      }
    },
    toMyTask() {
      uni.navigateTo({ url: "/pages/mine/task" });
    },
    async getEquipmentList() {
      const res = await getEquipmentList({
        page: 1,
        pageSize: 3,
      });
      console.log("电力设备列表", res);
      this.equipmentList = res.items || [];
    },
    async fetchTaskList() {
      const token = uni.getStorageSync("token");
      if (!token) return;
      try {
        const params = { page: 1, pageSize: 3 };
        let data =
          this.userRole === "INDIVIDUAL"
            ? await getMyTaskList(params)
            : await getEntTaskList(params);
        this.taskList = data.list || [];
      } catch (e) {
        // uni.showToast({ title: "获取我的工单失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },

    handleAction(type, item) {
      const id = item?.workOrderId || item?.id;
      if (!id) {
        uni.showToast({ title: "缺少工单ID", icon: "none" });
        return;
      }
      if (
        item.processingStatus === "SELF_INSPECTED" ||
        item.processingStatus === "EXECUTING" ||
        item.processingStatus === "COMPLETED"
      ) {
        const url = `/pages/task/doneTask?id=${id}`;
        if (item.processingStatus === "SELF_INSPECTED") {
          updateTaskExecutionStatus({
            workOrderId: id,
            processingStatus: "EXECUTING",
          });
        }
        uni.navigateTo({ url });
        return;
      }
      const url = `/pages/task/updateTask?id=${id}`;
      uni.navigateTo({ url });
    },
    formatTime(dateTime) {
      if (!dateTime) return "-";
      if (typeof dateTime === "number") {
        const d = new Date(dateTime);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      }
      return String(dateTime)
        .replace(/[TZ]/g, " ")
        .replace(/\.\d+/, "")
        .split(" ")[0];
    },
    statusLabel(s) {
      const raw = String(s || "").toUpperCase();
      switch (raw) {
        case "ASSIGNED":
        case "待处理":
          return "待处理";
        case "PROCESSING":
        case "进行中":
          return "进行中";
        case "COMPLETED":
        case "已完成":
          return "已完成";
        default:
          return s || "-";
      }
    },
    statusClass(status) {
      switch (status) {
        case "ASSIGNED":
          return "pending";
        case "PROCESSING":
          return "doing";
        case "COMPLETED":
          return "done";
        default:
          return "doing";
      }
    },
    toEquipmentList() {
      uni.navigateTo({ url: "/pages/mine/equipment" });
    },
    toAddEquipment() {
      uni.navigateTo({ url: "/pages/mine/addEquipment" });
    },
  },
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f7f8fa;
  padding: 24rpx;
  box-sizing: border-box;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 32rpx 28rpx;
  border-radius: 24rpx;
  color: #ffffff;
  background: linear-gradient(135deg, #18d4c8 0%, #0aa6db 60%, #007acc 100%);
  box-shadow: 0 16rpx 36rpx rgba(0, 122, 204, 0.25);
  margin-bottom: 24rpx;
}

.left {
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-wrap {
  width: 120rpx;
  height: 120rpx;
  border-radius: 999rpx;
  background: radial-gradient(
    120rpx circle at 50% 40%,
    rgba(255, 255, 255, 0.35),
    rgba(255, 255, 255, 0.18)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 22rpx rgba(255, 255, 255, 0.25) inset;
}
.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 999rpx;
}

.right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.name {
  font-size: 40rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
}
.company {
  font-size: 28rpx;
  opacity: 0.9;
}

.vip-badge {
  margin-top: 12rpx;
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
  width: 160rpx;
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.15);
  border: 2rpx solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 8rpx 20rpx rgba(255, 255, 255, 0.18) inset;
}
.vip-star {
  font-size: 26rpx;
}
.vip-text {
  font-size: 28rpx;
}

.section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 12rpx 28rpx rgba(0, 0, 0, 0.08);
}
.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #222;
}
.section-desc {
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #666;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.device-header {
  margin-top: 40rpx;
}
.header-spacer {
  height: 120rpx;
}
.title-wrap {
  display: flex;
  align-items: center;
}
.title {
  font-size: 36rpx;
  font-weight: 700;
  color: #222;
  position: relative;
  padding-left: 20rpx;
}
.title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 10rpx;
  height: 36rpx;
  border-radius: 8rpx;
  background: linear-gradient(180deg, #14cccc, #007acc);
  box-shadow: 0 4rpx 10rpx rgba(20, 204, 204, 0.12);
}
.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 0 24rpx;
  height: 72rpx;
  border-radius: 16rpx;
  background: #14cccc;
  color: #fff;
  font-size: 28rpx;
  box-shadow: 0 8rpx 20rpx rgba(20, 204, 204, 0.25);
  border: none;
  margin: 0;
}

.add-btn.disabled {
  box-shadow: none;
  margin-right: 12rpx;
  border: 1px solid #ccc;
}

.taskList {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
.taskList .card {
  position: relative;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 12rpx 28rpx rgba(0, 0, 0, 0.08);
  overflow: hidden;
}
.taskList .card::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 8rpx;
  background: linear-gradient(180deg, #14cccc, #007acc);
}
.taskList .card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}
.taskList .card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #222;
  max-width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.taskList .status-tag {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  color: #fff;
}
.taskList .status-tag.pending {
  background: #faad14;
}
.taskList .status-tag.doing {
  background: #14cccc;
}
.taskList .status-tag.done {
  background: #52c41a;
}
.taskList .status-tag.unknown {
  background: #999;
}
.taskList .divider {
  height: 2rpx;
  background: linear-gradient(
    90deg,
    rgba(20, 204, 204, 0.15),
    rgba(0, 122, 204, 0.12)
  );
  margin: 16rpx 0 12rpx;
}
.taskList .card-body {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.taskList .row {
  display: flex;
  align-items: center;
}
.row.first-row {
  grid-column: 1 / -1;
}
.taskList .label {
  width: 140rpx;
  font-size: 26rpx;
  color: #888;
}
.taskList .value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}
.taskList .address {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.taskList .chip {
  display: inline-flex;
  align-items: center;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  font-size: 26rpx;
  color: #155e63;
  background-color: rgba(20, 204, 204, 0.12);
  border: 2rpx solid rgba(20, 204, 204, 0.3);
}
.taskList .card-footer {
  margin-top: 16rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.taskList .actions {
  display: flex;
  gap: 16rpx;
}
.taskList .btn {
  height: 72rpx;
  padding: 0 24rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.taskList .btn.primary {
  background-color: #14cccc;
  color: #fff;
  box-shadow: 0 8rpx 20rpx rgba(20, 204, 204, 0.25);
}
.taskList .btn.outline {
  background-color: #fff;
  color: #14cccc;
  border: 2rpx solid #14cccc;
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
.device-list .card {
  position: relative;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 12rpx 28rpx rgba(0, 0, 0, 0.08);
  overflow: hidden;
}
.device-list .card::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 12rpx;
  background: linear-gradient(180deg, #14cccc, #0aa2c2);
  border-radius: 12rpx;
}
.device-list .card-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #222;
  margin-bottom: 12rpx;
}
.device-list .rows {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx 24rpx;
}
.device-list .row {
  display: flex;
  align-items: baseline;
}
.device-list .label {
  font-size: 26rpx;
  color: #888;
}
.device-list .value {
  font-size: 28rpx;
  color: #333;
  margin-left: 10rpx;
}
.device-list .value.due {
  color: #fa8c16;
  font-weight: 700;
}

.more-device {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 0 24rpx;
  height: 72rpx;
  border-radius: 16rpx;
  background: #14cccc;
  color: #fff;
  font-size: 28rpx;
  box-shadow: 0 8rpx 20rpx rgba(20, 204, 204, 0.25);
  border: none;
  margin: 0;
  margin-top: 40rpx;
}

.vip-card {
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 12rpx 28rpx rgba(0, 0, 0, 0.08);
  padding: 24rpx;
  margin-bottom: 24rpx;
}
.vip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}
.vip-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #222;
}
.points-pill {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  background: #14cccc;
  color: #fff;
}
.points-label {
  font-size: 26rpx;
  opacity: 0.95;
}
.points-value {
  font-size: 28rpx;
  font-weight: 700;
}

.vip-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}
.vip-item {
  height: 160rpx;
  background: #f9fafb;
  border: 2rpx solid #eee;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.vip-emoji {
  font-size: 56rpx;
  line-height: 1;
}
.vip-label {
  margin-top: 8rpx;
  font-size: 28rpx;
  color: #333;
}

.modal-mask {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
.modal-header {
  text-align: center;
}
.modal-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
}
.modal-body {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
.form-item {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.form-label {
  font-size: 28rpx;
  color: #333;
}
.form-label.required::after {
  content: "*";
  color: #ff4d4f;
  margin-left: 4rpx;
}
.form-textarea {
  width: 100%;
  height: 160rpx;
  background: #f7f8fa;
  border-radius: 12rpx;
  padding: 16rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}
.modal-footer {
  display: flex;
  gap: 24rpx;
  margin-top: 16rpx;
}
.modal-footer .btn {
  flex: 1;
}
</style>
