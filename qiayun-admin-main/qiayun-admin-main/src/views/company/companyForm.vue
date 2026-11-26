<template>
  <div class="company-form-page">
    <div class="page-header">
      <div class="header-left">
        <el-button link @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>
    </div>

    <el-card class="form-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>企业信息</span>
        </div>
      </template>

      <el-form
        ref="companyFormRef"
        :model="companyForm"
        :rules="rules"
        label-width="110px"
        label-position="right"
        class="company-form"
      >
        <!-- 基础信息分组 -->
        <div class="form-section">
          <div class="section-header">
            <el-icon><OfficeBuilding /></el-icon>
            <span>基础信息</span>
          </div>
          <div class="section-content">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="企业名称" prop="enterpriseName">
                  <el-input v-model="companyForm.enterpriseName" placeholder="请输入企业名称" clearable size="large" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="企业类型" prop="enterpriseType">
                  <el-select
                    v-model="companyForm.enterpriseType"
                    placeholder="请选择企业类型"
                    clearable
                    style="width: 100%"
                    size="large"
                  >
                    <el-option label="国有企业" value="STATE_OWNED" />
                    <el-option label="民营企业" value="PRIVATE" />
                    <el-option label="外资企业" value="FOREIGN" />
                    <el-option label="合资企业" value="JOINT_VENTURE" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="统一社会信用代码" prop="socialCreditCode" label-width="160px">
                  <el-input v-model="companyForm.socialCreditCode" placeholder="请输入统一社会信用代码" clearable size="large" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="企业地址" prop="enterpriseAddress">
                  <el-input v-model="companyForm.enterpriseAddress" placeholder="请输入企业地址" clearable size="large" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="营业执照照片" prop="businessLicensePhoto">
              <UploadImgs v-model:file-list="businessLicenseFileList" :limit="1">
                <template #tip>请上传营业执照照片</template>
              </UploadImgs>
            </el-form-item>
          </div>
        </div>

        <!-- 联系信息分组 -->
        <div class="form-section">
          <div class="section-header">
            <el-icon><Phone /></el-icon>
            <span>联系信息</span>
          </div>
          <div class="section-content">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="企业联系电话" prop="contactPhone">
                  <el-input v-model="companyForm.contactPhone" placeholder="请输入联系电话" clearable size="large" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="企业邮箱" prop="enterpriseEmail">
                  <el-input v-model="companyForm.enterpriseEmail" placeholder="请输入企业邮箱" clearable size="large" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="联系人姓名" prop="contactName">
              <el-input v-model="companyForm.contactName" placeholder="请输入联系人姓名" clearable size="large" />
            </el-form-item>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="联系人职务" prop="contactPosition">
                  <el-input v-model="companyForm.contactPosition" placeholder="请输入联系人职务" clearable size="large" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系人电话" prop="contactMobile">
                  <el-input v-model="companyForm.contactMobile" placeholder="请输入联系人电话" clearable size="large" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="联系人邮箱" prop="contactEmail">
              <el-input v-model="companyForm.contactEmail" placeholder="请输入联系人邮箱" clearable size="large" />
            </el-form-item>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="第二联系人姓名" prop="contactName2">
                  <el-input v-model="companyForm.contactName2" placeholder="请输入第二联系人姓名" clearable size="large" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="第二联系人电话" prop="contactMobile2">
                  <el-input v-model="companyForm.contactMobile2" placeholder="请输入第二联系人电话" clearable size="large" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="第三联系人姓名" prop="contactName3">
                  <el-input v-model="companyForm.contactName3" placeholder="请输入第三联系人姓名" clearable size="large" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="第三联系人电话" prop="contactMobile3">
                  <el-input v-model="companyForm.contactMobile3" placeholder="请输入第三联系人电话" clearable size="large" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>

        <!-- 配电信息分组 -->
        <div class="form-section">
          <div class="section-header">
            <el-icon><Lightning /></el-icon>
            <span>配电信息</span>
          </div>
          <div class="section-content">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="户号1">
                  <el-input v-model="companyForm.enterpriseUserNo1" placeholder="请输入户号1" clearable size="large" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="户号2">
                  <el-input v-model="companyForm.enterpriseUserNo2" placeholder="请输入户号2" clearable size="large" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="表号1">
                  <el-input v-model="companyForm.enterpriseMeterNo1" placeholder="请输入表号1" clearable size="large" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="表号2">
                  <el-input v-model="companyForm.enterpriseMeterNo2" placeholder="请输入表号2" clearable size="large" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="变压器容量1">
                  <el-input
                    v-model="companyForm.transformerCapacity1"
                    type="number"
                    :min="0"
                    placeholder="请输入变压器容量1"
                    clearable
                    size="large"
                  >
                    <template #suffix>kVA</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="变压器容量2">
                  <el-input
                    v-model="companyForm.transformerCapacity2"
                    type="number"
                    :min="0"
                    placeholder="请输入变压器容量2"
                    clearable
                    size="large"
                  >
                    <template #suffix>kVA</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="使用容量1">
                  <el-input
                    v-model="companyForm.usageCapacity1"
                    type="number"
                    :min="0"
                    placeholder="请输入使用容量1"
                    clearable
                    size="large"
                  >
                    <template #suffix>kVA</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="使用容量2">
                  <el-input
                    v-model="companyForm.usageCapacity2"
                    type="number"
                    :min="0"
                    placeholder="请输入使用容量2"
                    clearable
                    size="large"
                  >
                    <template #suffix>kVA</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="进线方式">
                  <el-input v-model="companyForm.powerSupplyMode" placeholder="请输入进线方式" clearable size="large" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="进线修程">
                  <el-input
                    v-model="companyForm.powerSupplyMaintenanceType"
                    placeholder="请输入进线修程"
                    clearable
                    size="large"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>

        <!-- 设备信息分组 -->
        <div class="form-section">
          <div class="section-header">
            <el-icon><Setting /></el-icon>
            <span>设备信息</span>
          </div>
          <div class="section-content">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="高压柜数量">
                  <el-input
                    v-model="companyForm.highVoltageCabinetCount"
                    type="number"
                    :min="0"
                    placeholder="请输入高压柜数量"
                    clearable
                    size="large"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="低压柜数量">
                  <el-input
                    v-model="companyForm.lowVoltageCabinetCount"
                    type="number"
                    :min="0"
                    placeholder="请输入低压柜数量"
                    clearable
                    size="large"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="变压器数量">
                  <el-input
                    v-model="companyForm.transformerCount"
                    type="number"
                    :min="0"
                    placeholder="请输入变压器数量"
                    clearable
                    size="large"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="电容柜数量">
                  <el-input
                    v-model="companyForm.capacitorCabinetCount"
                    type="number"
                    :min="0"
                    placeholder="请输入电容柜数量"
                    clearable
                    size="large"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="直流屏信息">
                  <el-input v-model="companyForm.dcScreen" placeholder="请输入直流屏信息" clearable size="large" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="模拟屏信息">
                  <el-input v-model="companyForm.analogScreen" placeholder="请输入模拟屏信息" clearable size="large" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="安全用具">
                  <el-input v-model="companyForm.safetyEquipment" placeholder="请输入安全用具信息" clearable size="large" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="消防器材">
                  <el-input v-model="companyForm.fireFightingEquipment" placeholder="请输入消防器材信息" clearable size="large" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="排风设备">
                  <el-input v-model="companyForm.ventilationEquipment" placeholder="请输入排风设备信息" clearable size="large" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="空调信息">
                  <el-input v-model="companyForm.airConditioner" placeholder="请输入空调信息" clearable size="large" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="高阻屏信息">
              <el-input v-model="companyForm.highResistanceScreen" placeholder="请输入高阻屏信息" clearable size="large" />
            </el-form-item>
          </div>
        </div>

        <!-- 运维信息分组 -->
        <div class="form-section">
          <div class="section-header">
            <el-icon><Tools /></el-icon>
            <span>运维信息</span>
          </div>
          <div class="section-content">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="运检单位">
                  <el-input v-model="companyForm.operationMaintenanceUnit" placeholder="请输入运检单位" clearable size="large" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="电试日期">
                  <el-date-picker
                    v-model="companyForm.electricalTestDate"
                    type="date"
                    placeholder="请选择电试日期"
                    size="large"
                    style="width: 100%"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD[T]00:00:00.000[Z]"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-form>
    </el-card>

    <div class="form-actions">
      <el-button class="action-btn" size="large" @click="router.back()">取消</el-button>
      <el-button class="action-btn" size="large" type="primary" :loading="saving" @click="submitForm">保存</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, OfficeBuilding, Phone, Lightning, Setting, Tools } from "@element-plus/icons-vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { createCompanyApi, updateCompanyApi, queryCompanyDetailApi } from "@/api/modules/company";
import { Company } from "@/api/interface";
import { useTabsStore } from "@/stores/modules/tabs";
import UploadImgs from "@/components/Upload/Imgs.vue";
const tabStore = useTabsStore();

const route = useRoute();
const router = useRouter();

const isEdit = computed(() => !!route.params.id);
const loadingDetail = ref(false);

const companyFormRef = ref<FormInstance>();
const saving = ref(false);
const businessLicenseFileList = ref<any[]>([]);

watch(
  () => businessLicenseFileList.value,
  val => {
    companyForm.businessLicensePhoto = val.length > 0 ? val[0].url : "";
    if (companyFormRef.value) {
      companyFormRef.value.validateField("businessLicensePhoto");
    }
  },
  { deep: true }
);

const companyForm = reactive<Company.ReqUpdateCompanyParams>({
  id: (route.params.id as string) || "",
  enterpriseName: "",
  enterpriseType: "",
  socialCreditCode: "",
  businessLicensePhoto: "",
  enterpriseAddress: "",
  contactPhone: "",
  enterpriseEmail: "",
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
  transformerCapacity1: 0,
  transformerCapacity2: 0,
  usageCapacity1: 0,
  usageCapacity2: 0,
  powerSupplyMode: "",
  powerSupplyMaintenanceType: "",
  highVoltageCabinetCount: 0,
  lowVoltageCabinetCount: 0,
  transformerCount: 0,
  capacitorCabinetCount: 0,
  dcScreen: "",
  operationMaintenanceUnit: "",
  electricalTestDate: "",
  analogScreen: "",
  safetyEquipment: "",
  fireFightingEquipment: "",
  ventilationEquipment: "",
  airConditioner: "",
  highResistanceScreen: ""
});
const rules = reactive<FormRules>({
  enterpriseName: [{ required: true, message: "请输入企业名称", trigger: "blur" }],
  enterpriseType: [{ required: true, message: "请选择企业类型", trigger: "change" }],
  socialCreditCode: [{ required: true, message: "请输入统一社会信用代码", trigger: "blur" }],
  businessLicensePhoto: [{ required: true, message: "请上传营业执照照片", trigger: "change" }],
  enterpriseAddress: [{ required: true, message: "请输入企业地址", trigger: "blur" }],
  contactPhone: [{ required: true, message: "请输入联系电话", trigger: "blur" }],
  contactName: [{ required: true, message: "请输入联系人姓名", trigger: "blur" }],
  contactPosition: [{ required: true, message: "请输入联系人职务", trigger: "blur" }],
  contactMobile: [{ required: true, message: "请输入联系人电话", trigger: "blur" }],
  enterpriseEmail: [{ type: "email", message: "请输入正确的邮箱地址", trigger: "blur" }],
  contactEmail: [{ type: "email", message: "请输入正确的邮箱地址", trigger: "blur" }]
});
onMounted(async () => {
  if (isEdit.value && companyForm.id) {
    loadingDetail.value = true;
    try {
      const res = await queryCompanyDetailApi(companyForm.id);
      const d = res.data;
      companyForm.enterpriseName = d.enterpriseName || "";
      companyForm.enterpriseType = d.enterpriseType || "";
      companyForm.socialCreditCode = d.socialCreditCode || "";
      companyForm.businessLicensePhoto = d.businessLicensePhoto || "";
      if (d.businessLicensePhoto) {
        businessLicenseFileList.value = [{ name: "营业执照", url: d.businessLicensePhoto }];
      }
      companyForm.enterpriseAddress = d.enterpriseAddress || "";
      companyForm.contactPhone = d.contactPhone || "";
      companyForm.enterpriseEmail = d.enterpriseEmail || "";
      companyForm.contactName = d.contactName || "";
      companyForm.contactPosition = d.contactPosition || "";
      companyForm.contactMobile = d.contactMobile || "";
      companyForm.contactEmail = d.contactEmail || "";
      companyForm.contactName2 = d.contactName2 || "";
      companyForm.contactMobile2 = d.contactMobile2 || "";
      companyForm.contactName3 = d.contactName3 || "";
      companyForm.contactMobile3 = d.contactMobile3 || "";
      companyForm.enterpriseUserNo1 = d.enterpriseUserNo1 || "";
      companyForm.enterpriseUserNo2 = d.enterpriseUserNo2 || "";
      companyForm.enterpriseMeterNo1 = d.enterpriseMeterNo1 || "";
      companyForm.enterpriseMeterNo2 = d.enterpriseMeterNo2 || "";
      companyForm.transformerCapacity1 = d.transformerCapacity1 || 0;
      companyForm.transformerCapacity2 = d.transformerCapacity2 || 0;
      companyForm.usageCapacity1 = d.usageCapacity1 || 0;
      companyForm.usageCapacity2 = d.usageCapacity2 || 0;
      companyForm.powerSupplyMode = d.powerSupplyMode || "";
      companyForm.powerSupplyMaintenanceType = d.powerSupplyMaintenanceType || "";
      companyForm.highVoltageCabinetCount = d.highVoltageCabinetCount || 0;
      companyForm.lowVoltageCabinetCount = d.lowVoltageCabinetCount || 0;
      companyForm.transformerCount = d.transformerCount || 0;
      companyForm.capacitorCabinetCount = d.capacitorCabinetCount || 0;
      companyForm.dcScreen = d.dcScreen || "";
      companyForm.operationMaintenanceUnit = d.operationMaintenanceUnit || "";
      companyForm.electricalTestDate = d.electricalTestDate || "";
      companyForm.analogScreen = d.analogScreen || "";
      companyForm.safetyEquipment = d.safetyEquipment || "";
      companyForm.fireFightingEquipment = d.fireFightingEquipment || "";
      companyForm.ventilationEquipment = d.ventilationEquipment || "";
      companyForm.airConditioner = d.airConditioner || "";
      companyForm.highResistanceScreen = d.highResistanceScreen || "";
    } finally {
      loadingDetail.value = false;
    }
  }
});

const submitForm = () => {
  if (!companyFormRef.value) return;
  companyFormRef.value.validate(async valid => {
    if (!valid) return;
    saving.value = true;
    companyForm.businessLicensePhoto = businessLicenseFileList.value.length > 0 ? businessLicenseFileList.value[0].url : "";
    const currentTabPath = route.fullPath;
    try {
      if (isEdit.value && companyForm.id) {
        const payload = {
          ...companyForm,
          transformerCapacity1: companyForm.transformerCapacity1 && +companyForm.transformerCapacity1,
          transformerCapacity2: companyForm.transformerCapacity2 && +companyForm.transformerCapacity2,
          usageCapacity1: companyForm.usageCapacity1 && +companyForm.usageCapacity1,
          usageCapacity2: companyForm.usageCapacity2 && +companyForm.usageCapacity2,
          highVoltageCabinetCount: companyForm.highVoltageCabinetCount && +companyForm.highVoltageCabinetCount,
          lowVoltageCabinetCount: companyForm.lowVoltageCabinetCount && +companyForm.lowVoltageCabinetCount,
          transformerCount: companyForm.transformerCount && +companyForm.transformerCount,
          capacitorCabinetCount: companyForm.capacitorCabinetCount && +companyForm.capacitorCabinetCount
        };
        await updateCompanyApi(payload);
        ElMessage.success("编辑成功");
      } else {
        const payload: Company.ReqCreateCompanyParams = {
          enterpriseName: companyForm.enterpriseName,
          enterpriseType: companyForm.enterpriseType,
          socialCreditCode: companyForm.socialCreditCode,
          businessLicensePhoto: companyForm.businessLicensePhoto,
          enterpriseAddress: companyForm.enterpriseAddress,
          contactPhone: companyForm.contactPhone,
          enterpriseEmail: companyForm.enterpriseEmail,
          contactName: companyForm.contactName,
          contactPosition: companyForm.contactPosition,
          contactMobile: companyForm.contactMobile,
          contactEmail: companyForm.contactEmail,
          contactName2: companyForm.contactName2,
          contactMobile2: companyForm.contactMobile2,
          contactName3: companyForm.contactName3,
          contactMobile3: companyForm.contactMobile3,
          enterpriseUserNo1: companyForm.enterpriseUserNo1,
          enterpriseUserNo2: companyForm.enterpriseUserNo2,
          enterpriseMeterNo1: companyForm.enterpriseMeterNo1,
          enterpriseMeterNo2: companyForm.enterpriseMeterNo2,
          transformerCapacity1: companyForm.transformerCapacity1 && +companyForm.transformerCapacity1,
          transformerCapacity2: companyForm.transformerCapacity2 && +companyForm.transformerCapacity2,
          usageCapacity1: companyForm.usageCapacity1 && +companyForm.usageCapacity1,
          usageCapacity2: companyForm.usageCapacity2 && +companyForm.usageCapacity2,
          powerSupplyMode: companyForm.powerSupplyMode,
          powerSupplyMaintenanceType: companyForm.powerSupplyMaintenanceType,
          highVoltageCabinetCount: companyForm.highVoltageCabinetCount && +companyForm.highVoltageCabinetCount,
          lowVoltageCabinetCount: companyForm.lowVoltageCabinetCount && +companyForm.lowVoltageCabinetCount,
          transformerCount: companyForm.transformerCount && +companyForm.transformerCount,
          capacitorCabinetCount: companyForm.capacitorCabinetCount && +companyForm.capacitorCabinetCount,
          dcScreen: companyForm.dcScreen,
          operationMaintenanceUnit: companyForm.operationMaintenanceUnit,
          electricalTestDate: companyForm.electricalTestDate,
          analogScreen: companyForm.analogScreen,
          safetyEquipment: companyForm.safetyEquipment,
          fireFightingEquipment: companyForm.fireFightingEquipment,
          ventilationEquipment: companyForm.ventilationEquipment,
          airConditioner: companyForm.airConditioner,
          highResistanceScreen: companyForm.highResistanceScreen
        };
        await createCompanyApi(payload);
        ElMessage.success("新增成功");
      }
      router.back();
      tabStore.removeTabs(currentTabPath, false);
    } finally {
      saving.value = false;
    }
  });
};
</script>

<style scoped lang="scss">
.company-form-page {
  box-sizing: border-box;
  width: 100%;
  max-width: none;
  padding: 0 24px 88px;
  margin: 0;
  background: var(--el-fill-color-blank);
}
.page-header {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 6px 16px; /* 行间距 */ /* 列间距 */
  align-items: center;
  padding: 12px 4px;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.header-left {
  display: flex;
  align-items: center;
}
.header-main {
  display: flex;
  flex-direction: column;
}
.header-main .title {
  position: relative;
  padding-left: 8px;
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.2px;
}
.header-main .title::before {
  position: absolute;
  top: 50%;
  left: 0;
  width: 4px;
  height: 18px;
  content: "";
  background: var(--el-color-primary);
  border-radius: 2px;
  opacity: 0.85;
  transform: translateY(-50%);
}
.header-main .sub {
  margin-top: 6px; /* 与标题分开，避免拥挤 */
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.sub {
  width: 100%;
  margin-top: 2px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.form-card {
  width: 100%;
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  box-shadow: var(--el-box-shadow-light);
}
.company-form {
  padding-top: 10px;
}
.company-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

/* 分组样式 */
.form-section {
  margin-bottom: 32px;
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
}
.section-header {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 16px 20px;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-light);
}
.section-header .el-icon {
  font-size: 18px;
  color: var(--el-color-primary);
}
.section-content {
  padding: 20px;
}
.form-actions {
  position: sticky;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  gap: 16px; // 间距更舒适
  justify-content: center; // 居中对齐
  width: 100%;
  padding: 12px 24px;
  margin-top: 16px;
  background: rgb(255 255 255 / 92%);
  backdrop-filter: saturate(180%) blur(6px);
  border-top: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 -8px 16px -12px rgb(0 0 0 / 15%);
}
.form-actions .action-btn {
  min-width: 200px; // 按钮更长
  padding: 0 24px; // 视觉更宽
}
</style>
