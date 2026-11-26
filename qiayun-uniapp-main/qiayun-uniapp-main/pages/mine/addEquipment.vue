<template>
  <view class="container">
    <view class="header">
      <text class="title">新增设备</text>
      <text class="step-indicator" v-if="totalSteps > 1">
        {{ currentStep + 1 }} / {{ totalSteps }}
      </text>
    </view>

    <!-- Step 0: Basic Info -->
    <view class="form" v-if="currentStep === 0">
      <view class="form-item">
        <text class="label">设备名称 <text class="required">*</text></text>
        <input
          class="input"
          maxlength="50"
          placeholder="请输入设备名称"
          :value="form.name"
          @input="onInput('name', $event)"
        />
      </view>
      <view class="form-item">
        <text class="label">设备编号 <text class="required">*</text></text>
        <input
          class="input"
          maxlength="50"
          placeholder="请输入设备编号"
          :value="form.equipmentNo"
          @input="onInput('equipmentNo', $event)"
        />
      </view>

      <view class="form-item">
        <text class="label">设备类型 <text class="required">*</text></text>
        <picker
          mode="selector"
          :range="typeOptions"
          range-key="label"
          :value="getTypeIndex(form.type)"
          @change="handleTypeChange"
        >
          <view class="picker-display">
            <text class="picker-text">{{
              getTypeLabel(form.type) || "请选择设备类型"
            }}</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>
      <view class="form-item">
        <text class="label">设备模板</text>
        <picker
          mode="selector"
          :range="templateInfo"
          range-key="name"
          @change="handleTemplateChange"
        >
          <view class="picker-display">
            <text class="picker-text">{{
              form.templateName || "请选择设备模板"
            }}</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>
      <view class="form-item">
        <text class="label">出厂日期 <text class="required">*</text></text>
        <picker
          mode="date"
          :value="getDateValue(form.manufactureDate)"
          @change="handleManufactureDateChange"
        >
          <view class="picker-display">
            <text class="picker-text">{{
              getDateDisplay(form.manufactureDate) || "请选择出厂日期"
            }}</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">设备铭牌照片 <text class="required">*</text></text>
        <view class="upload-grid">
          <view
            v-for="(img, idx) in form.nameplatePhoto"
            :key="'np-' + idx"
            class="upload-item"
            @tap="handlePreview('nameplatePhoto', idx)"
          >
            <image class="upload-img" :src="img" mode="aspectFit" />
            <view class="remove" @tap.stop="handleRemove('nameplatePhoto', idx)"
              >✕</view
            >
          </view>

          <view
            v-if="form.nameplatePhoto.length < maxNameplateImages"
            class="upload-add"
            @tap="handleChooseImages('nameplatePhoto', maxNameplateImages)"
          >
            <view class="add-plus">＋</view>
            <text class="add-tip">添加图片</text>
          </view>
        </view>
        <text class="count-tip"
          >{{ form.nameplatePhoto.length }}/{{ maxNameplateImages }}</text
        >
      </view>

      <view class="form-item">
        <text class="label">设备照片 <text class="required">*</text></text>
        <view class="upload-grid">
          <view
            v-for="(img, idx) in form.devicePhotos"
            :key="'dp-' + idx"
            class="upload-item"
            @tap="handlePreview('devicePhotos', idx)"
          >
            <image class="upload-img" :src="img" mode="aspectFit" />
            <view class="remove" @tap.stop="handleRemove('devicePhotos', idx)"
              >✕</view
            >
          </view>

          <view
            v-if="form.devicePhotos.length < maxImages"
            class="upload-add"
            @tap="handleChooseImages('devicePhotos', maxImages)"
          >
            <view class="add-plus">＋</view>
            <text class="add-tip">添加图片</text>
          </view>
        </view>
        <text class="count-tip"
          >{{ form.devicePhotos.length }}/{{ maxImages }}</text
        >
      </view>

      <view class="form-item">
        <text class="label">备注</text>
        <textarea
          class="textarea"
          :value="form.remarks"
          placeholder="可填写额外说明"
          auto-height
          @input="onInput('remarks', $event)"
        />
      </view>
    </view>

    <!-- Step > 0: Dynamic Form -->
    <view class="form" v-if="currentStep > 0">
      <template v-if="currentStepInfo.type === 'USER_BASIC'">
        <view class="section-title">基本信息</view>
        <view
          class="form-item"
          v-for="(field, idx) in defaultStructure.userBasicInfo"
          :key="'ub-' + idx"
        >
          <text class="label">{{ field.name }}</text>

          <!-- TEXT -->
          <input
            v-if="field.type === 'TEXT'"
            class="input"
            :value="field.value"
            @input="onDynamicInput(field, $event)"
            placeholder="请输入"
          />

          <!-- NUMBER -->
          <view v-else-if="field.type === 'NUMBER'" class="input-with-unit">
            <input
              class="input"
              type="number"
              :value="field.value"
              @input="onDynamicInput(field, $event)"
              placeholder="请输入"
            />
            <text v-if="field.unit" class="unit-text">{{ field.unit }}</text>
          </view>

          <!-- DATE -->
          <picker
            v-else-if="field.type === 'DATE'"
            mode="date"
            :value="field.value"
            @change="onDynamicDateChange(field, $event)"
          >
            <view class="picker-display">
              <text class="picker-text">{{ field.value || "请选择日期" }}</text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>
      </template>

      <template v-else-if="currentStepInfo.type === 'EQUIPMENT_ITEM'">
        <view class="section-title">
          配置项 {{ currentStepInfo.index + 1 }}
        </view>

        <!-- Main Fields -->
        <view
          class="form-item"
          v-for="(field, idx) in getCurrentEquipmentItem().fields"
          :key="'ef-' + idx"
        >
          <text class="label">{{ field.name }}</text>

          <!-- TEXT -->
          <input
            v-if="field.type === 'TEXT'"
            class="input"
            :value="field.value"
            @input="onDynamicInput(field, $event)"
            placeholder="请输入"
          />

          <!-- NUMBER -->
          <view v-else-if="field.type === 'NUMBER'" class="input-with-unit">
            <input
              class="input"
              type="number"
              :value="field.value"
              @input="onDynamicInput(field, $event)"
              placeholder="请输入"
            />
            <text v-if="field.unit" class="unit-text">{{ field.unit }}</text>
          </view>

          <!-- DATE -->
          <picker
            v-else-if="field.type === 'DATE'"
            mode="date"
            :value="field.value"
            @change="onDynamicDateChange(field, $event)"
          >
            <view class="picker-display">
              <text class="picker-text">{{ field.value || "请选择日期" }}</text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>

        <!-- Sub Modules -->
        <view
          v-for="(sub, sIdx) in getCurrentEquipmentItem().subModules"
          :key="'sub-' + sIdx"
          class="sub-module"
        >
          <view class="sub-title">{{ sub.name }}</view>
          <view
            class="form-item"
            v-for="(field, fIdx) in sub.fields"
            :key="'sf-' + sIdx + '-' + fIdx"
          >
            <text class="label">{{ field.name }}</text>

            <!-- TEXT -->
            <input
              v-if="field.type === 'TEXT'"
              class="input"
              :value="field.value"
              @input="onDynamicInput(field, $event)"
              placeholder="请输入"
            />

            <!-- NUMBER -->
            <view v-else-if="field.type === 'NUMBER'" class="input-with-unit">
              <input
                class="input"
                type="number"
                :value="field.value"
                @input="onDynamicInput(field, $event)"
                placeholder="请输入"
              />
              <text v-if="field.unit" class="unit-text">{{ field.unit }}</text>
            </view>

            <!-- DATE -->
            <picker
              v-else-if="field.type === 'DATE'"
              mode="date"
              :value="field.value"
              @change="onDynamicDateChange(field, $event)"
            >
              <view class="picker-display">
                <text class="picker-text">{{
                  field.value || "请选择日期"
                }}</text>
                <text class="picker-arrow">›</text>
              </view>
            </picker>
          </view>
        </view>
      </template>
    </view>

    <view class="btn-wrap footer-actions">
      <button
        v-if="currentStep > 0"
        class="btn outline"
        :disabled="submitting"
        @tap="handlePrev"
      >
        上一页
      </button>
      <button class="btn primary" :disabled="submitting" @tap="handleNext">
        {{ submitting ? "提交中..." : isLastStep ? "完成" : "下一页" }}
      </button>
    </view>
  </view>
</template>

<script>
import http from "@/apis/index.js";
import {
  addEquipment,
  getEquipment,
  updateEquipment,
  getDefaultTemplate,
} from "@/apis/modules/equipment.js";
export default {
  data() {
    return {
      form: {
        equipmentNo: "",
        name: "",
        type: "",
        nameplatePhoto: [],
        devicePhotos: [],
        remarks: "",
        manufactureDate: "",
        templateName: "",
      },
      typeOptions: [
        { value: "HIGH_VOLTAGE_CABINET", label: "高压柜" },
        { value: "TRANSFORMER", label: "变压器" },
        { value: "LOW_VOLTAGE_CABINET", label: "低压柜" },
      ],
      maxImages: 9,
      maxNameplateImages: 1,
      submitting: false,
      isUpdate: false,
      equipmentId: "",
      templateInfo: [],
      defaultStructure: {},
      currentStep: 0,
      snapshot: "",
    };
  },
  computed: {
    steps() {
      const steps = [{ type: "BASIC" }];
      if (
        this.defaultStructure &&
        this.defaultStructure.userBasicInfo &&
        this.defaultStructure.userBasicInfo.length > 0
      ) {
        steps.push({ type: "USER_BASIC" });
      }
      if (
        this.defaultStructure &&
        this.defaultStructure.equipmentBasicInfo &&
        this.defaultStructure.equipmentBasicInfo.length > 0
      ) {
        this.defaultStructure.equipmentBasicInfo.forEach((item, index) => {
          steps.push({ type: "EQUIPMENT_ITEM", index });
        });
      }
      return steps;
    },
    totalSteps() {
      return this.steps.length;
    },
    currentStepInfo() {
      return this.steps[this.currentStep] || {};
    },
    isLastStep() {
      return this.currentStep === this.totalSteps - 1;
    },
  },
  onLoad(options) {
    const id = options?.id || "";
    if (id) {
      this.getEquipmentDetail(id);
      this.isUpdate = true;
      this.equipmentId = id;
      uni.setNavigationBarTitle({
        title: "设备编辑",
      });
    } else {
      // Init snapshot for new equipment (empty structure)
      this.updateSnapshot();
    }
  },
  methods: {
    updateSnapshot() {
      this.snapshot = JSON.stringify(this.defaultStructure);
    },
    hasChanges() {
      return this.snapshot !== JSON.stringify(this.defaultStructure);
    },
    getCurrentEquipmentItem() {
      if (this.currentStepInfo.type === "EQUIPMENT_ITEM") {
        return this.defaultStructure.equipmentBasicInfo[
          this.currentStepInfo.index
        ];
      }
      return {};
    },
    onDynamicInput(field, e) {
      this.$set(field, "value", e.detail.value);
    },
    onDynamicDateChange(field, e) {
      this.$set(field, "value", e.detail.value);
    },

    async handlePrev() {
      if (this.currentStep <= 0) return;

      // Check for changes and save if needed
      if (this.hasChanges()) {
        const success = await this.saveData(true); // true = silent/update mode
        if (!success) return;
      }

      this.currentStep--;
    },

    async handleNext() {
      if (this.currentStep === 0) {
        const { equipmentNo, name, type, manufactureDate } = this.form;
        if (!this.defaultStructure || !this.defaultStructure.userBasicInfo) {
          uni.showToast({ title: "请选择设备模板", icon: "none" });
          return;
        }
        if (!String(equipmentNo || "").trim()) {
          uni.showToast({ title: "请填写设备编号", icon: "none" });
          return;
        }
        if (!String(name || "").trim()) {
          uni.showToast({ title: "请填写设备名称", icon: "none" });
          return;
        }
        if (!type) {
          uni.showToast({ title: "请选择设备类型", icon: "none" });
          return;
        }
        if (!manufactureDate) {
          uni.showToast({ title: "请选择生产日期", icon: "none" });
          return;
        }
        if (this.form.nameplatePhoto.length === 0) {
          uni.showToast({ title: "请上传设备铭牌照片", icon: "none" });
          return;
        }

        if (this.form.devicePhotos.length === 0) {
          uni.showToast({ title: "请上传设备照片", icon: "none" });
          return;
        }


        const success = await this.saveData();
        if (success) {
          if (this.isLastStep) {
            uni.navigateBack();
          } else {
            this.currentStep++;
          }
        }
      } else {
        // Dynamic Steps
        if (this.hasChanges()) {
          const success = await this.saveData(true);
          if (!success) return;
        }

        if (this.isLastStep) {
          uni.showToast({ title: "保存成功", icon: "success" });
          setTimeout(() => uni.navigateBack(), 600);
        } else {
          this.currentStep++;
        }
      }
    },

    // Save Data
    // silent: if true, implies update only and maybe less UI feedback (optional)
    async saveData(silent = false) {
      this.submitting = true;
      try {
        // Upload images if needed (only for Step 0, but good to check always if they changed)
        // For optimization, we could skip image upload if not on Step 0 and images didn't change.
        // But for simplicity, we check them. The helper `uploadList` handles URLs efficiently.

        const uploadList = async (list) => {
          const arr = Array.isArray(list) ? list : [];
          const out = [];
          for (let i = 0; i < arr.length; i++) {
            const p = arr[i];
            if (p.indexOf("qiayun") > -1) {
              out.push(p);
            } else {
              const res = await http.upload(p);
              const url = res.fileUrl;
              if (url) out.push(url);
            }
          }
          return out;
        };

        const nameplateUrls = await uploadList(this.form.nameplatePhoto);
        const deviceUrls = await uploadList(this.form.devicePhotos);

        const payload = {
          equipmentNo: this.form.equipmentNo,
          name: this.form.name,
          type: this.form.type,
          nameplatePhoto: nameplateUrls[0] || "",
          devicePhotos: deviceUrls,
          remarks: this.form.remarks,
          customInfo: JSON.stringify(this.defaultStructure || {}),
          manufactureDate: this.form.manufactureDate,
        };
        this.form.nameplatePhoto = nameplateUrls;
        this.form.devicePhotos = deviceUrls;
        if (this.isUpdate) {
          await updateEquipment(this.equipmentId, payload);
        } else {
          const res = await addEquipment(payload);
          // Assuming res contains the new ID or we need to handle it.
          // If addEquipment returns the object with ID:
          if (res && res.id) {
            this.equipmentId = res.id;
            this.isUpdate = true;
          }
        }

        // Update snapshot after successful save
        this.updateSnapshot();
        return true;
      } catch (e) {
        console.error(e);
        uni.showToast({ title: "保存失败", icon: "none" });
        return false;
      } finally {
        this.submitting = false;
      }
    },

    // 获取设备模版
    async getTemplate() {
      const res = await getDefaultTemplate({
        type: this.form.type,
      });
      console.log("默认模版:", res);
      this.templateInfo = res || [];
    },
    // 获取设备详情
    async getEquipmentDetail(id) {
      const res = await getEquipment(id);
      console.log("设备详情:", res);
      this.form.equipmentNo = res.equipmentNo || "";
      this.form.name = res.name || "";
      this.form.type = res.type || "";
      this.form.nameplatePhoto = res.nameplatePhoto ? [res.nameplatePhoto] : [];
      this.form.devicePhotos = Array.isArray(res.devicePhotos)
        ? res.devicePhotos
        : [];
      this.form.remarks = res.remarks || "";
      this.form.manufactureDate = res.manufactureDate || "";

      if (res.customInfo) {
        try {
          this.defaultStructure = JSON.parse(res.customInfo);
        } catch (e) {
          console.error("Parse customInfo error", e);
          this.defaultStructure = {};
        }
      }

      this.updateSnapshot();
      this.getTemplate(this.form.type);
    },
    onInput(key, e) {
      const val = e?.detail?.value ?? "";
      this.$set(this.form, key, val);
    },
    getTypeIndex(val) {
      const i = this.typeOptions.findIndex((o) => o.value === val);
      return i >= 0 ? i : 0;
    },
    getTypeLabel(val) {
      const f = this.typeOptions.find((o) => o.value === val);
      return f ? f.label : "";
    },
    handleTypeChange(e) {
      const idx = Number(e?.detail?.value ?? 0);
      const opt = this.typeOptions[idx];
      this.form.type = opt ? opt.value : "";
      this.getTemplate(this.form.type);
    },
    // 处理设备模板选择
    handleTemplateChange(e) {
      const idx = Number(e?.detail?.value ?? 0);
      const opt = this.templateInfo[idx];
      this.form.templateName = opt ? opt.name : "";
      const defaultStructure = opt ? opt.defaultStructure : "";
      if (defaultStructure) {
        try {
          // Only overwrite if it's a new equipment OR user explicitly changes template?
          // The requirement implies if user selects template, we load it.
          // But if we are in Update mode and just loaded existing data, we might not want to overwrite
          // unless the user *actively* changes the template dropdown.
          // Since this is triggered by @change, it is a user action.
          this.defaultStructure = JSON.parse(defaultStructure);
          // Reset value to defaultValue for new template
          this.initStructureValues(this.defaultStructure);
          this.updateSnapshot();
        } catch (e) {
          console.error(e);
        }
      }
      console.log("默认结构:", this.defaultStructure);
    },

    initStructureValues(structure) {
      if (!structure) return;
      // Helper to set value = defaultValue if value is missing
      const initField = (f) => {
        if (f.value === undefined || f.value === null || f.value === "") {
          f.value = f.defaultValue || "";
        }
      };

      if (structure.userBasicInfo) {
        structure.userBasicInfo.forEach(initField);
      }
      if (structure.equipmentBasicInfo) {
        structure.equipmentBasicInfo.forEach((item) => {
          if (item.fields) item.fields.forEach(initField);
          if (item.subModules) {
            item.subModules.forEach((sub) => {
              if (sub.fields) sub.fields.forEach(initField);
            });
          }
        });
      }
    },

    handleManufactureDateChange(e) {
      const d = String(e?.detail?.value || "");
      this.form.manufactureDate = d ? `${d}T00:00:00.000Z` : "";
    },
    getDateDisplay(iso) {
      return iso ? String(iso).split("T")[0] : "";
    },
    getDateValue(iso) {
      return iso ? String(iso).split("T")[0] : "";
    },
    handleChooseImages(field, maxImages) {
      const current = Array.isArray(this.form[field]) ? this.form[field] : [];
      const remain = maxImages - current.length;
      if (remain <= 0) {
        uni.showToast({ title: `最多${maxImages}张`, icon: "none" });
        return;
      }
      uni.chooseImage({
        count: remain,
        sizeType: ["compressed", "original"],
        sourceType: ["album", "camera"],
        success: (res) => {
          const paths = Array.isArray(res?.tempFilePaths)
            ? res.tempFilePaths
            : Array.isArray(res?.tempFiles)
            ? res.tempFiles.map((f) => f.path)
            : [];
          this.form[field] = current.concat(paths).slice(0, maxImages);
        },
      });
    },
    handleRemove(field, idx) {
      const arr = Array.isArray(this.form[field]) ? this.form[field] : [];
      arr.splice(idx, 1);
      this.form[field] = arr;
    },
    handlePreview(field, idx) {
      const arr = Array.isArray(this.form[field]) ? this.form[field] : [];
      if (!arr.length) return;
      uni.previewImage({ current: arr[idx], urls: arr });
    },
    async handleSubmit() {
      // Deprecated, use handleNext/saveData
    },
  },
};
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Adjusted for step indicator */
  margin-bottom: 16rpx;
}
.step-indicator {
  font-size: 28rpx;
  color: #666;
  font-weight: bold;
}
.footer-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
}
.btn {
  flex: 1;
}
.btn.outline {
  background: #fff;
  color: #666;
  border: 1rpx solid #ddd;
  line-height: 78rpx; /* Adjust for border */
}
.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin: 20rpx 0 10rpx;
  padding-left: 10rpx;
  border-left: 6rpx solid #14cccc;
}
.sub-module {
  margin-top: 30rpx;
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
}
.sub-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #666;
  margin-bottom: 16rpx;
  border-bottom: 1rpx solid #eee;
  padding-bottom: 10rpx;
}
.input-with-unit {
  display: flex;
  align-items: center;
  background: #f7f9fc;
  border-radius: 12rpx;
  padding-right: 20rpx;
}
.input-with-unit .input {
  flex: 1;
  background: transparent;
  padding: 20rpx;
}
.unit-text {
  color: #999;
  font-size: 26rpx;
  margin-left: 10rpx;
}

.container {
  min-height: 100vh;
  background: #f7f8fa;
  padding: 24rpx;
  box-sizing: border-box;
}
.header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
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
.form {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
.form-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 12rpx 28rpx rgba(0, 0, 0, 0.06);
}
.label {
  display: inline-block;
  font-size: 26rpx;
  color: #666;
  padding-left: 20rpx;
  position: relative;
  margin-bottom: 16rpx;
}
.label::before {
  content: "";
  position: absolute;
  left: 0;
  top: 8rpx;
  width: 10rpx;
  height: 28rpx;
  border-radius: 8rpx;
  background: linear-gradient(180deg, #14cccc, #0aa2c2);
}
.input {
  background: #f7f9fc;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  border: 2rpx solid transparent;
}
.input:focus {
  border-color: #14cccc;
}
.picker-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f7f9fc;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
}
.picker-text {
  color: #333;
}
.picker-arrow {
  color: #999;
  font-size: 32rpx;
}
.upload-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}
.upload-item,
.upload-add {
  position: relative;
  width: 100%;
  padding-top: 100%;
  border-radius: 12rpx;
  overflow: hidden;
  background: #f7f9fc;
  box-shadow: inset 0 0 0 2rpx #eef2f6;
}
.upload-img {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}
.remove {
  position: absolute;
  top: 6rpx;
  right: 6rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.upload-add {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #999;
}
.add-plus {
  font-size: 48rpx;
  color: #14cccc;
  margin-bottom: 6rpx;
}
.add-tip {
  font-size: 24rpx;
}
.count-tip {
  display: block;
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}
.textarea {
  min-height: 160rpx;
  background: #f7f9fc;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
}
.btn-wrap {
  padding: 8rpx 0 24rpx;
}
.btn.primary {
  height: 80rpx;
  border-radius: 16rpx;
  background: #14cccc;
  color: #fff;
  font-size: 28rpx;
  line-height: 80rpx;
  box-shadow: 0 8rpx 20rpx rgba(20, 204, 204, 0.25);
  border: none;
}
</style>
