<template>
  <div class="template-container">
    <!-- 搜索筛选栏 -->
    <div class="search-filter-bar">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item>
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索模板名称、描述..."
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
            新增模板
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 模板列表 -->
    <div class="templates-table">
      <div class="table-header">
        <div class="table-title">模板列表</div>
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
        <el-table-column prop="name" label="模板名称">
          <template #default="{ row }">
            <div class="template-name">{{ row.templateName }}</div>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ENABLE' ? 'success' : 'danger'"> {{ getStatusLabel(row.status) }} </el-tag>
          </template>
        </el-table-column> -->
        <el-table-column prop="createdAt" label="创建时间">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="creator.realName" label="创建人" />
        <el-table-column label="操作" width="280">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="goEditTemplate(row.id)">编辑</el-button>
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
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="templateForm.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="模板描述" prop="description">
          <el-input v-model="templateForm.description" type="textarea" :rows="3" placeholder="请输入模板描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeTemplateDialog">取消</el-button>
          <el-button type="primary" @click="submitTemplateForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="template">
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { Search, Refresh } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, FormInstance, FormRules } from "element-plus";
import { queryTemplatesListApi, queryTempDetailApi, createTempApi, updateTempApi, deleteTemplateApi } from "@/api/modules/order";

const router = useRouter();

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  keyword: ""
});
const templateTableRef = ref();

// 获取状态标签
// const getStatusLabel = (status: string) => {
//   const labelMap: Record<string, string> = {
//     ENABLE: "已启用",
//     DISABLED: "已禁用"
//   };
//   return labelMap[status] || status;
// };

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

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return "";
  return dateTime.replace(/[TZ]/g, " ").replace(/\.\d+/, "");
};

// 查询列表
const handleQuery = () => {
  loading.value = true;
  queryTemplatesListApi(queryParams)
    .then(res => {
      templateList.value = res.data.list || [];
      total.value = res.data.pagination.total || 0;
      loading.value = false;
    })
    .catch(err => {
      ElMessage.error(err.message || "查询模板列表失败");
      loading.value = false;
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
const templateDialogTitle = computed(() => (isEdit.value ? "编辑模板" : "新增模板"));

const templateRules = reactive<FormRules>({
  name: [{ required: true, message: "请输入模板名称", trigger: "blur" }],
  description: [{ required: true, message: "请输入模板描述", trigger: "blur" }]
});

const createTemplate = () => {
  router.push({ path: "/order/templateForm" });
};

const goEditTemplate = (id: number | string) => {
  router.push({ path: "/order/templateForm", query: { id: String(id) } });
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
          ElMessage.success("编辑模板成功");
          handleQuery(); // 刷新列表
        });
      } else {
        createTempApi(templateForm).then(() => {
          ElMessage.success("新增模板成功");
          handleQuery(); // 刷新列表
        });
      }
      closeTemplateDialog();
    }
  });
};

// 删除模板
const deleteTemplate = (id: string) => {
  console.log("deleteTemplate id===>", id);
  ElMessageBox.confirm("确定要删除该模板吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      deleteTemplateApi(id).then(() => {
        ElMessage.success("删除模板成功");
        handleQuery(); // 刷新列表
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
