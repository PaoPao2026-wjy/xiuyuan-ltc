<template>
  <view class="container">
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>
    <view v-else-if="!tempList || tempList.length === 0" class="empty">
      <text>暂无配置项</text>
    </view>
    <view v-else class="content">
        
      <view class="progress-bar">
        <text class="progress-text">步骤 {{ currentStep + 1 }} / {{ totalSteps }}</text>
        <view class="progress-track">
          <view 
            class="progress-fill" 
            :style="{ width: ((currentStep + 1) / totalSteps) * 100 + '%' }"
          ></view>
        </view>
      </view>

      <view v-if="!isConfirmStep" class="card group-card">
        <view class="section">
          <text class="section-title">{{ currentGroup.name }}</text>
        </view>
        <view class="divider"></view>

        <view class="form-content">
          <view
            class="sub-section"
            v-for="(item, ii) in currentGroup.items || []"
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
                    :disabled="isReadOnly"
                    @change="handleSelectChange(ii, oi, $event)"
                  >
                    <view class="picker-value" :class="{ disabled: isReadOnly }">{{ displaySelectValue(op) }}</view>
                  </picker>

                  <!-- TEXT -->
                  <input
                    v-else-if="op.type === 'TEXT'"
                    class="op-input"
                    :class="{ disabled: isReadOnly }"
                    type="text"
                    :value="String(op.value || '')"
                    :disabled="isReadOnly"
                    placeholder="请输入"
                    @input="handleTextInput(ii, oi, $event)"
                  />

                  <!-- BOOLEAN -->
                  <radio-group
                    v-else-if="op.type === 'BOOLEAN'"
                    @change="handleBooleanChange(ii, oi, $event)"
                  >
                    <view class="checkbox-row">
                      <label class="radio-item">
                        <radio
                          value="true"
                          :checked="op.value === true"
                          color="#14cccc"
                          :disabled="isReadOnly"
                        />
                        <text class="checkbox-text">正常</text>
                      </label>
                      <label class="radio-item">
                        <radio
                          value="false"
                          :checked="op.value === false"
                          color="#14cccc"
                          :disabled="isReadOnly"
                        />
                        <text class="checkbox-text">异常</text>
                      </label>
                    </view>
                  </radio-group>
                  
                  <text v-else class="op-unknown">暂不支持类型：{{ op.type }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      
      <view v-else class="card group-card">
        <view class="section">
          <text class="section-title">处理结果确认</text>
        </view>
        <view class="divider"></view>
        
        <view class="form-content">
           <view class="sub-section">
             <text class="sub-label">处理现场照片 <text class="required">*</text><text class="sub-desc">（最多9张）</text></text>
             <view class="upload-grid">
               <view
                 v-for="(img, index) in processingImages"
                 :key="index"
                 class="upload-item"
                 @tap="handlePreviewImage(index)"
               >
                 <image :src="img" mode="aspectFill" class="upload-img" />
                 <view class="remove-btn" @tap.stop="handleRemoveImage(index)" v-if="!isReadOnly">
                   <text class="remove-text">×</text>
                 </view>
               </view>
               <view
                 v-if="processingImages.length < 9 && !isReadOnly"
                 class="upload-add"
                 @tap="handleChooseImages"
               >
                 <text class="add-symbol">+</text>
                 <text class="add-text">照片</text>
               </view>
             </view>
           </view>

           <view class="sub-section">
             <text class="sub-label">处理现场视频 <text class="required">*</text><text class="sub-desc">（最多3个）</text></text>
             <view class="upload-grid">
               <view
                 v-for="(video, index) in processingVideos"
                 :key="index"
                 class="upload-item"
                 @tap="handlePreviewVideo(index)"
               >
                 <view class="video-placeholder">
                   <text class="video-label">视频{{ index + 1 }}</text>
                 </view>
                 <view class="remove-btn" @tap.stop="handleRemoveVideo(index)" v-if="!isReadOnly">
                   <text class="remove-text">×</text>
                 </view>
               </view>
               <view
                 v-if="processingVideos.length < 3 && !isReadOnly"
                 class="upload-add"
                 @tap="handleChooseVideo"
               >
                 <text class="add-symbol">+</text>
                 <text class="add-text">视频</text>
               </view>
             </view>
           </view>

           <view class="sub-section">
             <text class="sub-label">备注</text>
             <textarea
               v-model="remark"
               class="op-input textarea"
               :class="{ disabled: isReadOnly }"
               placeholder="请输入备注信息..."
               maxlength="200"
               auto-height
               :disabled="isReadOnly"
             />
           </view>
        </view>
      </view>

      <!-- Buttons -->
      <view class="footer-actions">
        <button
          v-if="currentStep > 0"
          class="btn outline"
          @tap="handlePrev"
          :disabled="updating"
        >
          上一页
        </button>
        <button
          class="btn primary"
          @tap="handleNext"
          :loading="updating"
          v-if="!isReadOnly || !isLastStep"
        >
          {{ isLastStep ? '完成' : '下一页' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import http from "@/apis/index.js";
import { getTaskDetail, updateTaskProcessingResult, completeTask } from "@/apis/modules/task.js";

export default {
  data() {
    return {
      workOrderId: "",
      loading: false,
      updating: false,
      tempList: [],
      currentStep: 0,
      groupSnapshot: "",
      processingImages: [],
      processingVideos: [],
      remark: "",
      taskStatus: "", 
    };
  },
  computed: {
    isReadOnly() {
      return this.taskStatus === "COMPLETED";
    },
    totalSteps() {
      // tempList items + 1 confirmation step
      return (this.tempList.length || 0) + 1;
    },
    currentGroup() {
      return this.tempList[this.currentStep] || {};
    },
    isLastStep() {
      return this.currentStep === this.totalSteps - 1;
    },
    isConfirmStep() {
      return this.currentStep === this.tempList.length;
    }
  },
  onLoad(options) {
    this.workOrderId = options.id;
    if (this.workOrderId) {
      this.fetchDetail();
    } else {
      uni.showToast({ title: "参数错误", icon: "none" });
    }
  },
  methods: {
    async fetchDetail() {
      this.loading = true;
      try {
        const res = await getTaskDetail({ workOrderId: this.workOrderId });
        this.taskStatus = res.status; // Save status
        
        let savedTempList = [];
        if (res.processingInfo && res.processingInfo.processingResult) {
          try {
            let resultObj = res.processingInfo.processingResult;
            if (typeof resultObj === "string") {
              resultObj = JSON.parse(resultObj);
            }
            if (resultObj && Array.isArray(resultObj.tempList)) {
              savedTempList = resultObj.tempList;
            }
          } catch (e) {
            console.error("Failed to parse processingResult", e);
          }
          // Restore other fields if available in processingInfo
          if (res.processingInfo.processingImages) {
             this.processingImages = res.processingInfo.processingImages;
          }
          if (res.processingInfo.processingVideos) {
             this.processingVideos = res.processingInfo.processingVideos;
          }
          if (res.processingInfo.remark) {
             this.remark = res.processingInfo.remark;
          }
        }
        
        if (savedTempList.length > 0) {
           this.tempList = savedTempList;
        } else if (res.selectedTemplateItems && res.selectedTemplateItems.tempList) {
          this.tempList = res.selectedTemplateItems.tempList;
        } else {
          this.tempList = [];
        }
        this.initGroupSnapshot();
      } catch (e) {
        console.error(e);
        uni.showToast({ title: "获取详情失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    
    initGroupSnapshot() {
      if (this.isConfirmStep) {
         this.groupSnapshot = JSON.stringify({
            images: this.processingImages,
            videos: this.processingVideos,
            remark: this.remark
         });
      } else {
         this.groupSnapshot = JSON.stringify(this.currentGroup);
      }
    },

    hasGroupChanged() {
      if (this.isConfirmStep) {
         const current = JSON.stringify({
            images: this.processingImages,
            videos: this.processingVideos,
            remark: this.remark
         });
         return this.groupSnapshot !== current;
      }
      return this.groupSnapshot !== JSON.stringify(this.currentGroup);
    },

    async saveProgress() {
      if (this.isReadOnly) return true; 

      if (!this.hasGroupChanged()) {
        return true;
      }
      
      this.updating = true;
      try {
        const params = {
          workOrderId: +this.workOrderId,
          processingResult: {
            tempList: this.tempList 
          },
          processingImages: this.processingImages,
          processingVideos: this.processingVideos,
          remark: this.remark
        };
        await updateTaskProcessingResult(params);
        this.initGroupSnapshot();
        return true;
      } catch (e) {
        console.error(e);
        uni.showToast({ title: "保存失败", icon: "none" });
        return false;
      } finally {
        this.updating = false;
      }
    },

    async handlePrev() {
      if (this.currentStep > 0) {
        const success = await this.saveProgress();
        if (success) {
          this.currentStep--;
          this.initGroupSnapshot();
        }
      }
    },

    async handleNext() {
      if (!this.validateCurrentStep()) return;

      const success = await this.saveProgress();
      if (!success) return;

      if (this.isLastStep) {
        this.handleComplete();
      } else {
        this.currentStep++;
        this.initGroupSnapshot();
      }
    },

    async handleComplete() {
      this.updating = true;
      if(!this.processingImages.length) {
        uni.showToast({ title: "请上传处理现场照片", icon: "none" });
        return;
      }
      if(!this.processingVideos.length) {
        uni.showToast({ title: "请上传处理现场视频", icon: "none" });
        return;
      }
      try {
        const params = {
           workOrderId: +this.workOrderId,
           processingResult: JSON.stringify({
             tempList: this.tempList
           }),
           processingImages: this.processingImages,
           processingVideos: this.processingVideos,
           remark: this.remark
        };
        await completeTask(params);
        uni.showToast({ title: "工单已完成", icon: "success" });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      } catch(e) {
         console.error(e);
         uni.showToast({ title: "提交失败", icon: "none" });
      } finally {
         this.updating = false;
      }
    },

    validateCurrentStep() {
      if (this.isConfirmStep) {
         return true; 
      }

      const group = this.currentGroup;
      if (!group || !group.items) return true;

      for (const item of group.items) {
        if (!item.operationItems) continue;
        for (const op of item.operationItems) {
          if (op.name === "备注") continue;

          let isFilled = false;
          if (op.type === "BOOLEAN") {
            isFilled = typeof op.value === "boolean";
          } else {
            isFilled =
              op.value !== null &&
              op.value !== undefined &&
              String(op.value).trim() !== "";
          }

          if (!isFilled) {
            const msg = `${item.name}${op.name ? "-" + op.name : ""} 未填写`;
            uni.showToast({ title: msg, icon: "none" });
            return false;
          }
        }
      }
      return true;
    },

    validateForm() {
      return true;
    },

    handleChooseImages() {
      if (this.processingImages.length >= 9) return;
      uni.chooseImage({
        count: 9 - this.processingImages.length,
        success: async (res) => {
          const tempFilePaths = res.tempFilePaths;
          uni.showLoading({ title: "上传中..." });
          try {
            const uploadPromises = tempFilePaths.map((path) => http.upload(path));
            const results = await Promise.all(uploadPromises);
            results.forEach((r) => {
              if (r?.fileUrl) {
                this.processingImages.push(r.fileUrl);
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
      this.processingImages.splice(index, 1);
    },
    handlePreviewImage(index) {
      uni.previewImage({
        current: this.processingImages[index],
        urls: this.processingImages,
      });
    },
    handleChooseVideo() {
       if (this.processingVideos.length >= 3) return;
       uni.chooseVideo({
          count: 1,
          success: async (res) => {
             const tempFilePath = res.tempFilePath;
             uni.showLoading({ title: "上传中..." });
             try {
                const r = await http.upload(tempFilePath);
                if (r?.fileUrl) {
                   this.processingVideos.push(r.fileUrl);
                }
             } catch(error) {
                console.error(error);
                uni.showToast({ title: "上传失败", icon: "none" });
             } finally {
                uni.hideLoading();
             }
          }
       })
    },
    handleRemoveVideo(index) {
       this.processingVideos.splice(index, 1);
    },
    handlePreviewVideo(index) {
       console.log("Preview video", this.processingVideos[index]);
    },

    
    getSortedOps(ops) {
      return (ops || []).slice().sort((a, b) => (a?.sort || 0) - (b?.sort || 0));
    },
    getSelectIndex(op) {
      const opts = Array.isArray(op?.options) ? op.options : [];
      return Math.max(0, opts.indexOf(op?.value));
    },
    displaySelectValue(op) {
      return op?.value ?? "请选择";
    },
    handleSelectChange(ii, oi, e) {
      const op = this.currentGroup.items[ii].operationItems[oi];
      const opts = op.options || [];
      const idx = Number(e.detail.value);
      this.$set(op, "value", opts[idx] || "");
    },
    handleTextInput(ii, oi, e) {
      const op = this.currentGroup.items[ii].operationItems[oi];
      this.$set(op, "value", e.detail.value);
    },
    handleBooleanChange(ii, oi, e) {
      const op = this.currentGroup.items[ii].operationItems[oi];
      const val = e.detail.value;
      this.$set(op, "value", val === "true" || val === true);
    }
  }
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  padding: 30rpx;
  box-sizing: border-box;
}

.loading, .empty {
  text-align: center;
  margin-top: 100rpx;
  color: #999;
}

.content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.progress-bar {
  margin-bottom: 30rpx;
}

.progress-text {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
  text-align: right;
}

.progress-track {
  height: 8rpx;
  background: #e0e0e0;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #14cccc;
  transition: width 0.3s ease;
}

.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  margin-bottom: 30rpx;
}


.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.divider {
  height: 1rpx;
  background: #eee;
  margin: 20rpx 0;
}

.sub-section {
  margin-bottom: 40rpx;
}

.sub-label {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 24rpx;
  display: block;
}

.sub-desc {
  font-size: 24rpx;
  color: #999;
  font-weight: normal;
}

.op-row {
  margin-bottom: 30rpx;
}

.op-name {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.req {
  color: #ff4d4f;
  margin-left: 4rpx;
}

.op-control {
  margin-top: 10rpx;
}

.op-input {
  background: #f7f8fa;
  padding: 20rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.picker-value {
  background: #f7f8fa;
  padding: 20rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333;
}

.checkbox-row {
  display: flex;
  gap: 40rpx;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.checkbox-text {
  font-size: 28rpx;
  color: #333;
}

.op-input.disabled,
.picker-value.disabled {
  background-color: #f0f0f0;
  color: #999;
}
.op-unknown {
  color: #999;
  font-size: 24rpx;
}

.footer-actions {
  margin-top: 30rpx;
  display: flex;
  gap: 30rpx;
}

.btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  text-align: center;
}

.btn.primary {
  background: linear-gradient(135deg, #14cccc, #007acc);
  color: #fff;
}

.btn.outline {
  background: #fff;
  color: #666;
  border: 1rpx solid #ddd;
}

.textarea {
  min-height: 160rpx;
  width: 100%;
  box-sizing: border-box;
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
.video-placeholder {
  width: 100%;
  height: 100%;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.video-label {
  color: #fff;
  font-size: 24rpx;
}
</style>