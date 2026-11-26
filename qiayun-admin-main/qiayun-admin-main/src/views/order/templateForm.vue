<template>
  <div class="template-form-container">
    <!-- 顶部：模板名称 -->
    <el-card class="basic-card" shadow="never">
      <div class="top-mask"></div>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item class="submit-buttons">
          <el-button type="primary" :loading="saving" @click="submit">保存模板</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
        <el-form-item label="模板名称" prop="templateName">
          <el-input v-model="form.templateName" placeholder="请输入模板名称" clearable />
        </el-form-item>
        <el-form-item label="选择配置项">
          <el-select
            v-model="selectedConfigIds"
            multiple
            filterable
            clearable
            :collapse-tags="true"
            collapse-tags-tooltip
            placeholder="请选择配置项"
            @change="onConfigSelectionChange"
          >
            <el-option v-for="cfg in allConfigs" :key="cfg.id" :label="cfg.name" :value="Number(cfg.id)" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>
    <!-- 配置项表格列表 -->
    <ConfigItemCard
      v-for="cfg in configList"
      :key="cfg.id"
      :cfg="cfg"
      :selected-items="selectedItems"
      :is-operation-checked="isOperationChecked"
      :set-operation-checked="setOperationChecked"
      @toggle-item="onToggleItem"
      @select-all="onSelectAll"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import { Order } from "@/api/interface";
import { useRoute, useRouter } from "vue-router";
import { queryTempCascaderApi, createTemplateApi, updateTemplateApi, queryTemplateDetailApi } from "@/api/modules/order";
import ConfigItemCard from "@/components/ConfigItemCard/index.vue";
import { useTabsStore } from "@/stores/modules/tabs";
const tabStore = useTabsStore();
const route = useRoute();
const router = useRouter();
const formRef = ref();
const saving = ref(false);
const form = reactive({
  templateName: ""
});
const rules = {
  templateName: [{ required: true, message: "请输入模板名称", trigger: "blur" }]
};

const allConfigs = ref<Order.ResTempDetail[]>([]);
const selectedConfigIds = ref<number[]>([]);
// 配置项列表（包含检查项 items 与操作项 operations）
const configList = ref<Order.ResTempDetail[]>([]);

// 勾选状态：每个检查项是否选中
const selectedItems = reactive<Record<number, boolean>>({});

const onToggleItem = (itemId: number, checked: boolean) => {
  selectedItems[itemId] = checked;
};

// 组件事件回调：当前配置项全选/取消全选
const onSelectAll = (cfg: Order.ResTempDetail, checked: boolean) => {
  toggleSelectAll(cfg, checked);
};

// 勾选状态：每个检查项下的操作项选择情况
const selectedOps = reactive<Record<number, Record<number, boolean>>>({});

// 切换全选/取消全选（仅影响“选择”列对应的检查项选择状态）
const toggleSelectAll = (cfg: Order.ResTempDetail, checked: boolean) => {
  (cfg.items || []).forEach(item => {
    selectedItems[item.id] = checked;
    if (!selectedOps[item.id]) selectedOps[item.id] = {};
    (cfg.operations || []).forEach(op => {
      selectedOps[item.id][op.id] = checked;
    });
  });
};

// 加载配置项（包含检查项与操作项）
const loadConfigs = async () => {
  const res = await queryTempCascaderApi({ keyword: "" });
  allConfigs.value = res.data || [];
  // 初始化勾选状态
  allConfigs.value.forEach(cfg => {
    (cfg.items || []).forEach(item => {
      if (selectedItems[item.id] === undefined) selectedItems[item.id] = false;
      if (!selectedOps[item.id]) selectedOps[item.id] = {};
      Array.isArray(item.operations) &&
        item.operations.forEach(op => {
          if (selectedOps[item.id][op.id] === undefined) selectedOps[item.id][op.id] = false;
        });
    });
  });
  // 根据当前选择更新展示列表
  onConfigSelectionChange(selectedConfigIds.value);
};

const onConfigSelectionChange = (ids: number[]) => {
  const idSet = new Set(ids.map(n => Number(n)));
  configList.value = allConfigs.value.filter(cfg => idSet.has(Number(cfg.id)));
};

// 获取/设置操作项勾选状态
const isOperationChecked = (itemId: number, opId: number) => {
  return !!selectedOps[itemId]?.[opId];
};
const setOperationChecked = (itemId: number, opId: number, checked: boolean) => {
  if (!selectedOps[itemId]) selectedOps[itemId] = {};
  selectedOps[itemId][opId] = checked;
};

// 构建提交数据：按配置项分组，保存每个被选择的检查项及其操作项（items[]）
const buildPayload = (): Order.ReqTemplates => {
  const tempList: {
    id: string;
    name: string;
    items: {
      id: string;
      name: string;
      operationItems: Order.operationItems[];
    }[];
  }[] = [];

  configList.value.forEach(cfg => {
    const items: {
      id: string;
      name: string;
      operationItems: Order.operationItems[];
    }[] = [];

    cfg.items.forEach(item => {
      if (selectedItems[item.id]) {
        const opCheckedMap = selectedOps[item.id] || {};
        const ops: Order.operationItems[] = cfg.operations
          .filter(op => !!opCheckedMap[op.id])
          .map((op, idx) => ({
            id: String(op.id),
            name: op.name,
            sort: idx,
            type: op.type,
            options: op.options || [],
            required: false,
            bindInspectionId: String(item.id)
          }));

        items.push({
          id: String(item.id),
          name: item.name,
          operationItems: ops
        });
      }
    });

    if (items.length) {
      tempList.push({
        id: String(cfg.id),
        name: cfg.name,
        items
      });
    }
  });

  return {
    templateName: form.templateName,
    templateData: { tempList }
  };
};

// 编辑回填
const loadEdit = async () => {
  if (!isEdit.value || !editId.value) return;
  const res = await queryTemplateDetailApi(editId.value);
  const data = res?.data;
  if (!data) return;

  form.templateName = data.templateName || "";

  const tempList = data.templateData?.tempList || [];
  if (Array.isArray(tempList) && tempList.length) {
    // 1) 回显配置项选择框（多选）
    selectedConfigIds.value = tempList.map((cfgEntry: any) => Number(cfgEntry.id));
    onConfigSelectionChange(selectedConfigIds.value);

    // 2) 回显检查项与操作项的勾选状态
    tempList.forEach((cfgEntry: any) => {
      (cfgEntry.items || []).forEach((item: any) => {
        const itemId = Number(item.id);
        selectedItems[itemId] = true;
        if (!selectedOps[itemId]) selectedOps[itemId] = {};
        (item.operationItems || []).forEach((op: any) => {
          selectedOps[itemId][Number(op.id)] = true;
        });
      });
    });
  } else {
    // 未选择任何配置项时，清空展示
    selectedConfigIds.value = [];
    onConfigSelectionChange([]);
  }
};

const editId = ref<number | null>(route.query.id ? Number(route.query.id) : null);
const isEdit = computed(() => !!editId.value);

// 提交：编辑模式走更新，否则走创建
const submit = async () => {
  try {
    await formRef.value?.validate();
    const payload = buildPayload();
    console.log("payload====>", payload);
    saving.value = true;

    const currentTabPath = route.fullPath;
    if (isEdit.value && editId.value) {
      await updateTemplateApi(editId.value, payload);
      ElMessage.success("模板更新成功");
    } else {
      await createTemplateApi(payload);
      ElMessage.success("模板创建成功");
    }
    // router.push("/order/templateManage?refresh=" + Date.now());
    router.back();
    tabStore.removeTabs(currentTabPath, false);
  } catch (e) {
    // ignore
  } finally {
    saving.value = false;
  }
};

// 组件挂载：先加载配置项，再根据 ?id 预填
onMounted(async () => {
  await loadConfigs();
  await loadEdit();
});

// 重置
const reset = () => {
  form.templateName = "";
  selectedConfigIds.value = [];
  onConfigSelectionChange([]);
  Object.keys(selectedItems).forEach(k => (selectedItems[Number(k)] = false));
  Object.keys(selectedOps).forEach(k => {
    const map = selectedOps[Number(k)];
    Object.keys(map).forEach(opId => (map[Number(opId)] = false));
  });
};
</script>

<style lang="scss" scoped>
.top-mask {
  position: absolute;
  top: -31px;
  left: 0;
  z-index: 100;
  width: 100%;
  height: 30px;
  background-color: var(--el-bg-color-page);
}
.template-form-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.basic-card {
  position: sticky;
  top: 0;
  z-index: 1000;
  margin-bottom: 8px;
  overflow: inherit;
}
.config-card {
  margin-bottom: 16px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
</style>
<style>
.submit-buttons {
  .el-form-item__content {
    justify-content: flex-end;
  }
}
</style>
