<template>
  <div class="card content-box">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px" class="template-form">
      <el-form-item label="模板名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入模板名称" maxlength="100" show-word-limit />
      </el-form-item>

      <el-form-item label="模板类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择模板类型" style="width: 100%">
          <el-option label="低压柜" value="LOW_VOLTAGE_CABINET" />
          <el-option label="变压器" value="TRANSFORMER" />
          <el-option label="高压柜" value="HIGH_VOLTAGE_CABINET" />
        </el-select>
      </el-form-item>

      <el-form-item label="模板描述" prop="description">
        <el-input type="textarea" v-model="formData.description" placeholder="请输入模板描述" />
      </el-form-item>

      <el-divider content-position="left">模板参数结构</el-divider>

      <!-- 用户基础信息 -->
      <div class="module-section">
        <div class="section-header">
          <span class="title">用户基础信息</span>
          <el-button type="primary" link @click="addItem('userBasicInfo')">
            <el-icon><Plus /></el-icon> 新增项
          </el-button>
        </div>
        <div class="items-container">
          <div v-for="(item, index) in formData.structure.userBasicInfo" :key="index" class="item-row">
            <el-row :gutter="10">
              <el-col :span="6">
                <el-input v-model="item.name" placeholder="名称" />
              </el-col>
              <el-col :span="5">
                <el-select v-model="item.type" placeholder="填写类型">
                  <el-option label="文本" value="TEXT" />
                  <el-option label="数字" value="NUMBER" />
                  <el-option label="日期" value="DATE" />
                </el-select>
              </el-col>
              <el-col :span="5">
                <el-input v-model="item.defaultValue" placeholder="默认值" />
              </el-col>
              <el-col :span="5">
                <el-input v-model="item.unit" placeholder="单位" />
              </el-col>
              <el-col :span="3" class="action-col">
                <el-button type="danger" link @click="removeItem('userBasicInfo', index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>

      <!-- 设备基础信息 -->
      <div class="module-section">
        <div class="section-header">
          <span class="title">{{ equipmentInfoLabel }}</span>
          <el-button type="primary" link @click="addSubModule">
            <el-icon><Plus /></el-icon> 新增子模块
          </el-button>
        </div>
        <div v-for="(subModule, smIndex) in formData.structure.equipmentBasicInfo" :key="smIndex" class="sub-module">
          <div class="sub-module-header">
            <el-input v-model="subModule.name" placeholder="子模块名称" style="width: 200px; margin-right: 10px" />
            <el-button type="primary" link @click="addSubModuleItem(smIndex)">
              <el-icon><Plus /></el-icon>
            </el-button>
            <el-button type="danger" link @click="removeSubModule(smIndex)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          <div class="items-container">
            <div v-for="(item, itemIndex) in subModule.items" :key="itemIndex" class="item-row">
              <el-row :gutter="10">
                <el-col :span="6">
                  <el-input v-model="item.name" placeholder="名称" />
                </el-col>
                <el-col :span="5">
                  <el-select v-model="item.type" placeholder="填写类型">
                    <el-option label="文本" value="TEXT" />
                    <el-option label="数字" value="NUMBER" />
                    <el-option label="日期" value="DATE" />
                  </el-select>
                </el-col>
                <el-col :span="5">
                  <el-input v-model="item.defaultValue" placeholder="默认值" />
                </el-col>
                <el-col :span="5">
                  <el-input v-model="item.unit" placeholder="单位" />
                </el-col>
                <el-col :span="3" class="action-col">
                  <el-button type="danger" link @click="removeSubModuleItem(smIndex, itemIndex)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>
      </div>

      <!-- 通用信息 -->
      <div class="module-section">
        <div class="section-header">
          <span class="title">通用信息</span>
          <el-button type="primary" link @click="addItem('generalInfo')">
            <el-icon><Plus /></el-icon> 新增项
          </el-button>
        </div>
        <div class="items-container">
          <div v-for="(item, index) in formData.structure.generalInfo" :key="index" class="item-row">
            <el-row :gutter="10">
              <el-col :span="6">
                <el-input v-model="item.name" placeholder="名称" />
              </el-col>
              <el-col :span="5">
                <el-select v-model="item.type" placeholder="填写类型">
                  <el-option label="文本" value="TEXT" />
                  <el-option label="数字" value="NUMBER" />
                  <el-option label="日期" value="DATE" />
                </el-select>
              </el-col>
              <el-col :span="5">
                <el-input v-model="item.defaultValue" placeholder="默认值" />
              </el-col>
              <el-col :span="5">
                <el-input v-model="item.unit" placeholder="单位" />
              </el-col>
              <el-col :span="3" class="action-col">
                <el-button type="danger" link @click="removeItem('generalInfo', index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>

      <el-form-item>
        <el-button type="primary" @click="submitForm" :loading="loading">保存</el-button>
        <el-button @click="goBack">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { Plus, Delete } from "@element-plus/icons-vue";
import { createEquipmentTemApi, updateEquipmentTemApi, queryEquipmentTemDetailApi } from "@/api/modules/equipment";

const route = useRoute();
const router = useRouter();
const formRef = ref<FormInstance>();
const loading = ref(false);

interface FormItem {
  name: string;
  type: string;
  defaultValue: string;
  unit: string;
}

interface SubModule {
  name: string;
  items: FormItem[];
}

interface Structure {
  userBasicInfo: FormItem[];
  equipmentBasicInfo: SubModule[];
  generalInfo: FormItem[];
}

const formData = reactive({
  id: "",
  name: "",
  type: "",
  description: "",
  structure: {
    userBasicInfo: [{ name: "", type: "TEXT", defaultValue: "", unit: "" }],
    equipmentBasicInfo: [
      {
        name: "",
        items: [{ name: "", type: "TEXT", defaultValue: "", unit: "" }]
      }
    ],
    generalInfo: [{ name: "", type: "TEXT", defaultValue: "", unit: "" }]
  } as Structure
});

const rules = reactive<FormRules>({
  name: [
    { required: true, message: "请输入模板名称", trigger: "blur" },
    { max: 100, message: "最长100个字符", trigger: "blur" }
  ],
  type: [{ required: true, message: "请选择模板类型", trigger: "change" }]
});

const equipmentInfoLabel = computed(() => {
  switch (formData.type) {
    case "HIGH_VOLTAGE_CABINET":
      return "高压设备基础信息";
    case "LOW_VOLTAGE_CABINET":
      return "低压设备基础信息";
    case "TRANSFORMER":
      return "变压设备基础信息";
    default:
      return "设备基础信息";
  }
});

const addItem = (section: "userBasicInfo" | "generalInfo") => {
  formData.structure[section].push({ name: "", type: "TEXT", defaultValue: "", unit: "" });
};

const removeItem = (section: "userBasicInfo" | "generalInfo", index: number) => {
  formData.structure[section].splice(index, 1);
};

const addSubModule = () => {
  formData.structure.equipmentBasicInfo.push({
    name: "",
    items: [{ name: "", type: "TEXT", defaultValue: "", unit: "" }]
  });
};

const removeSubModule = (index: number) => {
  formData.structure.equipmentBasicInfo.splice(index, 1);
};

const addSubModuleItem = (subIndex: number) => {
  formData.structure.equipmentBasicInfo[subIndex].items.push({ name: "", type: "TEXT", defaultValue: "", unit: "" });
};

const removeSubModuleItem = (subIndex: number, itemIndex: number) => {
  formData.structure.equipmentBasicInfo[subIndex].items.splice(itemIndex, 1);
};

const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async valid => {
    if (valid) {
      loading.value = true;
      try {
        const params = {
          name: formData.name,
          type: formData.type,
          description: formData.description,
          defaultStructure: JSON.stringify(formData.structure)
        };

        if (formData.id) {
          await updateEquipmentTemApi(formData.id, params);
          ElMessage.success("更新成功");
        } else {
          await createEquipmentTemApi(params);
          ElMessage.success("创建成功");
        }
        goBack();
      } catch (error) {
        console.error(error);
      } finally {
        loading.value = false;
      }
    }
  });
};

const goBack = () => {
  router.back();
};

const init = async () => {
  const id = route.query.id as string;
  if (id) {
    formData.id = id;
    try {
      const { data } = await queryEquipmentTemDetailApi(id);
      formData.name = data.name;
      formData.type = data.type;
      formData.description = data.description;
      if (data.defaultStructure) {
        try {
          formData.structure = JSON.parse(data.defaultStructure);
        } catch (e) {
          console.error("Failed to parse defaultStructure", e);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
};

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
.template-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.module-section {
  margin-bottom: 20px;
  border: 1px solid #eee;
  padding: 15px;
  border-radius: 4px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    font-weight: bold;
    font-size: 14px;
    color: #333;
  }
}

.items-container {
  .item-row {
    margin-bottom: 10px;
  }
}

.sub-module {
  margin-left: 20px;
  margin-bottom: 15px;
  border-left: 2px solid #409eff;
  padding-left: 15px;

  .sub-module-header {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
}

.action-col {
  display: flex;
  justify-content: flex-end;
}
</style>
