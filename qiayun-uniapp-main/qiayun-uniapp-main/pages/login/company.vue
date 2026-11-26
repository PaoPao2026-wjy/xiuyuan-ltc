<template>
  <view class="container">
    <!-- 顶部说明卡片 -->
    <view class="card header-card card-elevated">
      <text class="title">企业信息完善 ({{ currentStep }}/3)</text>
    </view>

    <!-- 表单卡片 -->
    <view class="card form-card card-elevated">
      <!-- 第一页 -->
      <view v-if="currentStep === 1">
        <view class="form-row">
          <text class="label">企业名称<text class="required">*</text></text>
          <input
            class="input full"
            type="text"
            v-model="form.enterpriseName"
            placeholder="请输入企业名称"
          />
        </view>

        <view class="form-row">
          <text class="label"
            >统一社会信用代码<text class="required">*</text></text
          >
          <input
            class="input full"
            type="text"
            v-model="form.socialCreditCode"
            placeholder="请输入统一社会信用代码"
          />
        </view>

        <view class="form-row">
          <text class="label">营业执照照片<text class="required">*</text></text>
          <view class="upload-box" @tap="handleUploadLicense">
            <image
              v-if="form.businessLicensePhoto"
              class="license-img"
              :src="form.businessLicensePhoto"
              mode="aspectFit"
            />
            <view v-else class="upload-placeholder">
              <text class="plus-icon">+</text>
              <text class="tip-text">点击上传营业执照</text>
            </view>
          </view>
        </view>

        <view class="form-row">
          <text class="label">企业地址<text class="required">*</text></text>
          <textarea
            class="textarea full"
            v-model="form.enterpriseAddress"
            auto-height
            placeholder="请输入企业地址（街道/楼层/门牌号）"
          ></textarea>
        </view>

        <view class="form-row">
          <text class="label">企业类型<text class="required">*</text></text>
          <picker
            mode="selector"
            :range="enterpriseTypeLabels"
            :value="getTypeIndex(form.enterpriseType)"
            @change="handleTypePickerChange"
          >
            <view class="select-input">
              <text class="select-value">
                {{ getTypeLabel(form.enterpriseType) || "请选择企业类型" }}
              </text>
            </view>
          </picker>
        </view>

        <view class="form-row">
          <text class="label"> 企业邮箱</text>
          <input
            class="input full"
            type="text"
            v-model="form.enterpriseEmail"
            placeholder="请输入企业邮箱"
          />
        </view>

        <view class="form-row">
          <text class="label">联系电话<text class="required">*</text></text>
          <input
            class="input full"
            type="text"
            v-model="form.contactPhone"
            placeholder="请输入联系电话（手机号或座机）"
          />
        </view>

        <view class="form-row">
          <text class="label"
            >第一联系人姓名<text class="required">*</text></text
          >
          <input
            class="input full"
            type="text"
            v-model="form.contactName"
            placeholder="请输入第一联系人姓名"
          />
        </view>

        <view class="form-row">
          <text class="label">第一联系人职务</text>
          <input
            class="input full"
            type="text"
            v-model="form.contactPosition"
            placeholder="请输入第一联系人职务"
          />
        </view>

        <view class="form-row">
          <text class="label"
            >第一联系人手机<text class="required">*</text></text
          >
          <input
            class="input full"
            type="number"
            v-model="form.contactMobile"
            placeholder="请输入第一联系人手机"
          />
        </view>

        <view class="form-row">
          <text class="label">第一联系人邮箱</text>
          <input
            class="input full"
            type="text"
            v-model="form.contactEmail"
            placeholder="请输入第一联系人邮箱"
          />
        </view>

        <view class="form-row">
          <text class="label">第二联系人姓名</text>
          <input
            class="input full"
            type="text"
            v-model="form.contactName2"
            placeholder="请输入第二联系人姓名"
          />
        </view>

        <view class="form-row">
          <text class="label">第二联系人手机</text>
          <input
            class="input full"
            type="number"
            v-model="form.contactMobile2"
            placeholder="请输入第二联系人手机"
          />
        </view>

        <view class="form-row">
          <text class="label">第三联系人姓名</text>
          <input
            class="input full"
            type="text"
            v-model="form.contactName3"
            placeholder="请输入第三联系人姓名"
          />
        </view>

        <view class="form-row">
          <text class="label">第三联系人手机</text>
          <input
            class="input full"
            type="number"
            v-model="form.contactMobile3"
            placeholder="请输入第三联系人手机"
          />
        </view>
      </view>

      <!-- 第二页 -->
      <view v-if="currentStep === 2">
        <view class="form-row">
          <text class="label">户号1</text>
          <input
            class="input full"
            type="text"
            v-model="form.enterpriseUserNo1"
            placeholder="请输入户号1"
          />
        </view>

        <view class="form-row">
          <text class="label">户号2</text>
          <input
            class="input full"
            type="text"
            v-model="form.enterpriseUserNo2"
            placeholder="请输入户号2"
          />
        </view>

        <view class="form-row">
          <text class="label">表号1</text>
          <input
            class="input full"
            type="text"
            v-model="form.enterpriseMeterNo1"
            placeholder="请输入表号1"
          />
        </view>

        <view class="form-row">
          <text class="label">表号2</text>
          <input
            class="input full"
            type="text"
            v-model="form.enterpriseMeterNo2"
            placeholder="请输入表号2"
          />
        </view>

        <view class="form-row">
          <text class="label">变压器容量1(KVA)</text>
          <input
            class="input full"
            type="number"
            v-model="form.transformerCapacity1"
            placeholder="请输入变压器容量1"
          />
        </view>

        <view class="form-row">
          <text class="label">变压器容量2(KVA)</text>
          <input
            class="input full"
            type="number"
            v-model="form.transformerCapacity2"
            placeholder="请输入变压器容量2"
          />
        </view>

        <view class="form-row">
          <text class="label">使用容量1(KVA)</text>
          <input
            class="input full"
            type="number"
            v-model="form.usageCapacity1"
            placeholder="请输入使用容量1"
          />
        </view>

        <view class="form-row">
          <text class="label">使用容量2(KVA)</text>
          <input
            class="input full"
            type="number"
            v-model="form.usageCapacity2"
            placeholder="请输入使用容量2"
          />
        </view>
      </view>

      <!-- 第三页 -->
      <view v-if="currentStep === 3">
        <view class="form-row">
          <text class="label">进线方式</text>
          <input
            class="input full"
            type="text"
            v-model="form.powerSupplyMode"
            placeholder="请输入进线方式"
          />
        </view>

        <view class="form-row">
          <text class="label">进线修程</text>
          <input
            class="input full"
            type="text"
            v-model="form.powerSupplyMaintenanceType"
            placeholder="请输入进线修程"
          />
        </view>

        <view class="form-row">
          <text class="label">高压柜数量</text>
          <input
            class="input full"
            type="number"
            v-model="form.highVoltageCabinetCount"
            placeholder="请输入高压柜数量"
          />
        </view>

        <view class="form-row">
          <text class="label">变压器数量</text>
          <input
            class="input full"
            type="number"
            v-model="form.transformerCount"
            placeholder="请输入变压器数量"
          />
        </view>

        <view class="form-row">
          <text class="label">低压柜数量</text>
          <input
            class="input full"
            type="number"
            v-model="form.lowVoltageCabinetCount"
            placeholder="请输入低压柜数量"
          />
        </view>

        <view class="form-row">
          <text class="label">电容柜数量</text>
          <input
            class="input full"
            type="number"
            v-model="form.capacitorCabinetCount"
            placeholder="请输入电容柜数量"
          />
        </view>

        <view class="form-row">
          <text class="label">直流屏信息</text>
          <input
            class="input full"
            type="text"
            v-model="form.dcScreen"
            placeholder="请输入直流屏信息"
          />
        </view>

        <view class="form-row">
          <text class="label">运检单位</text>
          <input
            class="input full"
            type="text"
            v-model="form.operationMaintenanceUnit"
            placeholder="请输入运检单位"
          />
        </view>

        <view class="form-row">
          <text class="label">电试日期</text>
          <picker
            mode="date"
            :value="form.electricalTestDate"
            @change="onDateChange"
          >
            <view class="select-input">
              <text class="select-value">
                {{ form.electricalTestDate || "请选择电试日期" }}
              </text>
            </view>
          </picker>
        </view>

        <view class="form-row">
          <text class="label">模拟屏信息</text>
          <input
            class="input full"
            type="text"
            v-model="form.analogScreen"
            placeholder="请输入模拟屏信息"
          />
        </view>

        <view class="form-row">
          <text class="label">安全用具信息</text>
          <input
            class="input full"
            type="text"
            v-model="form.safetyEquipment"
            placeholder="请输入安全用具信息"
          />
        </view>

        <view class="form-row">
          <text class="label">消防器材信息</text>
          <input
            class="input full"
            type="text"
            v-model="form.fireFightingEquipment"
            placeholder="请输入消防器材信息"
          />
        </view>

        <view class="form-row">
          <text class="label">排风设备信息</text>
          <input
            class="input full"
            type="text"
            v-model="form.ventilationEquipment"
            placeholder="请输入排风设备信息"
          />
        </view>

        <view class="form-row">
          <text class="label">空调信息</text>
          <input
            class="input full"
            type="text"
            v-model="form.airConditioner"
            placeholder="请输入空调信息"
          />
        </view>

        <view class="form-row">
          <text class="label">高阻屏信息</text>
          <input
            class="input full"
            type="text"
            v-model="form.highResistanceScreen"
            placeholder="请输入高阻屏信息"
          />
        </view>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="bottom-actions">
      <view class="btn-group">
        <button v-if="currentStep > 1" class="btn secondary" @tap="handlePrev">
          上一页
        </button>
        <button class="btn primary" @tap="handleNext">
          {{ currentStep === 3 ? "保存" : "下一页" }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import http from "@/apis/index.js";
import {
  getCompanyInfo,
  addCompany,
  updateCompany,
} from "@/apis/modules/login";
export default {
  data() {
    return {
      form: {
        enterpriseName: "",
        socialCreditCode: "",
        businessLicensePhoto: "",
        enterpriseAddress: "",
        enterpriseEmail: "",
        contactPhone: "",
        enterpriseType: "PRIVATE",
        contactName: "",
        contactPosition: "",
        contactMobile: "",
        contactEmail: "",
        contactName2: "",
        contactMobile2: "",
        contactName3: "",
        contactMobile3: "",
        enterpriseUserNo1: "",
        enterpriseUserNo2: "",
        enterpriseMeterNo1: "",
        enterpriseMeterNo2: "",
        transformerCapacity1: "",
        transformerCapacity2: "",
        usageCapacity1: "",
        usageCapacity2: "",
        powerSupplyMode: "",
        powerSupplyMaintenanceType: "",
        highVoltageCabinetCount: "",
        transformerCount: "",
        lowVoltageCabinetCount: "",
        capacitorCabinetCount: "",
        dcScreen: "",
        operationMaintenanceUnit: "",
        electricalTestDate: "",
        analogScreen: "",
        safetyEquipment: "",
        fireFightingEquipment: "",
        ventilationEquipment: "",
        airConditioner: "",
        highResistanceScreen: "",
      },
      enterpriseTypeOptions: [
        { label: "国有企业", value: "STATE_OWNED" },
        { label: "民营企业", value: "PRIVATE" },
        { label: "外资企业", value: "FOREIGN" },
        { label: "合资企业", value: "JOINT_VENTURE" },
      ],
      isUpdate: false,
      currentStep: 1,
      originalForm: {},
    };
  },
  computed: {
    enterpriseTypeLabels() {
      return this.enterpriseTypeOptions.map((o) => o.label);
    },
  },
  async onLoad() {
    const res = await getCompanyInfo();
    console.log("企业信息查询结果:", res);
    if (res) {
      this.form = {
        ...this.form,
        ...res,
      };
      this.isUpdate = true;
    } else {
      this.isUpdate = false;
    }
    this.originalForm = JSON.parse(JSON.stringify(this.form));
  },
  methods: {
    getTypeIndex(val) {
      const i = this.enterpriseTypeOptions.findIndex((o) => o.value === val);
      return i >= 0 ? i : 0;
    },
    getTypeLabel(val) {
      const f = this.enterpriseTypeOptions.find((o) => o.value === val);
      return f ? f.label : "";
    },
    handleTypePickerChange(e) {
      const idx = Number(e?.detail?.value ?? 0);
      const opt = this.enterpriseTypeOptions[idx];
      this.form.enterpriseType = opt ? opt.value : "";
    },
    onDateChange(e) {
      this.form.electricalTestDate = e.detail.value;
    },
    validatePhone(phone) {
      const s = String(phone || "").trim();
      // 支持 11 位手机或带区号的座机（如 010-88888888 / 0571-8888888）
      const mobile = /^1\d{10}$/;
      const landline = /^0\d{2,3}-?\d{7,8}$/;
      return mobile.test(s) || landline.test(s);
    },
    handleUploadLicense() {
      uni.chooseImage({
        count: 1,
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0];
          try {
            uni.showLoading({ title: "上传中..." });
            const uploadRes = await http.upload(tempFilePath);
            this.form.businessLicensePhoto = uploadRes?.fileUrl || "";
            uni.hideLoading();
          } catch (error) {
            uni.hideLoading();
            console.error("上传失败", error);
          }
        },
      });
    },
    handlePrev() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    async handleNext() {
      // 验证第一页
      if (this.currentStep === 1) {
        const {
          enterpriseName,
          socialCreditCode,
          businessLicensePhoto,
          enterpriseAddress,
          contactPhone,
          contactName,
          contactMobile,
        } = this.form;

        if (!String(enterpriseName || "").trim()) {
          uni.showToast({ title: "请填写企业名称", icon: "none" });
          return;
        }
        if (!String(socialCreditCode || "").trim()) {
          uni.showToast({ title: "请填写统一社会信用代码", icon: "none" });
          return;
        }
        if (!businessLicensePhoto) {
          uni.showToast({ title: "请上传营业执照照片", icon: "none" });
          return;
        }
        if (!String(enterpriseAddress || "").trim()) {
          uni.showToast({ title: "请填写企业地址", icon: "none" });
          return;
        }
        if (!contactPhone) {
          uni.showToast({ title: "请填写联系电话", icon: "none" });
          return;
        }
        if (!contactName) {
          uni.showToast({ title: "请填写第一联系人姓名", icon: "none" });
          return;
        }
        if (!contactMobile) {
          uni.showToast({ title: "请填写第一联系人手机", icon: "none" });
          return;
        }
      }

      // 判断数据是否有变化
      const isDataChanged =
        JSON.stringify(this.form) !== JSON.stringify(this.originalForm);

      if (isDataChanged || this.currentStep === 3) {
        await this.saveData();
        this.originalForm = JSON.parse(JSON.stringify(this.form));
      }

      // 如果不是最后一页，进入下一页
      if (this.currentStep < 3) {
        this.currentStep++;
      } else {
        // 最后一页保存成功后返回
        setTimeout(() => {
          const pages = getCurrentPages();
          if (pages && pages.length > 1) {
            uni.navigateBack();
          }
        }, 600);
      }
    },
    async saveData() {
      const payload = {};
      Object.keys(this.form).forEach((key) => {
        const val = this.form[key];
        if (val !== null && val !== undefined && val !== "") {
          if (
            [
              "transformerCapacity1",
              "transformerCapacity2",
              "usageCapacity1",
              "usageCapacity2",
            ].includes(key)
          ) {
            payload[key] = Number(val);
          } else {
            payload[key] = val;
          }
        }
      });
      console.log("保存企业信息 step=" + this.currentStep, payload);

      if (this.isUpdate) {
        await updateCompany(payload);
      } else {
        await addCompany(payload);

        this.isUpdate = true;
      }
      uni.showToast({ title: "保存成功", icon: "success" });
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

/* 表单样式 */
.form-row {
  margin-top: 14rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

/* 标签样式：左侧渐变竖条 + 加粗 */
.label {
  width: 100%;
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
  letter-spacing: 0.5rpx;
  display: inline-flex;
  align-items: center;
}
.label::before {
  content: "";
  display: inline-block;
  width: 8rpx;
  height: 28rpx;
  border-radius: 8rpx;
  margin-right: 10rpx;
  background: linear-gradient(180deg, #14cccc, #0aa6db);
}

/* 输入框与文本域统一风格，聚焦高亮 */
.input,
.textarea {
  padding: 16rpx;
  border: 2rpx solid #eaeaea;
  border-radius: 12rpx;
  font-size: 28rpx;
  background: #fff;
  transition: border-color 160ms ease, box-shadow 160ms ease;
  margin-bottom: 24rpx;
}
.input:focus,
.textarea:focus {
  border-color: #14cccc;
  box-shadow: 0 8rpx 20rpx rgba(20, 204, 204, 0.15);
}
.textarea {
  min-height: 120rpx;
  line-height: 1.6;
}

/* 底部操作 */
.bottom-actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0 24rpx 24rpx;
  box-sizing: border-box;
  background-color: #fff;
  z-index: 99;
}
.btn.primary {
  flex: 1;
  height: 84rpx;
  border-radius: 12rpx;
  background: linear-gradient(135deg, #14cccc, #0aa6db);
  color: #fff;
  font-size: 30rpx;
}
.btn.secondary {
  width: 200rpx;
  height: 84rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
  color: #666;
  font-size: 30rpx;
  margin-right: 24rpx;
}
.btn-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.select-input {
  width: 100%;
  padding: 16rpx;
  border: 2rpx solid #eaeaea;
  border-radius: 12rpx;
  background: #fff;
  margin-bottom: 24rpx;
}
.select-value {
  font-size: 28rpx;
  color: #333;
}
.required {
  color: #ff4d4f;
  margin-left: 8rpx;
}

.upload-box {
  width: 100%;
  height: 320rpx;
  background: #f8f8f8;
  border: 2rpx dashed #ddd;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  overflow: hidden;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.plus-icon {
  font-size: 64rpx;
  color: #999;
  margin-bottom: 16rpx;
}

.tip-text {
  font-size: 26rpx;
  color: #999;
}

.license-img {
  width: 100%;
  height: 100%;
}
</style>
