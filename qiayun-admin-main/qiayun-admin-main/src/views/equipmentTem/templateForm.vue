<template>
  <div class="create-template-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
        <h1 class="page-title">{{ pageTitle }}</h1>
      </div>
    </div>

    <!-- 表单内容 -->
    <div class="form-container">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px" class="template-form">
        <!-- 1. 基础信息 -->
        <div class="form-section">
          <div class="section-title">基础信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="模板名称" prop="name">
                <el-input v-model="formData.name" placeholder="请输入模板名称" maxlength="100" show-word-limit />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="模板类型" prop="type">
                <el-select v-model="formData.type" placeholder="请选择模板类型" @change="handleTypeChange" style="width: 100%">
                  <el-option label="低压柜" value="LOW_VOLTAGE_CABINET" />
                  <el-option label="变压器" value="TRANSFORMER" />
                  <el-option label="高压柜" value="HIGH_VOLTAGE_CABINET" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="模板描述" prop="description">
            <el-input v-model="formData.description" type="textarea" placeholder="请输入模板描述" :rows="3" />
          </el-form-item>
        </div>

        <!-- 2. 用户基础信息 -->
        <div class="form-section">
          <div class="section-header">
            <div class="section-title">用户基础信息</div>
            <el-button type="primary" link @click="addUserInfoItem">
              <el-icon><Plus /></el-icon> 新增
            </el-button>
          </div>
          <div class="section-content">
            <div v-for="(item, index) in structure.userBasicInfo" :key="index" class="small-form-row">
              <el-input v-model="item.name" placeholder="名称" />
              <el-select v-model="item.type" placeholder="填写类型">
                <el-option label="文本" value="TEXT" />
                <el-option label="数字" value="NUMBER" />
                <el-option label="日期" value="DATE" />
              </el-select>
              <el-input v-model="item.defaultValue" placeholder="默认值" />
              <el-input v-if="item.type === 'NUMBER'" v-model="item.unit" placeholder="单位" />
              <el-button type="danger" link @click="removeUserInfoItem(index)">
                <el-icon><Delete /></el-icon>
              </el-button>
              <div v-if="item.type !== 'NUMBER'" class="el-input el-input--default"></div>
            </div>
          </div>
        </div>

        <!-- 3. 设备基础信息 -->
        <div class="form-section">
          <div class="section-header">
            <div class="section-title">{{ equipmentInfoTitle }}</div>
            <el-button type="primary" link @click="addMainModule">
              <el-icon><Plus /></el-icon> 新增模块
            </el-button>
          </div>
          <div class="section-content">
            <div v-for="(mainModule, mIndex) in structure.equipmentBasicInfo" :key="mIndex" class="main-module-card">
              <div class="module-header">
                <span class="module-title"></span>
                <div class="module-actions">
                  <el-button type="primary" link @click="addSubModule(mIndex)">新增子模块</el-button>
                  <el-button type="primary" link @click="addMainModuleField(mIndex)">新增表单</el-button>
                  <el-button type="danger" link @click="removeMainModule(mIndex)">删除</el-button>
                </div>
              </div>

              <!-- 子模块列表 (Moved above fields) -->
              <div class="sub-modules" v-if="mainModule.subModules.length > 0">
                <div v-for="(subModule, sIndex) in mainModule.subModules" :key="sIndex" class="sub-module-box">
                  <div class="sub-module-header">
                    <el-input v-model="subModule.name" placeholder="子模块名称" style="width: 200px" />
                    <el-button type="primary" link @click="addSubModuleField(mIndex, sIndex)">
                      <el-icon><Plus /></el-icon>
                    </el-button>
                    <el-button type="danger" link @click="removeSubModule(mIndex, sIndex)">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                  <div class="sub-module-fields">
                    <div v-for="(subField, sfIndex) in subModule.fields" :key="sfIndex" class="small-form-row">
                      <el-input v-model="subField.name" placeholder="名称" />
                      <el-select v-model="subField.type" placeholder="填写类型">
                        <el-option label="文本" value="TEXT" />
                        <el-option label="数字" value="NUMBER" />
                        <el-option label="日期" value="DATE" />
                      </el-select>
                      <el-input v-model="subField.defaultValue" placeholder="默认值" />
                      <el-input v-if="subField.type === 'NUMBER'" v-model="subField.unit" placeholder="单位" />
                      <el-button type="danger" link @click="removeSubModuleField(mIndex, sIndex, sfIndex)">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                      <div v-if="subField.type !== 'NUMBER'" class="el-input el-input--default"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 主模块的小表单 -->
              <div class="module-fields">
                <div v-for="(field, fIndex) in mainModule.fields" :key="fIndex" class="small-form-row">
                  <el-input v-model="field.name" placeholder="名称" />
                  <el-select v-model="field.type" placeholder="填写类型">
                    <el-option label="文本" value="TEXT" />
                    <el-option label="数字" value="NUMBER" />
                    <el-option label="日期" value="DATE" />
                  </el-select>
                  <el-input v-model="field.defaultValue" placeholder="默认值" />
                  <el-input v-if="field.type === 'NUMBER'" v-model="field.unit" placeholder="单位" />
                  <el-button type="danger" link @click="removeMainModuleField(mIndex, fIndex)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                  <div v-if="field.type !== 'NUMBER'" class="el-input el-input--default"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-form>
    </div>

    <!-- 底部操作按钮 -->
    <div class="form-footer">
      <el-button @click="handleCancel" size="large">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading" size="large">保存</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Plus, Delete, ArrowLeft } from "@element-plus/icons-vue";
import { createEquipmentTemApi, updateEquipmentTemApi, queryEquipmentTemDetailApi } from "@/api/modules/equipment";
import type { Equipment } from "@/api/interface";
import { useTabsStore } from "@/stores/modules/tabs";
const tabStore = useTabsStore();

const route = useRoute();
const router = useRouter();
const formRef = ref();
const loading = ref(false);
const id = ref(route.params.id as string);

const pageTitle = computed(() => (id.value ? "编辑设备模版" : "创建设备模版"));
const goBack = () => router.back();

interface FieldItem {
  name: string;
  type: "TEXT" | "NUMBER" | "DATE";
  defaultValue: string;
  unit: string;
  value: string;
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

const formData = reactive<Omit<Equipment.ReqCreateEquipmentTem, "defaultStructure">>({
  name: "",
  type: "",
  description: ""
});

const structure = reactive<TemplateStructure>({
  userBasicInfo: [{ name: "", type: "TEXT", defaultValue: "", unit: "", value: "" }],
  equipmentBasicInfo: [
    {
      subModules: [
        {
          name: "",
          fields: [{ name: "", type: "TEXT", defaultValue: "", unit: "", value: "" }]
        }
      ],
      fields: [{ name: "", type: "TEXT", defaultValue: "", unit: "", value: "" }]
    }
  ]
});

const rules = {
  name: [{ required: true, message: "请输入模板名称", trigger: "blur" }],
  type: [{ required: true, message: "请选择模板类型", trigger: "change" }]
};

const equipmentInfoTitle = computed(() => {
  const map: Record<string, string> = {
    LOW_VOLTAGE_CABINET: "低压设备基础信息",
    TRANSFORMER: "变压设备基础信息",
    HIGH_VOLTAGE_CABINET: "高压设备基础信息"
  };
  return map[formData.type] || "设备基础信息";
});

const handleTypeChange = () => {
  // Can clear structure if needed, but keeping it for now
};

// User Info Methods
const addUserInfoItem = () => {
  structure.userBasicInfo.push({ name: "", type: "TEXT", defaultValue: "", unit: "", value: "" });
};
const removeUserInfoItem = (index: number) => {
  structure.userBasicInfo.splice(index, 1);
};

// Main Module Methods
const addMainModule = () => {
  structure.equipmentBasicInfo.push({
    subModules: [
      {
        name: "",
        fields: [{ name: "", type: "TEXT", defaultValue: "", unit: "", value: "" }]
      }
    ],
    fields: [{ name: "", type: "TEXT", defaultValue: "", unit: "", value: "" }]
  });
};
const removeMainModule = (index: number) => {
  structure.equipmentBasicInfo.splice(index, 1);
};
const addMainModuleField = (mainIndex: number) => {
  structure.equipmentBasicInfo[mainIndex].fields.push({ name: "", type: "TEXT", defaultValue: "", unit: "", value: "" });
};
const removeMainModuleField = (mainIndex: number, fieldIndex: number) => {
  structure.equipmentBasicInfo[mainIndex].fields.splice(fieldIndex, 1);
};

// Sub Module Methods
const addSubModule = (mainIndex: number) => {
  structure.equipmentBasicInfo[mainIndex].subModules.push({
    name: "",
    fields: [{ name: "", type: "TEXT", defaultValue: "", unit: "", value: "" }]
  });
};
const removeSubModule = (mainIndex: number, subIndex: number) => {
  structure.equipmentBasicInfo[mainIndex].subModules.splice(subIndex, 1);
};
const addSubModuleField = (mainIndex: number, subIndex: number) => {
  structure.equipmentBasicInfo[mainIndex].subModules[subIndex].fields.push({
    name: "",
    type: "TEXT",
    defaultValue: "",
    unit: "",
    value: ""
  });
};
const removeSubModuleField = (mainIndex: number, subIndex: number, fieldIndex: number) => {
  structure.equipmentBasicInfo[mainIndex].subModules[subIndex].fields.splice(fieldIndex, 1);
};

const init = async () => {
  if (id.value) {
    loading.value = true;
    try {
      const { data } = await queryEquipmentTemDetailApi(id.value);
      formData.name = data.name;
      formData.type = data.type;
      formData.description = data.description;
      if (data.defaultStructure) {
        try {
          const parsed = JSON.parse(data.defaultStructure);
          structure.userBasicInfo = parsed.userBasicInfo || [];
          structure.equipmentBasicInfo = parsed.equipmentBasicInfo || [];
        } catch (e) {
          console.error("Failed to parse defaultStructure", e);
        }
      }
    } finally {
      loading.value = false;
    }
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;
      try {
        const params = {
          ...formData,
          defaultStructure: JSON.stringify(structure)
        };
        if (id.value) {
          await updateEquipmentTemApi(id.value, params);
          ElMessage.success("更新成功");
        } else {
          await createEquipmentTemApi(params);
          ElMessage.success("创建成功");
        }
        router.back();
        const currentTabPath = route.fullPath;
        tabStore.removeTabs(currentTabPath, false);
      } finally {
        loading.value = false;
      }
    }
  });
};

const handleCancel = () => {
  router.back();
};

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
.create-template-container {
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

.template-form {
  padding: 24px;
}

.form-section {
  padding: 16px;
  margin-bottom: 24px;
  background: #f8f9fa;
  border-left: 4px solid #409eff;
  border-radius: 6px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .section-title {
    padding-left: 8px;
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 600;
    color: #333333;
    // For section header flexibility
    margin-bottom: 0;
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

.small-form-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;

  .el-input,
  .el-select {
    flex: 1;
  }

  .el-button {
    margin-left: 10px;
  }
}

.main-module-card {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
  background-color: #fff;

  .module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;

    .module-title {
      font-weight: bold;
    }
  }

  .module-fields {
    margin-top: 15px;
    padding-left: 10px;
  }
}

.sub-modules {
  padding-left: 10px;
  margin-bottom: 15px;
}

.sub-module-box {
  margin-bottom: 15px;
  background-color: #fcfcfc;
  padding: 10px;
  border: 2px dashed #409eff;
  border-radius: 4px;

  .sub-module-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
}
</style>
