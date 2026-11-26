<template>
  <div class="company-detail-page">
    <div class="page-header">
      <div class="header-left">
        <el-button link @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>
      <!-- <div class="header-main">
        <div class="title">企业详情</div>
        <div class="sub">查看企业基础信息与联系人信息</div>
      </div> -->
    </div>

    <el-card class="detail-card" shadow="hover" v-loading="loadingDetail">
      <template #header>
        <div class="card-header">
          <span>基础信息</span>
        </div>
      </template>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="企业名称">{{ detail.enterpriseName || "-" }}</el-descriptions-item>
        <el-descriptions-item label="企业类型">{{ typeText }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ formatDateTime(detail.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="统一社会信用代码">{{ detail.socialCreditCode || "-" }}</el-descriptions-item>
        <el-descriptions-item label="营业执照照片">
          <el-image
            v-if="detail.businessLicensePhoto"
            style="width: 100px; height: 100px"
            :src="detail.businessLicensePhoto"
            :preview-src-list="[detail.businessLicensePhoto]"
            fit="cover"
            :preview-teleported="true"
          />
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="企业地址" :span="3">{{ detail.enterpriseAddress || "-" }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
    <el-card class="detail-card" shadow="hover" v-loading="loadingDetail">
      <template #header>
        <div class="card-header">
          <span>联系人信息</span>
        </div>
      </template>
      <el-descriptions :column="3" border label-width="160px">
        <el-descriptions-item label="联系人姓名">{{ detail.contactName || "-" }}</el-descriptions-item>
        <el-descriptions-item label="联系人职务">{{ detail.contactPosition || "-" }}</el-descriptions-item>
        <el-descriptions-item label="联系人手机">{{ detail.contactMobile || "-" }}</el-descriptions-item>
        <el-descriptions-item label="企业联系电话">{{ detail.contactPhone || "-" }}</el-descriptions-item>
        <el-descriptions-item label="企业邮箱">{{ detail.enterpriseEmail || "-" }}</el-descriptions-item>
        <el-descriptions-item label="联系人邮箱">{{ detail.contactEmail || "-" }}</el-descriptions-item>
        <el-descriptions-item label="第二联系人姓名">{{ detail.contactName2 || "-" }}</el-descriptions-item>
        <el-descriptions-item label="第二联系人手机">{{ detail.contactMobile2 || "-" }}</el-descriptions-item>
        <el-descriptions-item label="第三联系人姓名">{{ detail.contactName3 || "-" }}</el-descriptions-item>
        <el-descriptions-item label="第三联系人手机">{{ detail.contactMobile3 || "-" }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="detail-card" shadow="hover" v-loading="loadingDetail">
      <template #header>
        <div class="card-header">
          <span>设备信息</span>
        </div>
      </template>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="户号1">{{ detail.enterpriseUserNo1 || "-" }}</el-descriptions-item>
        <el-descriptions-item label="户号2">{{ detail.enterpriseUserNo2 || "-" }}</el-descriptions-item>
        <el-descriptions-item label="进线方式">{{ detail.powerSupplyMode || "-" }}</el-descriptions-item>
        <el-descriptions-item label="进线修程">{{ detail.powerSupplyMaintenanceType || "-" }}</el-descriptions-item>
        <el-descriptions-item label="表号1">{{ detail.enterpriseMeterNo1 || "-" }}</el-descriptions-item>
        <el-descriptions-item label="表号2">{{ detail.enterpriseMeterNo2 || "-" }}</el-descriptions-item>
        <el-descriptions-item label="变压器容量1">{{ formatKVA(detail.transformerCapacity1) }}</el-descriptions-item>
        <el-descriptions-item label="变压器容量2">{{ formatKVA(detail.transformerCapacity2) }}</el-descriptions-item>
        <el-descriptions-item label="使用容量1">{{ formatKVA(detail.usageCapacity1) }}</el-descriptions-item>
        <el-descriptions-item label="使用容量2">{{ formatKVA(detail.usageCapacity2) }}</el-descriptions-item>
        <el-descriptions-item label="高压柜数量">{{ detail.highVoltageCabinetCount || "-" }}</el-descriptions-item>
        <el-descriptions-item label="低压柜数量">{{ detail.lowVoltageCabinetCount || "-" }}</el-descriptions-item>
        <el-descriptions-item label="变压器数量">{{ detail.transformerCount || "-" }}</el-descriptions-item>
        <el-descriptions-item label="电容柜数量">{{ detail.capacitorCabinetCount || "-" }}</el-descriptions-item>
        <el-descriptions-item label="直流屏">{{ detail.dcScreen || "-" }}</el-descriptions-item>
        <el-descriptions-item label="模拟屏">{{ detail.analogScreen || "-" }}</el-descriptions-item>
        <el-descriptions-item label="高阻屏">{{ detail.highResistanceScreen || "-" }}</el-descriptions-item>
        <el-descriptions-item label="安全用具">{{ detail.safetyEquipment || "-" }}</el-descriptions-item>
        <el-descriptions-item label="消防器材">{{ detail.fireFightingEquipment || "-" }}</el-descriptions-item>
        <el-descriptions-item label="排风设备">{{ detail.ventilationEquipment || "-" }}</el-descriptions-item>
        <el-descriptions-item label="空调信息">{{ detail.airConditioner || "-" }}</el-descriptions-item>
        <el-descriptions-item label="运检单位">{{ detail.operationMaintenanceUnit || "-" }}</el-descriptions-item>
        <el-descriptions-item label="电试日期">{{ formatDateTime(detail.electricalTestDate) || "-" }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { queryCompanyDetailApi } from "@/api/modules/company";
import { Company } from "@/api/interface";

const route = useRoute();
const router = useRouter();
const loadingDetail = ref(false);

const formatKVA = (val?: number) => (val && val > 0 ? `${val} kVA` : "-");

const detail = reactive<Company.ResCompany>({
  id: "",
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
  createdAt: "",
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

const typeMap = {
  STATE_OWNED: "国有企业",
  PRIVATE: "民营企业",
  FOREIGN: "外资企业",
  JOINT_VENTURE: "合资企业"
};
const typeText = computed(() => typeMap[detail.enterpriseType as keyof typeof typeMap] || "-");

const formatDateTime = (dateString?: string) => {
  if (!dateString) return "-";
  return dateString.replace(/[TZ]/g, " ").replace(/\.\d+/, "");
};

onMounted(async () => {
  const id = (route.params.id as string) || "";
  if (!id) {
    ElMessage.warning("缺少企业ID");
    router.back();
    return;
  }
  loadingDetail.value = true;
  try {
    const res = await queryCompanyDetailApi(id);
    const d = res.data;
    detail.id = d.id;
    detail.enterpriseName = d.enterpriseName;
    detail.enterpriseType = d.enterpriseType;
    detail.socialCreditCode = d.socialCreditCode || "";
    detail.businessLicensePhoto = d.businessLicensePhoto || "";
    detail.enterpriseAddress = d.enterpriseAddress;
    detail.contactPhone = d.contactPhone;
    detail.enterpriseEmail = d.enterpriseEmail;
    detail.contactName = d.contactName;
    detail.contactPosition = d.contactPosition;
    detail.contactMobile = d.contactMobile;
    detail.contactEmail = d.contactEmail;
    detail.contactName2 = d.contactName2 || "";
    detail.contactMobile2 = d.contactMobile2 || "";
    detail.contactName3 = d.contactName3 || "";
    detail.contactMobile3 = d.contactMobile3 || "";
    detail.createdAt = d.createdAt;
    detail.enterpriseUserNo1 = d.enterpriseUserNo1 || "";
    detail.enterpriseUserNo2 = d.enterpriseUserNo2 || "";
    detail.enterpriseMeterNo1 = d.enterpriseMeterNo1 || "";
    detail.enterpriseMeterNo2 = d.enterpriseMeterNo2 || "";
    detail.transformerCapacity1 = d.transformerCapacity1 || 0;
    detail.transformerCapacity2 = d.transformerCapacity2 || 0;
    detail.usageCapacity1 = d.usageCapacity1 || 0;
    detail.usageCapacity2 = d.usageCapacity2 || 0;
    detail.powerSupplyMode = d.powerSupplyMode || "";
    detail.powerSupplyMaintenanceType = d.powerSupplyMaintenanceType || "";
    detail.highVoltageCabinetCount = d.highVoltageCabinetCount || 0;
    detail.lowVoltageCabinetCount = d.lowVoltageCabinetCount || 0;
    detail.transformerCount = d.transformerCount || 0;
    detail.capacitorCabinetCount = d.capacitorCabinetCount || 0;
    detail.dcScreen = d.dcScreen || "";
    detail.operationMaintenanceUnit = d.operationMaintenanceUnit || "";
    detail.electricalTestDate = d.electricalTestDate || "";
    detail.analogScreen = d.analogScreen || "";
    detail.safetyEquipment = d.safetyEquipment || "";
    detail.fireFightingEquipment = d.fireFightingEquipment || "";
    detail.ventilationEquipment = d.ventilationEquipment || "";
    detail.airConditioner = d.airConditioner || "";
    detail.highResistanceScreen = d.highResistanceScreen || "";
  } finally {
    loadingDetail.value = false;
  }
});
</script>

<style scoped lang="scss">
.company-detail-page {
  box-sizing: border-box;
  width: 100%;
  padding: 16px 24px 24px;
  background: var(--el-fill-color-blank);
}
.page-header {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 6px 16px;
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
  margin-top: 6px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.detail-card {
  width: 100%;
  margin-bottom: 16px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  box-shadow: var(--el-box-shadow-light);
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
:deep(.el-descriptions__label) {
  width: 120px;
}
</style>
