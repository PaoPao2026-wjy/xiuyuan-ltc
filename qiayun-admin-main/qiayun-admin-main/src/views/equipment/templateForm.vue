<template>
  <div class="create-equipment-container">
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
        <h1 class="page-title">{{ pageTitle }}</h1>
      </div>
    </div>

    <div class="form-container">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px" class="equipment-form">
        <!-- 1. 基础信息 -->
        <div class="form-section">
          <div class="section-title">基础信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="设备名称" prop="name">
                <el-input v-model="formData.name" placeholder="请输入设备名称" maxlength="100" show-word-limit />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="设备编号" prop="equipmentNo">
                <el-input v-model="formData.equipmentNo" placeholder="请输入设备编号" maxlength="50" show-word-limit />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="设备类型" prop="type">
                <el-select v-model="formData.type" placeholder="请选择设备类型" @change="handleTypeChange" style="width: 100%">
                  <el-option label="低压柜" value="LOW_VOLTAGE_CABINET" />
                  <el-option label="变压器" value="TRANSFORMER" />
                  <el-option label="高压柜" value="HIGH_VOLTAGE_CABINET" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="所属企业" prop="enterpriseId">
                <el-select v-model="formData.enterpriseId" placeholder="请选择所属企业" filterable clearable style="width: 100%">
                  <el-option v-for="item in companyOptions" :key="item.id" :label="item.enterpriseName" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="出厂日期" prop="manufactureDate">
                <el-date-picker
                  v-model="formData.manufactureDate"
                  type="date"
                  placeholder="请选择出厂日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="设备模板" prop="templateId">
                <el-select
                  v-model="formData.templateId"
                  placeholder="请选择设备模板"
                  :disabled="!formData.type"
                  @change="handleTemplateChange"
                  style="width: 100%"
                >
                  <el-option v-for="item in templateOptions" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="备注" prop="remark">
                <el-input
                  v-model="formData.remark"
                  type="textarea"
                  placeholder="请输入备注"
                  :rows="3"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 2. 图片信息 -->
        <div class="form-section">
          <div class="section-title">图片信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="铭牌照片" prop="nameplatePhoto">
                <UploadImgs v-model:file-list="nameplateFileList" :limit="1">
                  <template #tip>请上传一张铭牌照片</template>
                </UploadImgs>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="设备照片" prop="devicePhotos">
                <UploadImgs v-model:file-list="deviceFileList" :limit="9">
                  <template #tip>最多上传9张设备照片</template>
                </UploadImgs>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 3. 模板参数表单 -->
        <div class="form-section" v-if="structure.userBasicInfo.length || structure.equipmentBasicInfo.length">
          <div class="section-title">参数信息</div>

          <!-- 用户基础信息 -->
          <div class="sub-section" v-if="structure.userBasicInfo.length">
            <div class="sub-title">用户基础信息</div>
            <div class="form-grid">
              <el-form-item
                v-for="(item, index) in structure.userBasicInfo"
                :key="index"
                :label="item.name + (item.unit ? ` (${item.unit})` : '')"
              >
                <el-date-picker
                  v-if="item.type === 'DATE'"
                  v-model="item.value"
                  type="date"
                  placeholder="请选择"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
                <el-input
                  v-else-if="item.type === 'NUMBER'"
                  v-model="item.value"
                  type="number"
                  placeholder="请输入"
                  style="width: 100%"
                >
                  <template #append v-if="item.unit">{{ item.unit }}</template>
                </el-input>
                <el-input v-else v-model="item.value" placeholder="请输入" />
              </el-form-item>
            </div>
          </div>

          <!-- 设备基础信息 -->
          <div class="sub-section" v-if="structure.equipmentBasicInfo.length">
            <div class="sub-title">{{ equipmentInfoTitle }}</div>
            <div v-for="(mainModule, mIndex) in structure.equipmentBasicInfo" :key="mIndex" class="main-module-card">
              <div class="module-header">
                <span class="module-title"></span>
              </div>

              <!-- 子模块 -->
              <div v-for="(subModule, sIndex) in mainModule.subModules" :key="sIndex" class="sub-module-box">
                <div class="sub-module-title">{{ subModule.name }}</div>
                <div class="form-grid">
                  <el-form-item
                    v-for="(subField, sfIndex) in subModule.fields"
                    :key="sfIndex"
                    :label="subField.name + (subField.unit ? ` (${subField.unit})` : '')"
                  >
                    <el-date-picker
                      v-if="subField.type === 'DATE'"
                      v-model="subField.value"
                      type="date"
                      placeholder="请选择"
                      value-format="YYYY-MM-DD"
                      style="width: 100%"
                    />
                    <el-input
                      v-else-if="subField.type === 'NUMBER'"
                      v-model="subField.value"
                      type="number"
                      placeholder="请输入数字"
                      style="width: 100%"
                    >
                      <template #append v-if="subField.unit">{{ subField.unit }}</template>
                    </el-input>
                    <el-input v-else v-model="subField.value" placeholder="请输入" />
                  </el-form-item>
                </div>
              </div>

              <!-- 主模块表单 -->
              <div class="form-grid">
                <el-form-item
                  v-for="(field, fIndex) in mainModule.fields"
                  :key="fIndex"
                  :label="field.name + (field.unit ? ` (${field.unit})` : '')"
                >
                  <el-date-picker
                    v-if="field.type === 'DATE'"
                    v-model="field.value"
                    type="date"
                    placeholder="请选择"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                  />
                  <el-input
                    v-else-if="field.type === 'NUMBER'"
                    v-model="field.value"
                    type="number"
                    placeholder="请输入数字"
                    style="width: 100%"
                  >
                    <template #append v-if="field.unit">{{ field.unit }}</template>
                  </el-input>
                  <el-input v-else v-model="field.value" placeholder="请输入" />
                </el-form-item>
              </div>
            </div>
          </div>
        </div>
      </el-form>
    </div>

    <div class="form-footer">
      <el-button @click="goBack" size="large">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading" size="large">保存</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, UploadUserFile } from "element-plus";
import { ArrowLeft } from "@element-plus/icons-vue";
import {
  createEquipmentApi,
  updateEquipmentApi,
  queryEquipmentDetailApi,
  queryEquipmentTemListByTypeApi
} from "@/api/modules/equipment";
import { queryAllCompanyApi } from "@/api/modules/company";
import UploadImgs from "@/components/Upload/Imgs.vue";
import type { Equipment, Company } from "@/api/interface";
import { useTabsStore } from "@/stores/modules/tabs";
const tabStore = useTabsStore();

const route = useRoute();
const router = useRouter();
const formRef = ref();
const loading = ref(false);
const id = ref(route.params.id as string);

const pageTitle = computed(() => (id.value ? "编辑设备" : "新建设备"));

interface FieldItem {
  name: string;
  type: "TEXT" | "NUMBER" | "DATE";
  defaultValue: string;
  unit: string;
  value?: string | number; // Store user input here
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

// Form Data
const formData = reactive({
  name: "",
  equipmentNo: "",
  type: "",
  enterpriseId: "",
  manufactureDate: "",
  templateId: "",
  remark: ""
});

// Image Lists
const nameplateFileList = ref<UploadUserFile[]>([]);
const deviceFileList = ref<UploadUserFile[]>([]);

// Options
const companyOptions = ref<Company.ResCompany[]>([]);
const templateOptions = ref<Equipment.ResEquipmentTem[]>([]);

// Structure for dynamic rendering
const structure = reactive<TemplateStructure>({
  userBasicInfo: [],
  equipmentBasicInfo: []
});

const rules = {
  name: [{ required: true, message: "请输入设备名称", trigger: "blur" }],
  equipmentNo: [{ required: true, message: "请输入设备编号", trigger: "blur" }],
  type: [{ required: true, message: "请选择设备类型", trigger: "change" }],
  enterpriseId: [{ required: true, message: "请选择所属企业", trigger: "change" }],
  manufactureDate: [{ required: true, message: "请选择出厂日期", trigger: "change" }],
  //   templateId: [{ required: true, message: "请选择设备模板", trigger: "change" }],
  nameplatePhoto: [
    {
      required: true,
      validator: (rule: any, value: any, callback: any) => {
        if (nameplateFileList.value.length === 0) {
          callback(new Error("请上传铭牌照片"));
        } else {
          callback();
        }
      },
      trigger: "change"
    }
  ]
};

const equipmentInfoTitle = computed(() => {
  const map: Record<string, string> = {
    LOW_VOLTAGE_CABINET: "低压设备基础信息",
    TRANSFORMER: "变压设备基础信息",
    HIGH_VOLTAGE_CABINET: "高压设备基础信息"
  };
  return map[formData.type] || "设备基础信息";
});

// Load Companies
const loadCompanies = async () => {
  try {
    const { data } = await queryAllCompanyApi();
    if (Array.isArray(data)) {
      companyOptions.value = data;
    } else if (data && Array.isArray((data as any).list)) {
      companyOptions.value = (data as any).list;
    }
  } catch (e) {
    console.error(e);
  }
};

// Load Templates by Type
const loadTemplates = async (type: string) => {
  if (!type) {
    templateOptions.value = [];
    return;
  }
  try {
    const { data } = await queryEquipmentTemListByTypeApi(type);
    templateOptions.value = data || [];
  } catch (e) {
    console.error(e);
  }
};

const handleTypeChange = () => {
  formData.templateId = "";
  structure.userBasicInfo = [];
  structure.equipmentBasicInfo = [];
  loadTemplates(formData.type);
};

const handleTemplateChange = (templateId: string) => {
  const template = templateOptions.value.find(t => t.id === templateId);
  if (template && template.defaultStructure) {
    try {
      const parsed = JSON.parse(template.defaultStructure);
      // Initialize value with defaultValue if not present
      const initValues = (items: FieldItem[]) => {
        items.forEach(item => {
          if (item.value === undefined) {
            item.value = item.defaultValue;
          }
        });
      };

      if (parsed.userBasicInfo) initValues(parsed.userBasicInfo);
      if (parsed.equipmentBasicInfo) {
        parsed.equipmentBasicInfo.forEach((m: MainModule) => {
          initValues(m.fields);
          m.subModules.forEach(s => initValues(s.fields));
        });
      }

      structure.userBasicInfo = parsed.userBasicInfo || [];
      structure.equipmentBasicInfo = parsed.equipmentBasicInfo || [];
    } catch (e) {
      console.error("Failed to parse template structure", e);
    }
  }
};

const init = async () => {
  await loadCompanies();
  if (id.value) {
    loading.value = true;
    try {
      const { data } = await queryEquipmentDetailApi(id.value);
      formData.name = data.name;
      formData.equipmentNo = data.equipmentNo || "";
      formData.type = data.type;
      formData.enterpriseId = data.enterpriseId || "";
      formData.manufactureDate = data.manufactureDate?.split("T")[0] || ""; // Handle ISO string
      formData.remark = data.remarks || "";

      // Load templates for the type
      await loadTemplates(data.type);

      // Handle photos
      if (data.nameplatePhoto) {
        nameplateFileList.value = [{ name: "nameplate", url: data.nameplatePhoto }];
      }
      if (data.devicePhotos) {
        deviceFileList.value = data.devicePhotos.map((url, i) => ({ name: `photo${i}`, url }));
      }

      // Handle custom structure values
      if (data.customInfo) {
        try {
          const parsed = JSON.parse(data.customInfo);
          structure.userBasicInfo = parsed.userBasicInfo || [];
          structure.equipmentBasicInfo = parsed.equipmentBasicInfo || [];
        } catch (e) {
          console.error("Failed to parse customInfo structure", e);
        }
      }
    } finally {
      loading.value = false;
    }
  }
};

const goBack = () => {
  router.back();
  const currentTabPath = route.fullPath;
  tabStore.removeTabs(currentTabPath, false);
};

const handleSubmit = async () => {
  console.log("structure====>", structure);

  if (!formRef.value) return;
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;
      try {
        const params: Equipment.ReqCreateEquipment = {
          name: formData.name,
          equipmentNo: formData.equipmentNo,
          type: formData.type,
          enterpriseId: formData.enterpriseId,
          manufactureDate: formData.manufactureDate, // Should be YYYY-MM-DD, convert to ISO if backend requires full
          nameplatePhoto: nameplateFileList.value[0]?.url || "",
          devicePhotos: deviceFileList.value.map(f => f.url!).filter(Boolean),
          customInfo: JSON.stringify(structure),
          remarks: formData.remark
        };

        if (id.value) {
          await updateEquipmentApi(id.value, params);
          ElMessage.success("更新成功");
        } else {
          await createEquipmentApi(params);
          ElMessage.success("创建成功");
        }
        goBack();
      } finally {
        loading.value = false;
      }
    }
  });
};

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
.create-equipment-container {
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

.form-container {
  margin-bottom: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
}

.equipment-form {
  padding: 24px;
}

.form-section {
  padding: 16px;
  margin-bottom: 24px;
  background: #f8f9fa;
  border-left: 4px solid #409eff;
  border-radius: 6px;

  .section-title {
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 600;
    color: #333333;
  }

  .sub-section {
    margin-bottom: 20px;
    .sub-title {
      font-weight: bold;
      margin-bottom: 10px;
      color: #606266;
    }
  }
}

.form-footer {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
}

.main-module-card {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
  background-color: #fff;

  .module-header {
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
    font-weight: bold;
  }
}

.sub-module-box {
  background-color: #fcfcfc;
  padding: 10px;
  margin-bottom: 10px;
  border: 2px dashed #409eff;
  border-radius: 4px;

  .sub-module-title {
    font-weight: bold;
    margin-bottom: 10px;
    font-size: 14px;
  }
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 0 20px;
}
</style>
