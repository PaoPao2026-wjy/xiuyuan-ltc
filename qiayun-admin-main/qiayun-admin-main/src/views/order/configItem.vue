<template>
  <div class="template-container">
    <!-- 搜索筛选栏 -->
    <div class="search-filter-bar">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item>
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索配置项名称、描述..."
            clearable
            style="width: 300px"
            @keyup.enter="handleQuery"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
          <el-button class="btn btn-primary" @click="createTemplate">
            <span class="icon">➕</span>
            新增配置项
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 模板列表 -->
    <div class="templates-table">
      <div class="table-header">
        <div class="table-title">配置项列表</div>
        <div>
          <el-button @click="refreshTemplates">
            <el-icon><Refresh /></el-icon>刷新
          </el-button>
        </div>
      </div>

      <el-table
        ref="templateTableRef"
        :data="templateList"
        style="width: 100%"
        v-loading="loading"
        @expand-change="handleExpandChange"
      >
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="check-items-container">
              <div class="check-items-header">
                <div class="check-items-title">{{ row.name }} - 操作项列表</div>
              </div>
              <el-table :data="operationList" v-loading="operationLoading" style="width: 100%" max-height="420">
                <el-table-column prop="name" label="操作项名称" />
                <el-table-column prop="type" label="类型">
                  <template #default="{ row }">
                    {{ row.type === "SELECT" ? "选择类型" : row.type === "BOOLEAN" ? "开关类型" : "文本类型" }}
                  </template>
                </el-table-column>
                <el-table-column prop="createdAt" label="创建时间">
                  <template #default="{ row }">
                    {{ formatDateTime(row.createdAt) }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template #default="{ row }">
                    <el-button type="success" size="small" @click.stop="editOperationItem(row)">编辑</el-button>
                    <el-button type="danger" size="small" @click.stop="deleteOperationItem(row.id)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="check-items-header" style="margin-top: 20px">
                <div class="check-items-title">{{ row.name }} - 检查项列表</div>
              </div>
              <el-table :data="checkItemsList" style="width: 100%" v-loading="checkItemsLoading">
                <el-table-column prop="name" label="检查项名称" />
                <el-table-column prop="createdAt" label="创建时间">
                  <template #default="{ row }">
                    {{ formatDateTime(row.createdAt) }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template #default="{ row }">
                    <el-button type="success" size="small" @click.stop="editCheckItem(row)"> 编辑 </el-button>
                    <el-button type="danger" size="small" @click.stop="deleteCheckItem(row.id)"> 删除 </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="配置项名称">
          <template #default="{ row }">
            <div class="template-name">{{ row.name }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="配置项描述" />
        <el-table-column prop="createdAt" label="创建时间">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="creator.realName" label="创建人" />
        <el-table-column label="操作" width="360">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click.stop="addCheckItem(row.id)"> 新增检查项 </el-button>
            <el-button type="warning" size="small" @click.stop="createOperationItem(row.id)"> 新增操作项 </el-button>
            <el-button type="success" size="small" @click.stop="editTemplate(row)"> 编辑 </el-button>
            <el-button type="danger" size="small" @click.stop="deleteTemplate(row.id)"> 删除 </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 新增模板弹窗 -->
    <el-dialog
      :title="templateDialogTitle"
      v-model="templateDialogVisible"
      width="500px"
      :close-on-click-modal="false"
      :before-close="closeTemplateDialog"
    >
      <el-form :model="templateForm" :rules="templateRules" ref="templateFormRef" label-width="100px" label-position="right">
        <el-form-item label="配置项名称" prop="name">
          <el-input v-model="templateForm.name" placeholder="请输入配置项名称" />
        </el-form-item>
        <el-form-item label="配置项描述" prop="description">
          <el-input v-model="templateForm.description" type="textarea" :rows="3" placeholder="请输入配置项描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeTemplateDialog">取消</el-button>
          <el-button type="primary" @click="submitTemplateForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新增检查项弹窗 -->
    <el-dialog
      :title="checkItemDialogTitle"
      v-model="checkItemDialogVisible"
      width="500px"
      :close-on-click-modal="false"
      :before-close="closeCheckItemDialog"
    >
      <el-form :model="checkItemForm" :rules="checkItemRules" ref="checkItemFormRef" label-width="100px" label-position="right">
        <el-form-item label="检查项名称" prop="name">
          <el-input v-model="checkItemForm.name" placeholder="请输入检查项名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeCheckItemDialog">取消</el-button>
          <el-button type="primary" @click="submitCheckItemForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      title="操作项详情"
      v-model="operationDialogVisible"
      width="720px"
      :close-on-click-modal="false"
      :before-close="closeOperationDialog"
    >
      <el-table :data="operationList" v-loading="operationLoading" style="width: 100%" max-height="420">
        <el-table-column prop="name" label="操作项名称" />
        <el-table-column prop="type" label="类型">
          <template #default="{ row }">
            {{ row.type === "SELECT" ? "选择类型" : row.type === "BOOLEAN" ? "开关类型" : "文本类型" }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="success" size="small" @click.stop="editOperationItem(row)">编辑</el-button>
            <el-button type="danger" size="small" @click.stop="deleteOperationItem(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeOperationDialog">关闭</el-button>
          <!-- <el-button type="primary" @click="createOperationItem">新增操作项</el-button> -->
        </span>
      </template>
    </el-dialog>

    <el-dialog
      :title="operationItemDialogTitle"
      v-model="operationItemDialogVisible"
      width="560px"
      :close-on-click-modal="false"
      :before-close="closeOperationItemDialog"
    >
      <el-form
        :model="operationItemForm"
        :rules="operationItemRules"
        ref="operationItemFormRef"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="操作项名称" prop="name">
          <el-input v-model="operationItemForm.name" placeholder="请输入操作项名称" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="operationItemForm.type" placeholder="请选择类型">
            <el-option label="文本" value="TEXT" />
            <el-option label="选择" value="SELECT" />
            <el-option label="布尔" value="BOOLEAN" />
          </el-select>
        </el-form-item>
        <el-form-item label="选项" v-if="operationItemForm.type === 'SELECT'" prop="optionsList">
          <div class="options-list">
            <div
              class="option-row"
              v-for="(opt, idx) in operationItemForm.optionsList"
              :key="idx"
              style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px"
            >
              <el-input v-model="operationItemForm.optionsList[idx]" placeholder="请输入选项" style="flex: 1" />
              <el-button v-if="idx === operationItemForm.optionsList.length - 1" type="primary" @click="addSelectOption">
                <el-icon><Plus /></el-icon>新增选项
              </el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeOperationItemDialog">取消</el-button>
          <el-button type="primary" @click="submitOperationItemForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="configItem">
import { ref, reactive, onMounted, computed, nextTick } from "vue";
import { Search, Refresh } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, FormInstance, FormRules } from "element-plus";
import {
  queryTempListApi,
  queryTempDetailApi,
  createTempApi,
  updateTempApi,
  deleteTempApi,
  createTempItemApi,
  updateTempItemApi,
  deleteTempItemApi,
  queryItemOperationsApi,
  createOperationItemApi,
  updateOperationItemApi,
  deleteOperationItemApi
} from "@/api/modules/order";

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  keyword: ""
});
const templateTableRef = ref();

// 模板列表数据
const templateList = ref<any[]>([]);
// 检查项列表数据
const checkItemsList = ref<any[]>([]);
// 总数据条数
const total = ref(0);
const loading = ref(false);
const checkItemsLoading = ref(false);

// 当前展开的行ID
const expandedRowId = ref<string | null>(null);

const operationDialogVisible = ref(false);
const operationLoading = ref(false);
const operationList = ref<any[]>([]);
const currentInspectionItemId = ref<number | null>(null);

const operationItemDialogVisible = ref(false);
const operationItemFormRef = ref<FormInstance>();
const operationItemIsEdit = ref(false);
const editingOperationItemId = ref<number | null>(null);
const operationItemDialogTitle = computed(() => (operationItemIsEdit.value ? "编辑操作项" : "新增操作项"));

const operationItemForm = reactive({
  inspectionItemId: 0,
  name: "",
  type: "", // "SELECT" | "TEXT" | "BOOLEAN"
  optionsList: [""] // 逗号分隔的字符串，提交时转换为数组
});

const operationItemRules = reactive<FormRules>({
  name: [{ required: true, message: "请输入操作项名称", trigger: "blur" }],
  type: [{ required: true, message: "请选择类型", trigger: "change" }],
  optionsList: [
    {
      validator: (_rule, _value, callback) => {
        if (operationItemForm.type === "SELECT") {
          const hasOption = operationItemForm.optionsList.some(opt => opt && opt.trim().length > 0);
          if (!hasOption) {
            callback(new Error("请选择类型为选择时需至少填写一个选项"));
            return;
          }
        }
        callback();
      },
      trigger: "change"
    }
  ]
});

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return "";
  return dateTime.replace(/[TZ]/g, " ").replace(/\.\d+/, "");
};

// 查询列表
const handleQuery = () => {
  loading.value = true;
  // 这里应该是调用API获取模板列表
  queryTempListApi(queryParams).then(res => {
    if (res.code === 200) {
      templateList.value = res.data.list || [];
      total.value = res.data.pagination.total || 0;
      loading.value = false;
    } else {
      ElMessage.error(res.msg || "查询模板列表失败");
      loading.value = false;
    }
  });
};

// 获取检查项列表
const fetchCheckItems = (templateId: string) => {
  checkItemsLoading.value = true;
  // 这里应该是调用API获取检查项列表
  console.log("templateId===>", templateId);
  queryTempDetailApi(templateId).then(res => {
    if (res.code === 200) {
      checkItemsList.value = res.data.items || [];
      checkItemsLoading.value = false;
    } else {
      ElMessage.error(res.msg || "查询检查项列表失败");
      checkItemsLoading.value = false;
    }
  });
};

// 处理展开行变化
const handleExpandChange = (row: any, expandedRows: any[]) => {
  // 获取当前点击行的ID
  const currentExpandedId = row.id;

  // 如果当前行被收起（不在expandedRows中）
  if (!expandedRows.some(expandedRow => expandedRow.id === currentExpandedId)) {
    // 当前行被收起，清空展开行ID
    expandedRowId.value = null;
    return;
  }

  // 当前行被展开，更新展开行ID并获取检查项列表
  expandedRowId.value = currentExpandedId;
  fetchCheckItems(currentExpandedId);
  openOperationDialog(currentExpandedId);

  // 收起其他所有展开的行
  templateList.value.forEach(item => {
    if (item.id !== currentExpandedId && templateTableRef.value) {
      templateTableRef.value.toggleRowExpansion(item, false);
    }
  });
};

// 重置查询
const resetQuery = () => {
  queryParams.keyword = "";
  queryParams.page = 1;
  handleQuery();
};

// 刷新列表
const refreshTemplates = () => {
  handleQuery();
  ElMessage.success("刷新成功");
};

// 处理每页条数变化
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val;
  handleQuery();
};

// 处理页码变化
const handleCurrentChange = (val: number) => {
  queryParams.page = val;
  handleQuery();
};

// 新增模板相关
const templateDialogVisible = ref(false);
const templateFormRef = ref<FormInstance>();
const templateForm = reactive({
  name: "",
  description: ""
});

const isEdit = ref(false);
const editingTemplateId = ref<string | null>(null);
const templateDialogTitle = computed(() => (isEdit.value ? "编辑配置项" : "新增配置项"));

const templateRules = reactive<FormRules>({
  name: [{ required: true, message: "请输入配置项名称", trigger: "blur" }],
  description: [{ required: true, message: "请输入配置项描述", trigger: "blur" }]
});

const createTemplate = () => {
  isEdit.value = false;
  editingTemplateId.value = null;
  templateForm.name = "";
  templateForm.description = "";
  templateDialogVisible.value = true;
  nextTick(() => {
    templateFormRef.value?.clearValidate();
  });
};

const editTemplate = (row: any) => {
  isEdit.value = true;
  editingTemplateId.value = row.id;
  templateForm.name = row.name || "";
  templateForm.description = row.description || "";
  templateDialogVisible.value = true;
  nextTick(() => {
    templateFormRef.value?.clearValidate();
  });
};

const closeTemplateDialog = () => {
  templateDialogVisible.value = false;
  if (templateFormRef.value) {
    templateFormRef.value.resetFields();
  }
  isEdit.value = false;
  editingTemplateId.value = null;
};

const submitTemplateForm = () => {
  if (!templateFormRef.value) return;

  templateFormRef.value.validate(valid => {
    if (valid) {
      if (isEdit.value && editingTemplateId.value) {
        updateTempApi(editingTemplateId.value, {
          name: templateForm.name,
          description: templateForm.description
        }).then(() => {
          const idx = templateList.value.findIndex(t => t.id === editingTemplateId.value);
          if (idx !== -1) {
            templateList.value[idx] = {
              ...templateList.value[idx],
              name: templateForm.name,
              description: templateForm.description
            };
          }
          ElMessage.success("编辑配置项成功");
          handleQuery(); // 刷新列表
        });
      } else {
        createTempApi(templateForm).then(() => {
          ElMessage.success("新增配置项成功");
          handleQuery(); // 刷新列表
        });
      }
      closeTemplateDialog();
    }
  });
};

// 新增检查项相关
const checkItemDialogVisible = ref(false);
const checkItemFormRef = ref<FormInstance>();
const checkItemForm = reactive({
  templateId: "",
  name: ""
});

const checkItemIsEdit = ref(false);
const editingCheckItemId = ref<string | null>(null);
const checkItemDialogTitle = computed(() => (checkItemIsEdit.value ? "编辑检查项" : "新增检查项"));

const checkItemRules = reactive<FormRules>({
  name: [{ required: true, message: "请输入检查项名称", trigger: "blur" }]
});

const addCheckItem = (templateId: string) => {
  checkItemIsEdit.value = false;
  editingCheckItemId.value = null;
  checkItemForm.templateId = templateId;
  checkItemForm.name = "";
  checkItemDialogVisible.value = true;
  nextTick(() => {
    checkItemFormRef.value?.clearValidate();
  });
};

const editCheckItem = (row: any) => {
  checkItemIsEdit.value = true;
  editingCheckItemId.value = row.id;
  // 优先使用行内的 templateId，其次回退到当前展开的模板ID
  checkItemForm.templateId = row.templateId || expandedRowId.value || "";
  checkItemForm.name = row.name || "";
  checkItemDialogVisible.value = true;
  nextTick(() => {
    checkItemFormRef.value?.clearValidate();
  });
};

const openOperationDialog = (inspectionItemId: string) => {
  currentInspectionItemId.value = Number(inspectionItemId);
  // operationDialogVisible.value = true;
  fetchOperationItems(Number(inspectionItemId));
};

const fetchOperationItems = (inspectionItemId: number) => {
  operationLoading.value = true;
  queryItemOperationsApi(inspectionItemId).then(res => {
    if (res.code === 200) {
      operationList.value = res.data || [];
      operationLoading.value = false;
    } else {
      ElMessage.error(res.msg || "查询操作项列表失败");
      operationLoading.value = false;
    }
  });
};

const closeOperationDialog = () => {
  operationDialogVisible.value = false;
  operationLoading.value = false;
};

const createOperationItem = (inspectionItemId?: number) => {
  if (inspectionItemId) {
    currentInspectionItemId.value = Number(inspectionItemId);
  }
  operationItemIsEdit.value = false;
  editingOperationItemId.value = null;
  operationItemForm.inspectionItemId = Number(currentInspectionItemId.value || 0);
  operationItemForm.name = "";
  operationItemForm.type = "";
  operationItemForm.optionsList = [""];
  operationItemDialogVisible.value = true;
  nextTick(() => operationItemFormRef.value?.clearValidate());
};

const editOperationItem = (row: any) => {
  operationItemIsEdit.value = true;
  editingOperationItemId.value = row.id;
  operationItemForm.inspectionItemId = row.inspectionItemId || Number(currentInspectionItemId.value || 0);
  operationItemForm.name = row.name || "";
  operationItemForm.type = row.type || "";
  operationItemForm.optionsList = Array.isArray(row.options) && row.options.length ? [...row.options] : [""];
  operationItemDialogVisible.value = true;
  nextTick(() => operationItemFormRef.value?.clearValidate());
};

const addSelectOption = () => {
  operationItemForm.optionsList.push("");
};

const closeOperationItemDialog = () => {
  operationItemDialogVisible.value = false;
  if (operationItemFormRef.value) {
    operationItemFormRef.value.resetFields();
  }
  operationItemIsEdit.value = false;
  editingOperationItemId.value = null;
};

const submitOperationItemForm = () => {
  if (!operationItemFormRef.value) return;
  operationItemFormRef.value.validate(valid => {
    if (!valid) return;

    const options = operationItemForm.type === "SELECT" ? operationItemForm.optionsList.map(s => s.trim()).filter(Boolean) : [];

    const params = {
      name: operationItemForm.name,
      type: operationItemForm.type,
      options
    };

    if (operationItemIsEdit.value && editingOperationItemId.value) {
      updateOperationItemApi(editingOperationItemId.value, params).then(() => {
        ElMessage.success("编辑操作项成功");
        closeOperationItemDialog();
        if (currentInspectionItemId.value) {
          fetchOperationItems(currentInspectionItemId.value);
        }
      });
    } else {
      createOperationItemApi(operationItemForm.inspectionItemId, params).then(() => {
        ElMessage.success("新增操作项成功");
        closeOperationItemDialog();
        if (currentInspectionItemId.value) {
          fetchOperationItems(currentInspectionItemId.value);
        }
      });
    }
  });
};

const deleteOperationItem = (id: number) => {
  ElMessageBox.confirm("确定要删除该操作项吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteOperationItemApi(id).then(() => {
      ElMessage.success("删除操作项成功");
      if (currentInspectionItemId.value) {
        fetchOperationItems(currentInspectionItemId.value);
      }
    });
  });
};

const closeCheckItemDialog = () => {
  checkItemDialogVisible.value = false;
  if (checkItemFormRef.value) {
    checkItemFormRef.value.resetFields();
  }
  checkItemIsEdit.value = false;
  editingCheckItemId.value = null;
};

const submitCheckItemForm = () => {
  if (!checkItemFormRef.value) return;

  checkItemFormRef.value.validate(valid => {
    if (valid) {
      if (checkItemIsEdit.value && editingCheckItemId.value) {
        updateTempItemApi(editingCheckItemId.value, checkItemForm.name).then(() => {
          const idx = checkItemsList.value.findIndex(ci => ci.id === editingCheckItemId.value);
          if (idx !== -1) {
            checkItemsList.value[idx] = {
              ...checkItemsList.value[idx],
              name: checkItemForm.name
            };
          }
          ElMessage.success("编辑检查项成功");
          if (expandedRowId.value === checkItemForm.templateId) {
            fetchCheckItems(checkItemForm.templateId);
          }
        });
      } else {
        createTempItemApi(checkItemForm.templateId, checkItemForm.name).then(() => {
          ElMessage.success("新增检查项成功");
          if (expandedRowId.value === checkItemForm.templateId) {
            fetchCheckItems(checkItemForm.templateId);
          }
        });
      }
      closeCheckItemDialog();
    }
  });
};

// 删除模板
const deleteTemplate = (id: string) => {
  console.log("deleteTemplate id===>", id);
  ElMessageBox.confirm("确定要删除该配置项吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      deleteTempApi(id).then(() => {
        ElMessage.success("删除配置项成功");
        handleQuery(); // 刷新列表
      });
    })
    .catch(() => {
      // 取消删除
    });
};

// 删除检查项
const deleteCheckItem = (id: string) => {
  console.log("deleteCheckItem id===>", id);

  ElMessageBox.confirm("确定要删除该检查项吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      deleteTempItemApi(id).then(() => {
        ElMessage.success("删除检查项成功");
        // 刷新检查项列表
        if (expandedRowId.value) {
          fetchCheckItems(expandedRowId.value);
        }
      });
    })
    .catch(() => {
      // 取消删除
    });
};

onMounted(() => {
  handleQuery();
});
</script>

<style scoped lang="scss">
.template-container {
  padding: 20px;
  .search-filter-bar {
    padding: 16px;
    margin-bottom: 20px;
    background-color: #ffffff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
  }
  .templates-table {
    padding: 16px;
    background-color: #ffffff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
    .table-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      .table-title {
        font-size: 18px;
        font-weight: 600;
        color: #333333;
      }
    }
    .template-name {
      font-weight: 500;
      color: #409eff;
    }
    .pagination-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
  }
  .check-items-container {
    padding: 20px;
    background-color: #f5f7fa;
    border-radius: 4px;
    .check-items-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      .check-items-title {
        font-size: 16px;
        font-weight: 600;
        color: #333333;
      }
    }
  }
}
.btn-primary {
  color: white;
  background: var(--primary-color);
}
</style>
