<template>
  <view class="container">
    <view class="header header-fixed">
      <view class="title-wrap">
        <text class="title">我的设备</text>
      </view>
      <button class="add-btn" @tap="handleAdd">
        <text class="add-icon">＋</text>
        <text class="add-text">新增</text>
      </button>
    </view>

    <view class="list">
      <view
        v-for="(eq, idx) in equipments"
        :key="idx"
        class="card card-elevated"
        @tap="handleDetail(eq)"
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
            <text class="value">{{ formatDate(eq.manufactureDate) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getEquipmentList } from "@/apis/modules/equipment.js";
export default {
  data() {
    return {
      equipments: [],
      page: 1,
      pageSize: 10,
      hasMore: true,
      loading: false,
      typeMap: {
        HIGH_VOLTAGE_CABINET: "高压柜",
        LOW_VOLTAGE_CABINET: "低压柜",
        TRANSFORMER: "变压器",
      },
    };
  },
  onShow() {
    this.requestEquipmentList(true);
  },
  onReachBottom() {
    if (this.hasMore && !this.loading) {
      this.page += 1;
      this.requestEquipmentList();
    }
  },
  methods: {
    async requestEquipmentList(reset) {
      if (reset) {
        this.page = 1;
        this.equipments = [];
        this.hasMore = true;
      }
      this.loading = true;
      try {
        const res = await getEquipmentList({
          page: this.page,
          pageSize: this.pageSize,
        });
        const items = Array.isArray(res)
          ? res
          : Array.isArray(res?.items)
          ? res.items
          : Array.isArray(res?.list)
          ? res.list
          : [];
        const total =
          res.total ??
          (reset ? items.length : this.equipments.length + items.length);
        this.equipments = reset ? items : this.equipments.concat(items);
        const loaded = this.equipments.length;
        this.hasMore = loaded < total && items.length >= this.pageSize;
      } catch (error) {
        uni.showToast({ title: "获取设备列表失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    formatDate(input) {
      if (!input) return "-";
      if (typeof input === "number") {
        const d = new Date(input);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      }
      return String(input).replace(/[TZ]/g, " ").replace(/\.\d+/, "").split(" ")[0];;
    },
    handleAdd() {
      const url = "/pages/mine/addEquipment";
      uni.navigateTo({ url });
    },
    handleDetail(eq) {
      const url = "/pages/mine/addEquipment?id=" + eq.id;
      uni.navigateTo({ url });
    },
  },
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f7f8fa;
  padding: 150rpx 24rpx 80rpx;
  box-sizing: border-box;
}

/* 顶部标题 + 新增按钮 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}
.header-fixed {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 20;
  background: #ffffff;
  padding: 16rpx 24rpx;
  border-bottom: 2rpx solid #f0f0f0;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.06);
  margin-bottom: 0;
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
.add-icon {
  font-size: 32rpx;
  font-weight: 700;
}

/* 列表卡片 */
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
  width: 12rpx;
  background: linear-gradient(180deg, #14cccc, #0aa2c2);
  border-radius: 12rpx;
}
.card-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #222;
  margin-bottom: 12rpx;
}
.rows {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx 24rpx;
}
.row {
  display: flex;
  align-items: baseline;
}
.row.first-row {
  grid-column: 1 / -1;
}
.label {
  font-size: 26rpx;
  color: #888;
}
.value {
  font-size: 28rpx;
  color: #333;
  margin-left: 10rpx;
}
.value.due {
  color: #fa8c16;
  font-weight: 700;
}
</style>
