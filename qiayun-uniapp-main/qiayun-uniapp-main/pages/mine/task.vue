<template>
  <view class="container">
    <view v-if="userRole === 'INDIVIDUAL'" class="tabs segmented header-fixed">
      <view
        class="tab"
        :class="{ active: activeStatus === 'ALL' }"
        @tap="switchTab('ALL')"
      >
        <text class="tab-title">全部</text>
        <view class="tab-badge blue">
          <text class="tab-badge-text">{{ stats.all }}</text>
        </view>
      </view>
      <view
        class="tab"
        :class="{ active: activeStatus === 'ACCEPTED' }"
        @tap="switchTab('ACCEPTED')"
      >
        <text class="tab-title">待处理</text>
        <view class="tab-badge teal">
          <text class="tab-badge-text">{{ stats.pending }}</text>
        </view>
      </view>
      <view
        class="tab"
        :class="{ active: activeStatus === 'IN_PROGRESS' }"
        @tap="switchTab('IN_PROGRESS')"
      >
        <text class="tab-title">进行中</text>
        <view class="tab-badge teal">
          <text class="tab-badge-text">{{ stats.inProgress }}</text>
        </view>
      </view>
      <view
        class="tab"
        :class="{ active: activeStatus === 'COMPLETED' }"
        @tap="switchTab('COMPLETED')"
      >
        <text class="tab-title">已完成</text>
        <view class="tab-badge teal">
          <text class="tab-badge-text">{{ stats.completed }}</text>
        </view>
      </view>
      <view
        class="tab"
        :class="{ active: activeStatus === 'REJECTED' }"
        @tap="switchTab('REJECTED')"
      >
        <text class="tab-title">已拒绝</text>
        <view class="tab-badge teal">
          <text class="tab-badge-text">{{ stats.rejected }}</text>
        </view>
      </view>
    </view>

    <scroll-view
      v-if="userRole === 'ENTERPRISE'"
      class="tabs-scroll header-fixed"
      scroll-x
      :show-scrollbar="false"
    >
      <view class="scroll-content">
        <view
          v-for="tab in entTabs"
          :key="tab.key"
          class="scroll-tab"
          :class="{ active: activeStatus === tab.key }"
          @tap="switchTab(tab.key)"
        >
          <text class="tab-title">{{ tab.label }}</text>
          <view class="tab-badge blue">
            <text class="tab-badge-text">{{ stats[tab.statKey] || 0 }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view v-if="list.length" class="list">
      <view
        v-for="(item, idx) in list"
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

      <view class="load-more">
        <text v-if="loading">加载中...</text>
        <text v-else-if="!hasMore">没有更多了</text>
        <text v-else>下滑加载更多</text>
      </view>
    </view>

    <view v-else class="empty">
      <text>暂无工单</text>
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
  getTaskStats,
  getEntTaskList,
  getEntTaskStats,
  updateTaskExecutionStatus,
  rejectTask,
} from "@/apis/modules/task.js";

export default {
  data() {
    return {
      activeStatus: "ALL",
      stats: { all: 0, pending: 0, inProgress: 0, completed: 0, rejected: 0 },
      entStats: { all: 0, pending: 0, inProgress: 0, completed: 0 },
      list: [],
      page: 1,
      pageSize: 10,
      hasMore: true,
      loading: false,
      userRole: uni.getStorageSync("userRole"),
      showRejectModal: false,
      rejectForm: {
        workOrderId: "",
        rejectReason: "",
        remark: "",
      },
      rejecting: false,
      entTabs: [
        { key: "ALL", label: "全部", statKey: "total" },
        { key: "PENDING_REVIEW", label: "待审核", statKey: "pendingReview" },
        {
          key: "REVIEW_REJECTED",
          label: "审核驳回",
          statKey: "reviewRejected",
        },
        {
          key: "PENDING_ACCEPTANCE",
          label: "待接单",
          statKey: "pendingAcceptance",
        },
        { key: "ACCEPTED", label: "已接单", statKey: "accepted" },
        { key: "IN_PROGRESS", label: "进行中", statKey: "inProgress" },
        { key: "COMPLETED", label: "已完成", statKey: "completed" },
        { key: "REJECTED", label: "已拒绝", statKey: "rejected" },
        { key: "CANCELLED", label: "已取消", statKey: "cancelled" },
      ],
    };
  },
  onLoad(options) {
    const s = options?.status;
    if (s) this.activeStatus = s;

    if (this.userRole === "ENTERPRISE") {
      uni.setNavigationBarTitle({
        title: "我的发布",
      });
    }
  },
  onShow() {
    this.fetchStats();
    this.fetchList(true);
  },
  onReachBottom() {
    if (this.hasMore && !this.loading) {
      this.page += 1;
      this.fetchList();
    }
  },
  methods: {
    async fetchStats() {
      try {
        if (this.userRole === "ENTERPRISE") {
          const res = await getEntTaskStats();
          this.stats = res;
        } else {
          const data = await getTaskStats();
          this.stats = {
            all: Number(data?.total ?? data?.all ?? 0),
            pending: Number(data?.pending || 0),
            inProgress: Number(data?.processing || 0),
            completed: Number(data?.completed || 0),
            rejected: Number(data?.rejected || 0),
          };
        }
      } catch (e) {
        console.error("fetchStats error", e);
        // this.stats = { ... }; // keep old stats or reset
      }
    },
    handleDetail(item) {
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
        const params = { page: this.page, pageSize: this.pageSize };
        if (this.activeStatus !== "ALL") params.status = this.activeStatus;

        const api =
          this.userRole === "ENTERPRISE" ? getEntTaskList : getMyTaskList;
        const data = await api(params);

        const items = Array.isArray(data?.list) ? data.list : [];
        const total =
          data?.pagination?.total ??
          (reset ? items.length : this.list.length + items.length);
        this.list = reset ? items : this.list.concat(items);
        const loaded = this.list.length;
        this.hasMore = loaded < total && items.length >= this.pageSize;
      } catch (e) {
        uni.showToast({ title: "获取工单失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    switchTab(key) {
      if (this.activeStatus === key) return;
      this.activeStatus = key;
      this.fetchList(true);
    },
    handleContact(item) {
      const phone = item?.contactPhone;
      if (phone) {
        uni.makePhoneCall({ phoneNumber: String(phone) });
      } else {
        uni.showToast({ title: "暂无联系方式", icon: "none" });
      }
    },
    handleAction(type, item) {
      const id = item?.workOrderId;
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
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        return `${y}-${m}-${day} ${hh}:${mm}`;
      }
      return String(dateTime).replace(/[TZ]/g, " ").replace(/\.\d+/, "");
    },
    statusLabel(s) {
      const raw = String(s || "").toUpperCase();
      switch (raw) {
        case "ACCEPTED":
        case "待处理":
          return "待处理";
        case "IN_PROGRESS":
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
        case "ACCEPTED":
          return "pending";
        case "IN_PROGRESS":
          return "doing";
        case "COMPLETED":
          return "done";
        case "REJECTED":
          return "rejected";
        default:
          return "unknown";
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
        this.fetchList(true); // Refresh list
        this.fetchStats(); // Refresh stats
      } catch (e) {
        console.error(e);
        uni.showToast({ title: "操作失败", icon: "none" });
      } finally {
        this.rejecting = false;
      }
    },
  },
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f7f8fa;
  padding: 220rpx 24rpx 120rpx;
  box-sizing: border-box;
}

.tabs.segmented {
  display: flex;
  align-items: stretch;
  margin: 20rpx;
  padding: 16rpx;
  background: #ffffff;
  border: 2rpx solid #f0f0f0;
  border-radius: 24rpx;
  box-shadow: 0 12rpx 28rpx rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.header-fixed {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 20;
  margin-bottom: 0;
}

.tabs.segmented .tab {
  flex: 1;
  height: 140rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 2rpx solid #f0f0f0;
  background: #fff;
}
.tabs.segmented .tab:last-child {
  border-right: none;
}
.tab-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #666666;
}
.tab.active {
  background: #f0f7ff;
  border-radius: 16rpx;
  box-shadow: inset 0 0 0 2rpx rgba(22, 119, 255, 0.06);
}

.tabs-scroll {
  background: #ffffff;
  box-shadow: 0 12rpx 28rpx rgba(0, 0, 0, 0.06);
  padding: 16rpx 0;
  margin: 20rpx;
  border-radius: 24rpx;
  border: 2rpx solid #f0f0f0;
  box-sizing: border-box;
}

.scroll-content {
  display: flex;
  padding: 0 16rpx;
}

.scroll-tab {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 24rpx;
  margin-right: 0;
  background: #fff;
  min-width: 140rpx;
  height: 140rpx;
  flex-shrink: 0;
  border-right: 2rpx solid #f0f0f0;
}

.scroll-tab:last-child {
  border-right: none;
}

.scroll-tab.active {
  background: #f0f7ff;
  border-radius: 16rpx;
  box-shadow: inset 0 0 0 2rpx rgba(22, 119, 255, 0.06);
  border-right: none;
}

.scroll-tab .tab-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #666666;
  margin-bottom: 0;
}

.scroll-tab.active .tab-title {
  color: #666666;
}

.tab.active .tab-title {
  color: #14cccc;
}
.tab-badge {
  margin-top: 12rpx;
  width: 44rpx;
  height: 44rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.08);
}
.tab-badge-text {
  font-size: 24rpx;
  font-weight: 700;
  color: #ffffff;
}
.tab-badge.teal {
  background: #14cccc;
}
.tab-badge.blue {
  background: #14cccc;
}

/* 列表卡片（复用任务广场风格） */
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
.status-tag {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  color: #fff;
}
.status-tag.pending {
  background: #faad14;
}
.status-tag.doing {
  background: #14cccc;
}
.status-tag.done {
  background: #52c41a;
}
.status-tag.rejected {
  background: #ff4d4f;
}
.status-tag.unknown {
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
  justify-content: flex-end;
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
.btn.danger {
  color: #ff4d4f;
  border-color: #ff4d4f;
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

/* Modal Styles */
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
