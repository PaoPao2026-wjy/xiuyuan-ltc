<template>
  <div class="draft-container">
    <!-- 顶部筛选栏，无统计卡片 -->
    <div class="search-filter-bar">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item>
          <el-input
            v-model="queryParams.keyword"
            placeholder="关键字搜索..."
            clearable
            style="width: 300px"
            @keyup.enter="handleQuery"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="优先级:">
          <el-select v-model="queryParams.priority" clearable style="width: 200px" @change="handleQuery">
            <el-option label="全部" value="" />
            <el-option label="紧急" value="URGENT" />
            <el-option label="普通" value="NORMAL" />
            <el-option label="较低" value="LOW" />
          </el-select>
        </el-form-item>

        <el-form-item label="日期范围:">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            start-placeholder="开始日期时间"
            end-placeholder="结束日期时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 380px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button @click="resetQuery"> 重置 </el-button>
          <el-button class="btn btn-primary" @click="createDraft">
            <span class="icon">➕</span>
            新增草稿
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 草稿列表表格（字段与工单列表一致） -->
    <div class="orders-table">
      <el-table :data="draftList" style="width: 100%" v-loading="loading">
        <el-table-column fixed="left" prop="title" label="工单名" min-width="240" />
        <el-table-column prop="priority" label="优先级" min-width="120">
          <template #default="{ row }">
            <el-tag :type="priorityTagType(row.priority) as any">{{ getPriorityLabel(row.priority) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="enterprise.enterpriseName" label="所属企业" min-width="180">
          <template #default="{ row }">
            {{ row.enterprise?.enterpriseName || "" }}
          </template>
        </el-table-column>
        <el-table-column prop="workAddress" label="地址" min-width="240" />
        <el-table-column label="预计处理时间" min-width="180">
          <template #default="{ row }">
            {{ formatPlannedDuration(row.plannedStartTime, row.plannedEndTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="remarks" label="备注" min-width="260" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" min-width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="360" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.draftStatus !== 'GENERATED'" type="success" size="small" @click.stop="generateOrder(row.id)">
              生成工单
            </el-button>
            <el-button type="primary" size="small" @click.stop="editDraft(row)">编辑</el-button>
            <el-button type="danger" size="small" @click.stop="deleteDraft(row.id)">删除</el-button>
            <el-button type="warning" size="small" @click.stop="voidDraft(row.id)">作废</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          small
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="order-draft">
import { ref, reactive, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Search } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { queryOrderDraftListApi, deleteOrderDraftApi, voidOrderDraftApi, generateOrderFromDraftApi } from "@/api/modules/order";
import { Order } from "@/api/interface";

const router = useRouter();
const route = useRoute();

// 响应式数据
const loading = ref(false);
const draftList = ref<Order.ResOrderList[]>([]);
const total = ref(0);
const dateRange = ref<[string, string] | null>(null);

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  keyword: "",
  priority: "",
  startTime: "",
  endTime: ""
});

// 新增草稿
const createDraft = () => {
  // 跳转到创建工单页面，通过查询参数标识为草稿模式
  router.push("/order/create?mode=draft");
};

// 编辑草稿（用行数据回填）
const editDraft = (row: Order.ResOrderList) => {
  // 跳转到编辑工单页面，通过路由参数传递草稿ID
  const draftId = row.draft?.id || row.draftId || row.id;
  router.push(`/order/edit/${draftId}?mode=draft`);
};

// 删除草稿
const deleteDraft = async (id: number) => {
  try {
    await ElMessageBox.confirm("确定要删除这个草稿吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });

    const res = await deleteOrderDraftApi(id);
    if (res.code === 200) {
      ElMessage.success("删除成功");
      await loadDraftList();
    } else {
      ElMessage.error(res.msg || "删除失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
};

// 作废草稿
const voidDraft = async (id: number) => {
  try {
    await ElMessageBox.confirm("确定要作废这个草稿吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });

    const res = await voidOrderDraftApi(id);
    if (res.code === 200) {
      ElMessage.success("作废成功");
      await loadDraftList();
    } else {
      ElMessage.error(res.msg || "作废失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("作废失败");
    }
  }
};

// 生成工单
const generateOrder = async (id: number) => {
  try {
    await ElMessageBox.confirm("确定要生成工单吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "info"
    });

    const res = await generateOrderFromDraftApi(id);
    if (res.code === 200) {
      ElMessage.success("工单生成成功");
      await loadDraftList();
    } else {
      ElMessage.error(res.msg || "生成工单失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("生成工单失败");
    }
  }
};

// 加载草稿列表
const loadDraftList = async () => {
  loading.value = true;
  try {
    const params = {
      ...queryParams,
      startTime: dateRange.value ? dateRange.value[0] : "",
      endTime: dateRange.value ? dateRange.value[1] : ""
    };

    const res = await queryOrderDraftListApi(params);
    if (res.code === 200) {
      draftList.value = (res.data as any)?.list || [];
      total.value = (res.data as any)?.total || 0;
    } else {
      ElMessage.error(res.msg || "获取草稿列表失败");
    }
  } catch (error: any) {
    // 忽略请求取消错误
    if (error.name !== "CanceledError") {
      ElMessage.error("获取草稿列表失败");
      console.error("获取草稿列表失败:", error);
    }
  } finally {
    loading.value = false;
  }
};

// 查询
const handleQuery = () => {
  queryParams.page = 1;
  loadDraftList();
};

// 重置查询
const resetQuery = () => {
  queryParams.keyword = "";
  queryParams.priority = "";
  dateRange.value = null;
  queryParams.startTime = "";
  queryParams.endTime = "";
  handleQuery();
};

// 分页大小改变
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val;
  queryParams.page = 1;
  loadDraftList();
};

// 当前页改变
const handleCurrentChange = (val: number) => {
  queryParams.page = val;
  loadDraftList();
};

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return "-";
  return dateTime.replace(/[TZ]/g, " ").replace(/\.\d+/, "");
};

// 格式化计划时间
const formatPlannedDuration = (startTime: string, endTime: string) => {
  if (!startTime || !endTime) return "-";
  const start = new Date(startTime);
  const end = new Date(endTime);
  const duration = end.getTime() - start.getTime();
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}小时${minutes}分钟`;
};

// 优先级标签类型
const priorityTagType = (priority: string) => {
  const typeMap: Record<string, string> = {
    URGENT: "danger",
    NORMAL: "warning",
    LOW: "info"
  };
  return typeMap[priority] || "info";
};

// 获取优先级标签
const getPriorityLabel = (priority: string) => {
  const labelMap: Record<string, string> = {
    URGENT: "紧急",
    NORMAL: "普通",
    LOW: "较低"
  };
  return labelMap[priority] || priority;
};

// 监听路由参数变化，自动刷新数据
watch(
  () => route.query.refresh,
  (newVal, oldVal) => {
    // 只有当refresh参数发生变化且不为空时才刷新
    if (newVal && newVal !== oldVal) {
      loadDraftList();
    }
  }
);

// 初始化
onMounted(() => {
  loadDraftList();
});
</script>

<style scoped>
.draft-container {
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
}
.search-filter-bar {
  padding: 20px;
  margin-bottom: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
}
.orders-table {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
}
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
.btn {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  transition: all 0.3s ease;
}
.btn-primary {
  color: white;
  background-color: #409eff;
}
.btn-primary:hover {
  background-color: #66b1ff;
}
.icon {
  font-size: 16px;
}
</style>
