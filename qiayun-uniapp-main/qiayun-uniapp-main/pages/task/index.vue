<template>
  <view class="container">
    <view class="header header-elevated">
      <text v-if="userRole === 'INDIVIDUAL'" class="title">任务广场</text>
      <text v-if="userRole === 'ENTERPRISE'" class="title">我的发布</text>
      <text class="subtitle">维修工单管理</text>
    </view>
    <!-- <view
      v-if="userRole === 'ENTERPRISE'"
      class="header header-elevated"
      @tap="toggleStats"
    >
      <text class="title">我的发布</text>
      <view v-if="stats && userRole === 'ENTERPRISE'" class="stats-grid">
        <view class="stat-item">
          <text class="stat-value">{{ stats.total || 0 }}</text>
          <text class="stat-label">总数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.pendingReview || 0 }}</text>
          <text class="stat-label">待审核</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.completed || 0 }}</text>
          <text class="stat-label">已完成</text>
        </view>

        <block v-if="statsExpanded">
          <view class="stat-item">
            <text class="stat-value">{{ stats.inProgress || 0 }}</text>
            <text class="stat-label">进行中</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ stats.reviewRejected || 0 }}</text>
            <text class="stat-label">审核驳回</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ stats.pendingAcceptance || 0 }}</text>
            <text class="stat-label">待接单</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ stats.accepted || 0 }}</text>
            <text class="stat-label">已接单</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ stats.rejected || 0 }}</text>
            <text class="stat-label">已拒绝</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ stats.cancelled || 0 }}</text>
            <text class="stat-label">已取消</text>
          </view>
        </block>

        <view class="stat-toggle">
          <text class="toggle-icon">{{ statsExpanded ? "▲" : "▼" }}</text>
        </view>
      </view>
    </view> -->

    <view v-if="list.length" class="list">
      <view
        v-for="(item, idx) in list"
        :key="item.orderNo || idx"
        class="card card-elevated"
        @tap="handleDetail(item)"
      >
        <view class="card-header">
          <text class="card-title">{{ item.title || "未命名任务" }}</text>
          <text class="priority-tag" :class="priorityClass(item.priority)">{{
            priorityLabel(item.priority)
          }}</text>
        </view>

        <view class="divider"></view>

        <view class="card-body">
          <view class="row">
            <text class="label">工单号</text>
            <text class="chip">{{ item.orderNo || "-" }}</text>
          </view>
          <view class="row">
            <text class="label">地址</text>
            <text class="value address">{{ item.workAddress || "-" }}</text>
          </view>
          <view class="row">
            <text class="label">任务时间</text>
            <text class="value">{{ formatTime(item.plannedStartTime) }}</text>
          </view>
        </view>

        <view v-if="userRole === 'INDIVIDUAL'" class="card-footer" @tap.stop="">
          <view class="time"> </view>
          <view class="actions">
            <button
              class="btn primary"
              @tap="handleAccept(item)"
              :disabled="accepting"
            >
              接受工单
            </button>
          </view>
        </view>
      </view>

      <view class="load-more">
        <text v-if="loading">加载中...</text>
        <text v-else-if="!hasMore">没有更多了</text>
        <text v-else>下滑加载更多</text>
      </view>
    </view>

    <view v-else class="empty">
      <text>暂无任务</text>
    </view>
  </view>
</template>

<script>
import {
  getTaskList,
  getEntTaskList,
  getEntTaskStats,
  acceptTask,
} from "@/apis/modules/task.js";

export default {
  data() {
    return {
      list: [],
      page: 1,
      pageSize: 10,
      hasMore: true,
      loading: false,
      accepting: false,
      userRole: uni.getStorageSync("userRole") || "INDIVIDUAL",
      stats: null,
      statsExpanded: false,
    };
  },
  onShow() {
    this.fetchList(true);
    this.fetchStats();
  },
  onReachBottom() {
    if (this.hasMore && !this.loading) {
      this.page += 1;
      this.fetchList();
    }
  },
  methods: {
    handleIsLogin() {
      const token = uni.getStorageSync("token");
      if (!token) {
        uni.showToast({ title: "请先登录", icon: "none" });
        setTimeout(() => {
          uni.reLaunch({ url: "/pages/login/index" });
        }, 400);
        return false;
      }
      return true;
    },
    handleDetail(item) {
      if (!this.handleIsLogin()) return;
      uni.navigateTo({
        url: "/pages/task/detail?type=detail&id=" + item.workOrderId,
      });
    },
    async fetchList(reset = false) {
      if (reset) {
        this.page = 1;
        this.list = [];
        this.hasMore = true;
      }
      this.loading = true;
      try {
        const data = await (this.userRole === "INDIVIDUAL"
          ? getTaskList
          : getEntTaskList)({
          page: this.page,
          pageSize: this.pageSize,
        });
        const items = Array.isArray(data?.list) ? data.list : [];
        const total =
          data?.pagination?.total ??
          (reset ? items.length : this.list.length + items.length);
        this.list = reset ? items : this.list.concat(items);
        const loaded = this.list.length;
        this.hasMore = loaded < total && items.length >= this.pageSize;
      } catch (e) {
        uni.showToast({ title: "获取任务失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    async fetchStats() {
      if (this.userRole !== "ENTERPRISE") return;
      try {
        const res = await getEntTaskStats();
        this.stats = res;
      } catch (e) {
        console.error("获取统计失败", e);
      }
    },
    toggleStats() {
      this.statsExpanded = !this.statsExpanded;
    },
    priorityClass(p) {
      const s = String(p || "").toLowerCase();
      if (["high", "urgent", "紧急"].includes(s)) return "high";
      if (["medium", "normal", "一般"].includes(s)) return "medium";
      if (["low", "较低"].includes(s)) return "low";
      return "unknown";
    },
    priorityLabel(priority) {
      switch (priority) {
        case "URGENT":
          return "紧急";
        case "NORMAL":
          return "一般";
        case "LOW":
          return "较低";
        default:
          return priority || "-";
      }
    },
    formatTime(dateTime) {
      if (!dateTime) return "";
      return String(dateTime).replace(/[TZ]/g, " ").replace(/\.\d+/, "");
    },
    async handleAccept(item) {
      if (!this.handleIsLogin()) return;
      if (this.accepting) return;
      const title = item?.title;
      const confirm = await new Promise((resolve) => {
        uni.showModal({
          title: "确认接单",
          content: `确定接受工单 「${title}」 吗？`,
          success: (res) => resolve(!!res.confirm),
          fail: () => resolve(false),
        });
      });
      if (!confirm) return;

      this.accepting = true;
      try {
        // 假设后端接单接口为 /api/v1/app/work-order/accept，可按实际调整
        await acceptTask({ workOrderId: item.workOrderId });
        uni.showToast({ title: "接单成功", icon: "success" });
        const idx = this.list.findIndex(
          (x) => x.workOrderId === item.workOrderId
        );
        if (idx > -1) this.list.splice(idx, 1);
      } catch (e) {
        uni.showToast({ title: "接单失败，请重试", icon: "none" });
      } finally {
        this.accepting = false;
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

.header {
  margin-bottom: 24rpx;
}

.header-elevated {
  background: linear-gradient(135deg, #14cccc, #007acc);
  border-radius: 16rpx;
  padding: 28rpx 24rpx;
  box-shadow: 0 12rpx 28rpx rgba(20, 204, 204, 0.22);
}

.title {
  font-size: 40rpx;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 1rpx;
  position: relative;
}

.title::after {
  content: "";
  display: block;
  width: 80rpx;
  height: 6rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 6rpx;
  margin-top: 10rpx;
}

.subtitle {
  margin-top: 10rpx;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
}

.stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 24rpx;
}

.stat-item {
  width: 30%; /* 3 items per row approx */
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12rpx;
  padding: 16rpx 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.stat-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #fff;
}

.stat-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 4rpx;
}

.stat-toggle {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 8rpx;
}

.toggle-icon {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
  transform: scaleY(0.8);
}

.list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
.card {
  position: relative;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 12rpx 28rpx rgba(0, 0, 0, 0.08);
  overflow: hidden;
}
.card::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 8rpx;
  background: linear-gradient(180deg, #14cccc, #007acc);
}
.card-elevated {
  transition: transform 160ms ease, box-shadow 160ms ease;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}
.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #222;
  max-width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.priority-tag {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  color: #fff;
}
.priority-tag.high {
  background: #ff4d4f;
}
.priority-tag.medium {
  background: #faad14;
}
.priority-tag.low {
  background: #14cccc;
}
.priority-tag.unknown {
  background: #999;
}

.divider {
  height: 2rpx;
  background: linear-gradient(
    90deg,
    rgba(20, 204, 204, 0.15),
    rgba(0, 122, 204, 0.12)
  );
  margin: 16rpx 0 12rpx;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.row {
  display: flex;
  align-items: center;
}
.label {
  width: 140rpx;
  font-size: 26rpx;
  color: #888;
}
.value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}
.address {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.chip {
  display: inline-flex;
  align-items: center;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  font-size: 26rpx;
  color: #155e63;
  background-color: rgba(20, 204, 204, 0.12);
  border: 2rpx solid rgba(20, 204, 204, 0.3);
}

.card-footer {
  margin-top: 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  flex-wrap: wrap;
}
.time {
  flex: 1;
}
.time-label {
  font-size: 24rpx;
  color: #888;
}
.time-value {
  margin-left: 8rpx;
  font-size: 28rpx;
  color: #333;
}
.actions {
  display: flex;
  gap: 16rpx;
}
.btn {
  height: 72rpx;
  padding: 0 24rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn.primary {
  background-color: #14cccc;
  color: #fff;
  box-shadow: 0 8rpx 20rpx rgba(20, 204, 204, 0.25);
}
.btn.outline {
  background-color: #fff;
  color: #14cccc;
  border: 2rpx solid #14cccc;
}
.load-more {
  text-align: center;
  color: #888;
  font-size: 26rpx;
  padding: 24rpx 0;
}

.empty {
  margin-top: 120rpx;
  text-align: center;
  color: #888;
  font-size: 28rpx;
}
</style>
