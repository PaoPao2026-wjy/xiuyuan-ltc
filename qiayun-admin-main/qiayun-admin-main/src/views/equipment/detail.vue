<template>
  <div class="equipment-detail-container">
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
        <h1 class="page-title">设备详情</h1>
      </div>
    </div>

    <div class="content-container" v-loading="loading">
      <!-- 1. 基础信息 -->
      <div class="section">
        <div class="section-title">基础信息</div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="设备名称">{{ detailData.name || "-" }}</el-descriptions-item>
          <el-descriptions-item label="设备编号">{{ detailData.equipmentNo || "-" }}</el-descriptions-item>
          <el-descriptions-item label="设备类型">{{ formatType(detailData.type) }}</el-descriptions-item>
          <el-descriptions-item label="所属企业">{{ detailData.enterprise?.enterpriseName || "-" }}</el-descriptions-item>
          <el-descriptions-item label="出厂日期">{{ formatDate(detailData.manufactureDate) }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(detailData.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ detailData.remarks || "-" }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 2. 图片信息 -->
      <div class="section">
        <div class="section-title">图片信息</div>
        <div class="photo-group">
          <div class="photo-item">
            <div class="photo-label">铭牌照片：</div>
            <div class="photo-content">
              <el-image
                v-if="detailData.nameplatePhoto"
                style="width: 120px; height: 120px"
                :src="detailData.nameplatePhoto"
                :preview-src-list="[detailData.nameplatePhoto]"
                fit="cover"
                preview-teleported
              />
              <span v-else class="no-data">暂无</span>
            </div>
          </div>
          <div class="photo-item">
            <div class="photo-label">设备照片：</div>
            <div class="photo-content">
              <template v-if="detailData.devicePhotos && detailData.devicePhotos.length">
                <el-image
                  v-for="(photo, index) in detailData.devicePhotos"
                  :key="index"
                  style="width: 120px; height: 120px; margin-right: 10px; margin-bottom: 10px"
                  :src="photo"
                  :preview-src-list="detailData.devicePhotos"
                  :initial-index="index"
                  fit="cover"
                  preview-teleported
                />
              </template>
              <span v-else class="no-data">暂无</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. 参数信息 -->
      <div class="section" v-if="hasStructure">
        <div class="section-title">参数信息</div>

        <!-- 用户基础信息 -->
        <div class="sub-section" v-if="structure.userBasicInfo && structure.userBasicInfo.length">
          <div class="sub-title">用户基础信息</div>
          <el-descriptions :column="3" border>
            <el-descriptions-item
              v-for="(item, index) in structure.userBasicInfo"
              :key="index"
              :label="item.name + (item.unit ? ` (${item.unit})` : '')"
            >
              {{ formatValue(item) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 设备基础信息 -->
        <div class="sub-section" v-if="structure.equipmentBasicInfo && structure.equipmentBasicInfo.length">
          <div class="sub-title">{{ equipmentInfoTitle }}</div>

          <el-card v-for="(mainModule, mIndex) in structure.equipmentBasicInfo" :key="mIndex" class="module-card" shadow="hover">
            <!-- 子模块 -->
            <div v-for="(subModule, sIndex) in mainModule.subModules" :key="sIndex" class="sub-module">
              <div class="module-name">{{ subModule.name }}</div>
              <el-descriptions :column="3" border>
                <el-descriptions-item
                  v-for="(field, fIndex) in subModule.fields"
                  :key="fIndex"
                  :label="field.name + (field.unit ? ` (${field.unit})` : '')"
                >
                  {{ formatValue(field) }}
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 主模块字段 -->
            <div class="main-fields" v-if="mainModule.fields && mainModule.fields.length">
              <el-descriptions :column="3" border>
                <el-descriptions-item
                  v-for="(field, fIndex) in mainModule.fields"
                  :key="fIndex"
                  :label="field.name + (field.unit ? ` (${field.unit})` : '')"
                >
                  {{ formatValue(field) }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft } from "@element-plus/icons-vue";
import { queryEquipmentDetailApi } from "@/api/modules/equipment";
import type { Equipment } from "@/api/interface";
import { useTabsStore } from "@/stores/modules/tabs";

const tabStore = useTabsStore();
const route = useRoute();
const router = useRouter();
const loading = ref(false);
const id = route.params.id as string;

const detailData = ref<Partial<Equipment.ResEquipment>>({});

interface FieldItem {
  name: string;
  type: "TEXT" | "NUMBER" | "DATE";
  defaultValue: string;
  unit: string;
  value?: string | number;
}

interface SubModule {
  name: string;
  fields: FieldItem[];
}

interface MainModule {
  subModules: SubModule[];
  fields: FieldItem[];
}

interface TemplateStructure {
  userBasicInfo: FieldItem[];
  equipmentBasicInfo: MainModule[];
}

const structure = reactive<TemplateStructure>({
  userBasicInfo: [],
  equipmentBasicInfo: []
});

const hasStructure = computed(() => {
  return structure.userBasicInfo.length > 0 || structure.equipmentBasicInfo.length > 0;
});

const equipmentInfoTitle = computed(() => {
  const map: Record<string, string> = {
    LOW_VOLTAGE_CABINET: "低压设备基础信息",
    TRANSFORMER: "变压设备基础信息",
    HIGH_VOLTAGE_CABINET: "高压设备基础信息"
  };
  return detailData.value.type ? map[detailData.value.type] || "设备基础信息" : "设备基础信息";
});

const formatType = (type?: string) => {
  const map: Record<string, string> = {
    LOW_VOLTAGE_CABINET: "低压柜",
    TRANSFORMER: "变压器",
    HIGH_VOLTAGE_CABINET: "高压柜"
  };
  return type ? map[type] || type : "-";
};

const formatDate = (date?: string) => {
  if (!date) return "-";
  return date.split("T")[0];
};

const formatValue = (item: FieldItem) => {
  if (item.value === undefined || item.value === null || item.value === "") return "-";
  return item.value;
};

const init = async () => {
  if (!id) return;
  loading.value = true;
  try {
    const { data } = await queryEquipmentDetailApi(id);
    detailData.value = data;

    if (data.customInfo) {
      try {
        const parsed = JSON.parse(data.customInfo);
        structure.userBasicInfo = parsed.userBasicInfo || [];
        structure.equipmentBasicInfo = parsed.equipmentBasicInfo || [];
      } catch (e) {
        console.error("Failed to parse customInfo structure", e);
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.back();
  const currentTabPath = route.fullPath;
  tabStore.removeTabs(currentTabPath, false);
};

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
.equipment-detail-container {
  min-height: 100vh;
  padding: 20px;
  background: #f5f7fa;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  margin-bottom: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);

  .header-left {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .page-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #333333;
  }
}

.content-container {
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
}

.section {
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }

  .section-title {
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 600;
    color: #333333;
    padding-left: 10px;
    border-left: 4px solid #409eff;
  }
}

.photo-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.photo-item {
  display: flex;
  align-items: flex-start;

  .photo-label {
    width: 100px;
    font-weight: 500;
    color: #606266;
    margin-right: 12px;
  }

  .photo-content {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
  }
}

.no-data {
  color: #909399;
}

.sub-section {
  margin-bottom: 24px;

  .sub-title {
    font-size: 14px;
    font-weight: bold;
    color: #606266;
    margin-bottom: 12px;
    background-color: #f5f7fa;
    padding: 8px 12px;
    border-radius: 4px;
  }
}

.module-card {
  margin-bottom: 20px;
}

.sub-module {
  margin-bottom: 16px;

  .module-name {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 8px;
    color: #303133;
  }
}

.main-fields {
  margin-top: 16px;
}
</style>
