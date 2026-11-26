<template>
  <view class="container">
    <view class="card info-card card-elevated">
      <view class="card-header header-soft">
        <text class="card-title">{{ safeText(detail.title) }}</text>
        <text class="status-tag" :class="statusClass(detail.priority)">
          {{ statusLabel(detail.priority) }}
        </text>
      </view>

      <view class="divider divider-soft"></view>

      <view class="card-body body-compact">
        <view class="row">
          <text class="label">工单号</text>
          <text class="chip">{{ safeText(detail.orderNo) }}</text>
        </view>
        <view class="row">
          <text class="label">任务地点</text>
          <text class="value address">{{ formatAddress(detail) }}</text>
        </view>
        <view class="row">
          <text class="label">开始时间</text>
          <text class="value">{{ formatTime(detail.plannedStartTime) }}</text>
        </view>
        <view class="row">
          <text class="label">结束时间</text>
          <text class="value">{{ formatTime(detail.plannedEndTime) }}</text>
        </view>
      </view>
    </view>

    <view class="card desc-card card-elevated">
      <view class="section">
        <text class="section-title">工单描述</text>
      </view>

      <view class="divider"></view>

      <view class="section">
        <text class="sub-label">任务备注</text>
        <text class="section-text">{{ safeText(detail.remarks) }}</text>
      </view>

      <view class="section">
        <text class="sub-label">具体要求</text>
        <text class="section-text">{{
          safeText(detail.specificRequirements)
        }}</text>
      </view>
    </view>

    <view
      v-if="(isEdit || isDetail) && detail.descriptionType === 'template'"
      class="card process-card no-elevated comfortable"
    >
      <view
        class="card group-card card-elevated"
        v-for="(group, gi) in process.tempList"
        :key="group.id || gi"
      >
        <view class="section">
          <text class="section-title">{{ group.name }}</text>
        </view>
        <view class="divider"></view>

        <view
          class="sub-section"
          v-for="(item, ii) in group.items || []"
          :key="item.id || ii"
        >
          <text class="sub-label">{{ item.name }}</text>

          <view class="op-list">
            <view
              class="op-row"
              v-for="(op, oi) in getSortedOps(item.operationItems)"
              :key="op.id || oi"
            >
              <text class="op-name">
                {{ op.name }}
                <text v-if="op.required" class="req">*</text>
              </text>

              <view class="op-control">
                <!-- SELECT -->
                <picker
                  v-if="op.type === 'SELECT'"
                  mode="selector"
                  :range="op.options || []"
                  :value="getSelectIndex(op)"
                  :disabled="isDetail"
                  @change="handleSelectChange(gi, ii, oi, $event)"
                >
                  <view class="picker-value">{{ displaySelectValue(op) }}</view>
                </picker>

                <!-- TEXT -->
                <input
                  v-else-if="op.type === 'TEXT'"
                  class="op-input"
                  type="text"
                  :value="String(op.value || '')"
                  placeholder="请输入"
                  :disabled="isDetail"
                  @input="handleTextInput(gi, ii, oi, $event)"
                />

                <!-- BOOLEAN -->
                <radio-group
                  v-else-if="op.type === 'BOOLEAN'"
                  @change="handleBooleanChange(gi, ii, oi, $event)"
                >
                  <view class="checkbox-row">
                    <label class="radio-item">
                      <radio
                        value="true"
                        :checked="op.value === true"
                        :disabled="isDetail"
                      />
                      <text class="checkbox-text">正常</text>
                    </label>
                    <label class="radio-item">
                      <radio
                        value="false"
                        :checked="op.value === false"
                        :disabled="isDetail"
                      />
                      <text class="checkbox-text">异常</text>
                    </label>
                  </view>
                </radio-group>

                <text v-else class="op-unknown"
                  >暂不支持类型：{{ op.type }}</text
                >
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- <view
      v-if="(isEdit || isDetail) && detail.descriptionType === 'custom'"
      class="card result-card card-elevated"
    >
      <view class="section">
        <text class="section-title">处理结果</text>
      </view>

      <view class="divider"></view>

      <view class="section">
        <text class="sub-label">上传文件（仅 1 个，图片或视频）</text>
        <view class="upload-grid single">
          <view
            v-if="process.result.filePath"
            class="thumb"
            :class="process.result.type === 'video' ? 'video' : ''"
            @tap="previewResultFile"
          >
            <image
              v-if="process.result.type === 'image'"
              class="thumb-img"
              :src="process.result.filePath"
              mode="aspectFill"
            />
            <view v-else class="video-placeholder">
              <text class="video-label">视频</text>
            </view>
            <view
              v-if="!isDetail"
              class="thumb-remove"
              @tap.stop="removeResultFile"
              >×</view
            >
          </view>

          <view v-else class="thumb add" @tap="selectResultFile">
            <text class="plus">+</text>
            <text class="hint">添加文件</text>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="sub-label">结果描述</text>
        <textarea
          class="textarea"
          v-model="process.result.description"
          maxlength="500"
          placeholder="请填写处理结果说明…"
          auto-height
          :disabled="isDetail"
        ></textarea>
        <text class="counter"
          >{{ (process.result.description || "").length }}/500</text
        >
      </view>
    </view> -->

    <view v-if="isEdit || isDetail" class="card process-card card-elevated">
      <view class="section">
        <text class="section-title">任务处理</text>
      </view>

      <view class="divider"></view>

      <view class="section">
        <text class="sub-label">处理说明</text>
        <textarea
          class="textarea"
          v-model="process.description"
          maxlength="500"
          :placeholder="descPlaceholder"
          auto-height
          :disabled="isDetail"
        ></textarea>
        <text class="counter"
          >{{ (process.description || "").length }}/500</text
        >
      </view>

      <view class="section">
        <text class="sub-label">上传图片（最多9张）</text>
        <view class="upload-grid">
          <view
            v-for="(src, i) in process.images"
            :key="src + i"
            class="thumb"
            @tap="previewImage(i)"
          >
            <image class="thumb-img" :src="src" mode="aspectFill"></image>
            <view
              v-if="!isDetail"
              class="thumb-remove"
              @tap.stop="removeImage(i)"
              >×</view
            >
          </view>
          <view
            v-if="process.images.length < 9 && !isReport"
            class="thumb add"
            @tap="addImage"
          >
            <text class="plus">+</text>
            <text class="hint">添加图片</text>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="sub-label">上传视频（最多3个）</text>
        <view class="upload-grid">
          <view
            v-for="(v, i) in process.videos"
            :key="String(v) + i"
            class="thumb video"
            @tap="previewVideo(i)"
          >
            <view class="video-placeholder">
              <text class="video-label">视频{{ i + 1 }}</text>
            </view>
            <view
              v-if="!isDetail && !isReport"
              class="thumb-remove"
              @tap.stop="removeVideo(i)"
              >×</view
            >
          </view>
          <view
            v-if="process.videos.length < 3 && !isReport"
            class="thumb add"
            @tap="addVideo"
          >
            <text class="plus">+</text>
            <text class="hint">添加视频</text>
          </view>
        </view>
      </view>

      <!-- <view class="section">
        <text class="sub-label">备注</text>
        <textarea
          class="textarea"
          v-model="process.remarks"
          maxlength="500"
          placeholder="请输入备注"
          auto-height
          :disabled="isDetail"
        ></textarea>
        <text class="counter">{{ (process.remarks || "").length }}/500</text>
      </view> -->
    </view>

    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>
    <view v-if="!loading && isEmpty" class="empty">
      <text>暂无数据</text>
    </view>

    <view class="fixed-actions">
      <button
        class="btn outline ghost"
        :class="{
          'full-width':
            isReport ||
            userRole === 'ENTERPRISE' ||
            detail.status !== 'PENDING_ACCEPTANCE',
        }"
        @tap="handleBack"
      >
        返回
      </button>
      <button
        v-if="
          !isEdit &&
          !isReport &&
          userRole === 'INDIVIDUAL' &&
          detail.status === 'PENDING_ACCEPTANCE'
        "
        class="btn primary"
        @tap="handleAccept"
        :disabled="accepting"
      >
        接受工单
      </button>
      <!-- <button
        v-if="isEdit && userRole === 'INDIVIDUAL'"
        class="btn primary"
        @tap="handleDoneTask"
        :disabled="accepting"
      >
        {{ accepting ? "数据提交中" : "完成工单" }}
      </button> -->
    </view>
  </view>
</template>

<script>
import http from "@/apis/index.js";
import {
  getTaskDetail,
  acceptTask,
  completeTask,
  getEntTaskDetail,
} from "@/apis/modules/task.js";

export default {
  data() {
    return {
      detail: {},
      loading: false,
      accepting: false,
      workOrderId: null,
      isEdit: false,
      isDetail: false,
      isReport: true,
      process: {
        description: "",
        images: [],
        videos: [],
        tempList: [],
        remarks: "",
        result: {
          filePath: "",
          type: "", // 'image' | 'video'
          description: "",
        },
      },
      descPlaceholder: "请详细描述您的处理过程、发现的问题及解决方案…",
      userRole: uni.getStorageSync("userRole") || "INDIVIDUAL",
    };
  },
  computed: {
    isEmpty() {
      return !this.detail || Object.keys(this.detail).length === 0;
    },
  },
  onLoad(options) {
    const workOrderId = options?.id;
    if (!workOrderId) {
      uni.showToast({ title: "获取工单信息失败", icon: "none" });
      return;
    }
    this.isEdit = options?.type === "edit";
    this.isDetail = options?.type === "detail" || options?.type === "report";
    // this.isReport = options?.type === "report";

    this.fetchDetail(workOrderId);
  },
  methods: {
    async fetchDetail(workOrderId) {
      this.loading = true;
      try {
        const data = await (this.userRole === "ENTERPRISE"
          ? getEntTaskDetail(workOrderId)
          : getTaskDetail({ workOrderId }));
        this.detail = data || {};
        if (data.descriptionType === "template") {
          this.process.tempList = data.selectedTemplateItems.tempList || [];
        }
        if (data.processingInfo) {
          this.process.images = data.processingInfo.processingImages || [];
          this.process.videos = data.processingInfo.processingVideos || [];
          this.process.description = data.processingInfo.remark || "";
          let processingResult = data.processingInfo.processingResult;
          if (typeof processingResult === "string") {
            processingResult = JSON.parse(processingResult);
          }
          console.log("processingResult====>", processingResult);
          this.process.tempList = processingResult.tempList || [];
        }
      } catch (e) {
        console.error(e);
        uni.showToast({ title: "获取详情失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    getSortedOps(ops) {
      return (ops || [])
        .slice()
        .sort((a, b) => (a?.sort || 0) - (b?.sort || 0));
    },
    getSelectIndex(op) {
      const opts = Array.isArray(op?.options) ? op.options : [];
      const val = op?.value;
      const idx = opts.indexOf(val);
      return idx >= 0 ? idx : 0;
    },
    displaySelectValue(op) {
      return op?.value ?? "请选择";
    },
    handleSelectChange(gi, ii, oi, e) {
      if (this.isDetail) return;
      const op = this.process.tempList?.[gi]?.items?.[ii]?.operationItems?.[oi];
      if (!op) return;
      const opts = Array.isArray(op.options) ? op.options : [];
      const idx = Number(e?.detail?.value ?? 0);
      const selected = opts[idx] ?? "";
      this.$set(op, "value", selected);
    },
    handleTextInput(gi, ii, oi, e) {
      if (this.isDetail) return;
      const op = this.process.tempList?.[gi]?.items?.[ii]?.operationItems?.[oi];
      if (!op) return;
      const val = e?.detail?.value ?? "";
      this.$set(op, "value", val);
    },
    handleBooleanChange(gi, ii, oi, e) {
      if (this.isDetail) return;
      const op = this.process.tempList?.[gi]?.items?.[ii]?.operationItems?.[oi];
      if (!op) return;
      const v = e?.detail?.value;
      const checked = v === true || v === "true";
      this.$set(op, "value", checked);
    },
    safeText(val) {
      const s = String(val ?? "").trim();
      return s ? s : "-";
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
    formatAddress(d) {
      return this.safeText(d?.workAddress || d?.address || d?.location);
    },
    statusLabel(priority) {
      switch (priority) {
        case "URGENT":
          return "紧急";
        case "NORMAL":
          return "正常";
        case "LOW":
          return "较低";
        default:
          return priority || "-";
      }
    },
    statusClass(s) {
      const label = this.statusLabel(s);
      switch (label) {
        case "紧急":
          return "urgent";
        case "正常":
          return "normal";
        case "较低":
          return "low";
        default:
          return "unknown";
      }
    },
    async handleDoneTask() {
      console.log("完成工单===>", this.process);
      // if (!this.process.remarks || this.process.remarks.trim().length === 0) {
      //   uni.showToast({ title: "请输入备注", icon: "none" });
      //   return;
      // }
      if (
        !this.process.description ||
        this.process.description.trim().length === 0
      ) {
        uni.showToast({ title: "请输入处理结果", icon: "none" });
        return;
      }
      if (
        this.process.images.length === 0 &&
        this.process.videos.length === 0
      ) {
        uni.showToast({ title: "请上传处理结果图片或视频", icon: "none" });
        return;
      }

      const images = [];
      const videos = [];
      const imgPaths = Array.isArray(this.process.images)
        ? this.process.images
        : [];
      const vidPaths = Array.isArray(this.process.videos)
        ? this.process.videos
        : [];

      this.accepting = true;
      try {
        const [imgUploaded, vidUploaded] = await Promise.all([
          Promise.all(imgPaths.map((p) => http.upload(p))),
          Promise.all(vidPaths.map((p) => http.upload(p))),
        ]);

        images.push(
          ...(imgUploaded || []).map((r) => r?.fileUrl || r?.url || r)
        );
        videos.push(
          ...(vidUploaded || []).map((r) => r?.fileUrl || r?.url || r)
        );

        console.log("上传完成", { images, videos });

        await completeTask({
          workOrderId: this.detail?.workOrderId || this.workOrderId,
          processingImages: images,
          processingVideos: videos,
          processingResult: JSON.stringify({
            tempList: this.process.tempList,
          }),
          remark: this.process.description || "",
        });
        uni.showToast({ title: "完成工单成功", icon: "success" });
        this.handleBack();
      } catch (e) {
        console.error("上传失败", e);
        uni.showToast({ title: e.message, icon: "none" });
      } finally {
        this.accepting = false;
      }
    },
    async handleAccept() {
      if (this.accepting) return;
      const id = this.detail?.workOrderId || this.workOrderId;
      if (!id) {
        uni.showToast({ title: "缺少工单ID", icon: "none" });
        return;
      }

      const confirm = await new Promise((resolve) => {
        uni.showModal({
          title: "确认接单",
          content: `确定接受工单「${this.detail?.title || ""}」吗？`,
          success: (res) => resolve(!!res.confirm),
          fail: () => resolve(false),
        });
      });
      if (!confirm) return;

      this.accepting = true;
      try {
        await acceptTask({ workOrderId: id });
        uni.showToast({ title: "接单成功", icon: "success" });
        this.handleBack();
      } catch (e) {
        uni.showToast({ title: "接单失败，请重试", icon: "none" });
      } finally {
        this.accepting = false;
      }
    },
    handleBack() {
      const pages = getCurrentPages();
      if (pages && pages.length > 1) {
        uni.navigateBack();
      } else {
        uni.switchTab({ url: "/pages/task/index" });
      }
    },
    addImage() {
      if (this.isDetail) return;
      const remain = 9 - this.process.images.length;
      if (remain <= 0) return;
      uni.chooseImage({
        count: remain,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          const files =
            res?.tempFilePaths ||
            (Array.isArray(res?.tempFiles)
              ? res.tempFiles
                  .map((f) => f.path || f.tempFilePath)
                  .filter(Boolean)
              : []);
          this.process.images = this.process.images.concat(files).slice(0, 9);
        },
      });
    },
    previewImage(i) {
      if (!this.process.images.length) return;
      uni.previewImage({ current: i, urls: this.process.images });
    },
    removeImage(i) {
      if (this.isDetail) return;
      this.process.images.splice(i, 1);
    },
    addVideo() {
      if (this.isDetail) return;
      if (this.process.videos.length >= 3) return;
      uni.chooseVideo({
        sourceType: ["album", "camera"],
        success: (res) => {
          const path = res?.tempFilePath || res?.filePath || res?.path;
          if (path) this.process.videos.push(path);
        },
      });
    },
    previewVideo(i) {
      const urls = this.process.videos || [];
      if (typeof uni.previewMedia === "function") {
        uni.previewMedia({
          sources: urls.map((u) => ({ url: u, type: "video" })),
          current: i,
        });
      } else {
        uni.showToast({ title: "当前端暂不支持视频预览", icon: "none" });
      }
    },
    removeVideo(i) {
      if (this.isDetail) return;
      this.process.videos.splice(i, 1);
    },
    selectResultFile() {
      if (this.isDetail) return;
      if (typeof uni.chooseMedia === "function") {
        uni.chooseMedia({
          count: 1,
          mediaType: ["image", "video"],
          sourceType: ["album", "camera"],
          success: (res) => {
            const tf = Array.isArray(res?.tempFiles) ? res.tempFiles[0] : null;
            const path =
              tf?.tempFilePath || tf?.filePath || tf?.path || res?.tempFilePath;
            const type = tf?.fileType || (tf?.type || "").toLowerCase();
            if (path) {
              this.process.result.filePath = path;
              this.process.result.type = type === "video" ? "video" : "image";
            }
          },
        });
        return;
      }

      uni.showActionSheet({
        itemList: ["上传图片", "上传视频"],
        success: (r) => {
          const idx = r?.tapIndex ?? 0;
          if (idx === 0) {
            uni.chooseImage({
              count: 1,
              sizeType: ["compressed"],
              sourceType: ["album", "camera"],
              success: (res) => {
                const path = (res?.tempFilePaths || [])[0];
                if (path) {
                  this.process.result.filePath = path;
                  this.process.result.type = "image";
                }
              },
            });
          } else {
            uni.chooseVideo({
              sourceType: ["album", "camera"],
              success: (res) => {
                const path = res?.tempFilePath || res?.filePath || res?.path;
                if (path) {
                  this.process.result.filePath = path;
                  this.process.result.type = "video";
                }
              },
            });
          }
        },
      });
    },
    previewResultFile() {
      const { filePath, type } = this.process.result || {};
      if (!filePath) return;
      if (type === "image") {
        uni.previewImage({ urls: [filePath] });
      } else if (typeof uni.previewMedia === "function") {
        uni.previewMedia({ sources: [{ url: filePath, type: "video" }] });
      } else {
        uni.showToast({ title: "当前端暂不支持视频预览", icon: "none" });
      }
    },
    removeResultFile() {
      if (this.isDetail) return;
      this.process.result.filePath = "";
      this.process.result.type = "";
    },
  },
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f7f8fa;
  padding: 124rpx 24rpx 64rpx;
  box-sizing: border-box;
}

.card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 12rpx 28rpx rgba(0, 0, 0, 0.08);
  margin-bottom: 24rpx;
  position: relative;
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
  font-size: 36rpx;
  font-weight: 700;
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

.status-tag.urgent {
  background: #ff4d4f;
}
.status-tag.normal {
  background: #faad14;
}
.status-tag.low {
  background: #14cccc;
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
  width: 160rpx;
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

.section {
  margin-top: 4rpx;
}
.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #222;
}
.sub-label {
  position: relative;
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #888;
  padding-left: 20rpx;
}
.sub-label::before {
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
.section-text {
  margin-top: 6rpx;
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.loading,
.empty {
  text-align: center;
  color: #888;
  font-size: 26rpx;
  padding: 12rpx 0;
}

.fixed-actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 24rpx calc(20rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: saturate(180%) blur(8px);
  border-top: 2rpx solid #f0f0f0;
  box-shadow: 0 -6rpx 24rpx rgba(0, 0, 0, 0.06);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  z-index: 10;
}

.fixed-actions .btn {
  height: 88rpx;
  width: 240rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 120ms ease, box-shadow 160ms ease,
    background-color 160ms ease, color 160ms ease, border-color 160ms ease;
}
.fixed-actions .btn:active {
  transform: scale(0.98);
}

.fixed-actions .btn.primary {
  background: linear-gradient(135deg, #14cccc, #0aa2c2);
  color: #ffffff;
  box-shadow: 0 8rpx 20rpx rgba(20, 204, 204, 0.25),
    0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  border: none;
}
.fixed-actions .btn.primary[disabled] {
  opacity: 0.6;
  box-shadow: none;
  filter: grayscale(15%);
}

.fixed-actions .btn.full-width {
  width: 700rpx;
}

.fixed-actions .btn.outline {
  background-color: #ffffff;
  color: #14cccc;
  border: 2rpx solid rgba(20, 204, 204, 0.65);
}
.fixed-actions .btn.outline.ghost {
  background: rgba(20, 204, 204, 0.06);
  border-color: rgba(20, 204, 204, 0.3);
}
.fixed-actions .btn.outline:active {
  border-color: #14cccc;
  background: rgba(20, 204, 204, 0.12);
}

.info-card .card-header.header-soft {
  background: linear-gradient(
    120deg,
    rgba(20, 204, 204, 0.08),
    rgba(0, 122, 204, 0.06)
  );
  padding: 16rpx 16rpx;
  border-radius: 12rpx;
  margin: -8rpx -8rpx 8rpx;
}
.info-card .card-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #222;
  letter-spacing: 0.5rpx;
}

.divider.divider-soft {
  height: 2rpx;
  margin: 14rpx 0 8rpx;
  background: linear-gradient(
    90deg,
    rgba(20, 204, 204, 0.16),
    rgba(0, 122, 204, 0.12)
  );
}

.card-body.body-compact {
  gap: 14rpx;
}
.row {
  display: flex;
  align-items: center;
}
.label {
  width: 160rpx;
  font-size: 26rpx;
  color: #7a8a8a;
}
.value {
  flex: 1;
  font-size: 30rpx;
  color: #2a2a2a;
}
.address {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  font-size: 26rpx;
  color: #155e63;
  background-color: rgba(20, 204, 204, 0.12);
  border: 2rpx solid rgba(20, 204, 204, 0.35);
  box-shadow: 0 4rpx 12rpx rgba(20, 204, 204, 0.12);
}

.group-card {
  margin-top: 16rpx;
  padding: 24rpx;
}

.process-card.no-elevated {
  padding: 0;
}
.process-card.no-elevated::before {
  display: none;
}

.process-card .textarea {
  margin-top: 8rpx;
  width: 100%;
  min-height: 180rpx;
  padding: 18rpx;
  border-radius: 12rpx;
  background: #fff;
  border: 2rpx solid #eaeaea;
  font-size: 28rpx;
  line-height: 1.6;
  box-sizing: border-box;
}
.process-card .counter {
  margin-top: 8rpx;
  text-align: right;
  font-size: 24rpx;
  color: #888;
}
.upload-grid {
  margin-top: 12rpx;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18rpx;
}
.thumb {
  position: relative;
  height: 200rpx;
  border: 2rpx dashed #d9d9d9;
  border-radius: 16rpx;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.thumb.add {
  background: #fff;
}
.thumb-img {
  width: 100%;
  height: 100%;
}
.plus {
  font-size: 48rpx;
  color: #14cccc;
  line-height: 1;
}
.hint {
  margin-top: 6rpx;
  font-size: 24rpx;
  color: #888;
}
.thumb-remove {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 999rpx;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.thumb.video .video-placeholder {
  width: 72rpx;
  height: 72rpx;
  border-radius: 999rpx;
  background: #14cccc;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(20, 204, 204, 0.25);
}
.video-label {
  font-size: 26rpx;
  font-weight: 700;
}

.container {
  padding-bottom: 160rpx;
}

.process-card .op-group {
  margin-top: 12rpx;
}
.process-card .op-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.process-card .op-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 0;
  border-bottom: 2rpx dashed #eee;
}
.process-card .op-name {
  font-size: 28rpx;
  color: #333;
}
.process-card .req {
  color: #ff4d4f;
  margin-left: 6rpx;
}
.process-card .op-control {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.process-card .op-input,
.process-card .picker-value {
  min-width: 260rpx;
  padding: 14rpx;
  border: 2rpx solid #eaeaea;
  border-radius: 12rpx;
  background: #fff;
  font-size: 28rpx;
  color: #333;
}
.process-card .checkbox-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.process-card .op-unknown {
  font-size: 26rpx;
  color: #999;
}

.process-card .op-row {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: initial;
  padding: 12rpx 0;
  border-bottom: 2rpx dashed #eee;
}
.process-card .op-name {
  font-size: 28rpx;
  color: #333;
}
.process-card .op-control {
  width: 100%;
  margin-top: 12rpx;
  display: block;
}
.process-card .op-input,
.process-card .picker-value {
  width: 100%;
  min-width: 0;
  padding: 14rpx;
  border: 2rpx solid #eaeaea;
  border-radius: 12rpx;
  background: #fff;
  font-size: 28rpx;
  color: #333;
}
.process-card .checkbox-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12rpx;
  justify-content: flex-start;
}

.upload-grid.single {
  grid-template-columns: 1fr;
}

.result-card .textarea {
  width: 100%;
  min-height: 180rpx;
  padding: 18rpx;
  border-radius: 12rpx;
  background: #fff;
  border: 2rpx solid #eaeaea;
  font-size: 28rpx;
  line-height: 1.6;
  box-sizing: border-box;
}
.result-card .counter {
  margin-top: 8rpx;
  text-align: right;
  font-size: 24rpx;
  color: #888;
}

.process-card.comfortable {
  padding: 8rpx 0;
  background: transparent;
}
.process-card.comfortable .group-card {
  margin-top: 20rpx;
  padding: 26rpx 24rpx;
  border-radius: 18rpx;
  background: #fff;
  border: 2rpx solid #eef1f3;
  box-shadow: 0 10rpx 24rpx rgba(0, 0, 0, 0.04);
}
.process-card.comfortable .section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2d3d;
}
.process-card.comfortable .sub-section {
  margin-top: 14rpx;
}
.process-card.comfortable .sub-label {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #4b5967;
  margin-bottom: 8rpx;
}
.process-card.comfortable .op-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.process-card.comfortable .op-row {
  border: none;
  background: #f9fbfc;
  padding: 18rpx;
  border-radius: 14rpx;
  box-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.03);
}
.process-card.comfortable .op-name {
  font-size: 30rpx;
  color: #2f3a48;
  font-weight: 600;
}
.process-card.comfortable .req {
  display: inline-flex;
  align-items: center;
  margin-left: 8rpx;
  padding: 0 8rpx;
  height: 28rpx;
  border-radius: 999rpx;
  background-color: rgba(255, 77, 79, 0.12);
  color: #ff4d4f;
  font-size: 24rpx;
}
.process-card.comfortable .op-control {
  width: 100%;
  margin-top: 12rpx;
}
.process-card.comfortable .op-input,
.process-card.comfortable .picker-value {
  width: 100%;
  min-height: 72rpx;
  padding: 16rpx;
  border-radius: 12rpx;
  border: 2rpx solid #e6eaef;
  background: #fff;
  font-size: 28rpx;
  color: #333;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.process-card.comfortable .op-input:focus,
.process-card.comfortable .picker-value:focus {
  border-color: #14cccc;
  box-shadow: 0 0 0 4rpx rgba(20, 204, 204, 0.15);
}
.process-card.comfortable .op-input[disabled],
.process-card.comfortable .picker-value[disabled] {
  background: #f5f7fa;
  color: #999;
}
.process-card.comfortable .checkbox-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12rpx;
  justify-content: flex-start;
  padding: 12rpx 14rpx;
  background: #fff;
  border: 2rpx solid #e6eaef;
  border-radius: 12rpx;
}

.process-card.comfortable .checkbox-text {
  font-size: 28rpx;
  color: #4b5967;
}

.process-card.comfortable .op-unknown {
  font-size: 26rpx;
  color: #99a2aa;
}
</style>
