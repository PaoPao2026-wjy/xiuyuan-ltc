<template>
  <div class="order-container">
    <!-- 顶部统计卡片 -->
    <div class="stats-container">
      <div class="stat-card total">
        <div class="stat-label">总工单数</div>
        <div class="stat-value">{{ orderStats.total }}</div>
      </div>
      <div class="stat-card pending-review">
        <div class="stat-label">待审核</div>
        <div class="stat-value">{{ orderStats.pendingReview }}</div>
      </div>
      <div class="stat-card review-rejected">
        <div class="stat-label">审核拒绝</div>
        <div class="stat-value">{{ orderStats.reviewRejected }}</div>
      </div>
      <div class="stat-card pending-acceptance">
        <div class="stat-label">待接单</div>
        <div class="stat-value">{{ orderStats.pendingAcceptance }}</div>
      </div>
      <div class="stat-card processing">
        <div class="stat-label">处理中</div>
        <div class="stat-value">{{ orderStats.inProgress }}</div>
      </div>
      <div class="stat-card completed">
        <div class="stat-label">已完成</div>
        <div class="stat-value">{{ orderStats.completed }}</div>
      </div>
      <div class="stat-card rejected">
        <div class="stat-label">已拒绝</div>
        <div class="stat-value">{{ orderStats.rejected }}</div>
      </div>
      <div class="stat-card cancelled">
        <div class="stat-label">已取消</div>
        <div class="stat-value">{{ orderStats.cancelled }}</div>
      </div>
    </div>

    <!-- 搜索筛选栏 -->
    <div class="search-filter-bar">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item>
          <el-input
            v-model="queryParams.keyword"
            placeholder="关键字搜索工单名、地址等..."
            clearable
            style="width: 300px"
            @keyup.enter="handleQuery"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="工单号:">
          <el-input v-model="queryParams.orderNo" clearable style="width: 200px" @keyup.enter="handleQuery" />
        </el-form-item>

        <el-form-item label="工单状态:">
          <el-select v-model="queryParams.status" clearable style="width: 200px" @change="handleQuery">
            <el-option
              v-for="item in statusMap"
              :key="item.key"
              :label="item.label"
              :value="item.key === 'ALL' ? '' : item.key"
            />
          </el-select>
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
          <el-button @click="resetQuery">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
          <el-button @click="refreshOrders">
            <el-icon><Refresh /></el-icon>刷新
          </el-button>

          <el-button class="btn btn-primary" @click="createOrder">
            <span class="icon">➕</span>
            创建工单
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 工单列表 -->
    <div class="orders-table">
      <div class="table-header">
        <div class="table-title">工单列表</div>
        <div>
          <el-button @click="refreshOrders">
            <el-icon><Refresh /></el-icon>刷新
          </el-button>
        </div>
      </div>

      <el-table :data="orderList" style="width: 100%" v-loading="loading">
        <el-table-column fixed="left" prop="orderNo" label="工单号" width="220" />
        <el-table-column prop="title" label="工单名" min-width="240" />
        <el-table-column prop="status" label="工单状态" min-width="140">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" min-width="120">
          <template #default="{ row }">
            <el-tag :type="priorityTagType(row.priority)">{{ getPriorityLabel(row.priority) }}</el-tag>
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
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'DRAFT'" type="warning" size="small" @click.stop="assignEngineer(row.id)">
              指派工程师
            </el-button>
            <el-button type="success" size="small" @click.stop="orderDetail(row.id)">详情</el-button>
            <el-button type="primary" size="small" @click.stop="editOrder(row.id)">编辑</el-button>
            <el-button type="danger" size="small" @click.stop="deleteOrder(row.id)">删除</el-button>
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

    <!-- 移除创建工单弹框，现在使用独立页面 -->

    <el-dialog v-model="assignDialogVisible" title="指派工程师" width="500px" :close-on-click-modal="false">
      <el-form :model="assignForm" label-width="100px">
        <el-form-item label="工程师">
          <el-select
            v-model="assignForm.technicianId"
            placeholder="搜索选择工程师"
            filterable
            remote
            :remote-method="searchTechnicians"
            :loading="technicianLoading"
            style="width: 100%"
          >
            <el-option
              v-for="t in technicianOptions"
              :key="t.technicianId"
              :label="`${t.realName}（${t.phone}）`"
              :value="t.technicianId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="assignForm.remark" type="textarea" placeholder="可选，填写指派说明" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="assignSubmitting" @click="submitAssign">确定指派</el-button>
      </template>
    </el-dialog>

    <!-- 移除工单详情弹框，现在使用独立页面 -->
  </div>
</template>

<script setup lang="ts" name="order">
import { ref, reactive, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Search, Refresh } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  queryOrderStatsApi,
  queryOrderListApi,
  deleteOrderApi,
  //queryOrderDetailApi,
  assignEngineerApi,
  queryTechnicianListApi
} from "@/api/modules/order";
import { Order } from "@/api/interface";

const router = useRouter();
const route = useRoute();

const statusMap = [
  { key: "ALL", label: "全部" },
  { key: "PENDING_REVIEW", label: "待审核" },
  {
    key: "REVIEW_REJECTED",
    label: "审核驳回"
  },
  {
    key: "PENDING_ACCEPTANCE",
    label: "待接单"
  },
  { key: "ACCEPTED", label: "已接单" },
  { key: "IN_PROGRESS", label: "进行中" },
  { key: "COMPLETED", label: "已完成" },
  { key: "REJECTED", label: "已拒绝" },
  { key: "CANCELLED", label: "已取消" }
];

// 统计
const orderStats = reactive<Order.ResOrderStats>({
  total: 0,
  pendingReview: 0,
  reviewRejected: 0,
  pendingAcceptance: 0,
  inProgress: 0,
  completed: 0,
  rejected: 0,
  cancelled: 0
});

// 查询参数
const queryParams = reactive<Order.ReqOrderParams>({
  page: 1,
  pageSize: 10,
  keyword: "",
  orderNo: "",
  status: "",
  priority: "",
  startDate: "",
  endDate: ""
});
const dateRange = ref<string[]>([]);

// 列表数据
const orderList = ref<Order.ResOrderList[]>([]);
const total = ref(0);
const loading = ref(false);

// 移除弹框相关变量，现在使用页面跳转

// 移除表单相关代码，现在在独立页面中处理

// 移除不再需要的函数和变量

const formatDateTime = (dateString: string) => {
  if (!dateString) return "";
  return dateString.replace(/[TZ]/g, " ").replace(/\.\d+/, "");
};

const formatPlannedDuration = (start: string, end: string) => {
  if (!start || !end) return "-";
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  if (diffMs <= 0) return "-";
  const totalMinutes = Math.round(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}小时${minutes}分钟`;
};

// 指派工程师
const assignDialogVisible = ref(false);
const assignOrderId = ref<number | null>(null);
const assignForm = reactive<Order.ReqAssignEngineer>({
  technicianId: "",
  remark: ""
});
const assignSubmitting = ref(false);

const technicianOptions = ref<Order.ResTechnicianItem[]>([]);
const technicianLoading = ref(false);
const searchTechnicians = async (keyword: string) => {
  technicianLoading.value = true;
  try {
    const res = await queryTechnicianListApi({ page: 1, pageSize: 20, keyword, workStatus: "AVAILABLE", status: "ACTIVE" });
    if (res.code === 200) {
      technicianOptions.value = res.data.list || [];
    }
  } catch (error) {
    console.error("搜索工程师失败:", error);
  } finally {
    technicianLoading.value = false;
  }
};

// 移除 getAssignments 函数，现在在详情页面中处理

const assignEngineer = (orderId: number) => {
  assignOrderId.value = orderId;
  assignDialogVisible.value = true;
  assignForm.technicianId = "";
  assignForm.remark = "";
  searchTechnicians("");
};

// 移除详情弹框相关变量，现在使用独立页面

// 移除类型映射函数，现在在详情页面中处理

const submitAssign = async () => {
  if (!assignOrderId.value) return ElMessage.error("工单ID缺失");
  if (!assignForm.technicianId) return ElMessage.error("请选择工程师");

  assignSubmitting.value = true;
  try {
    const res = await assignEngineerApi(assignOrderId.value, assignForm);
    if (res.code === 200) {
      ElMessage.success("指派成功");
      assignDialogVisible.value = false;
      refreshOrders();
    } else {
      ElMessage.error(res.msg || "指派失败");
    }
  } catch (error) {
    ElMessage.error("指派失败");
  } finally {
    assignSubmitting.value = false;
  }
};

// 标签类型映射  "warning" | "danger" | "primary" | "success" | "info"
const statusTagType = (status?: string): "primary" | "success" | "warning" | "danger" | "info" => {
  if (!status) return "info";
  const map: Record<string, "primary" | "success" | "warning" | "danger" | "info"> = {
    PENDING_REVIEW: "warning",
    REVIEW_REJECTED: "danger",
    PENDING_ACCEPTANCE: "warning",
    ACCEPTED: "primary",
    IN_PROGRESS: "primary",
    COMPLETED: "success",
    REJECTED: "danger",
    CANCELLED: "info"
  };
  return map[status] || "info";
};

const getStatusLabel = (status?: string) => {
  const item = statusMap.find(item => item.key === status);
  return item ? item.label : status || "-";
};

const priorityTagType = (priority?: string) => {
  switch (priority) {
    case "URGENT":
      return "danger";
    case "NORMAL":
      return "warning";
    case "LOW":
      return "primary";
    default:
      return "info";
  }
};

const getPriorityLabel = (priority?: string) => {
  switch (priority) {
    case "URGENT":
      return "紧急";
    case "NORMAL":
      return "普通";
    case "LOW":
      return "较低";
    default:
      return priority || "-";
  }
};

// 查询统计
const fetchStats = () => {
  queryOrderStatsApi()
    .then(res => {
      if (res.code === 200) {
        Object.assign(
          orderStats,
          res.data || {
            total: 0,
            pendingReview: 0,
            reviewRejected: 0,
            pendingAcceptance: 0,
            inProgress: 0,
            completed: 0,
            rejected: 0,
            cancelled: 0
          }
        );
      }
    })
    .catch(error => {
      // 忽略请求取消错误
      if (error.name !== "CanceledError") {
        console.error("获取统计数据失败:", error);
      }
    });
};

// 查询列表
const handleQuery = () => {
  loading.value = true;
  if (dateRange.value?.length === 2) {
    queryParams.startDate = dateRange.value[0];
    queryParams.endDate = dateRange.value[1];
  } else {
    queryParams.startDate = "";
    queryParams.endDate = "";
  }
  queryOrderListApi(queryParams)
    .then(res => {
      if (res.code === 200) {
        orderList.value = res.data.list || [];
        total.value = res.data.pagination?.total || 0;
      } else {
        ElMessage.error(res.msg || "查询工单列表失败");
      }
      loading.value = false;
    })
    .catch(error => {
      // 忽略请求取消错误
      if (error.name !== "CanceledError") {
        ElMessage.error("查询工单列表失败");
        console.error("查询工单列表失败:", error);
      }
      loading.value = false;
    });
};

// 重置查询
const resetQuery = () => {
  queryParams.keyword = "";
  queryParams.orderNo = "";
  queryParams.status = "";
  queryParams.priority = "";
  dateRange.value = [];
  queryParams.page = 1;
  handleQuery();
};

const createOrder = () => {
  // 跳转到创建工单页面
  router.push("/order/create");
};

const orderDetail = (id: number) => {
  // 跳转到工单详情页面
  router.push(`/order/detail/${id}`);
};

// 编辑工单
const editOrder = (id: number) => {
  // 跳转到编辑工单页面
  router.push(`/order/edit/${id}`);
};

// 移除搜索企业函数，现在在独立页面中处理

// 移除模板和表单相关代码，现在在独立页面中处理

// 刷新列表与统计
const refreshOrders = () => {
  fetchStats();
  handleQuery();
  // ElMessage.success("刷新成功");
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

// 删除工单
const deleteOrder = (id: number) => {
  ElMessageBox.confirm("确定要删除该工单吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteOrderApi(id).then(() => {
      ElMessage.success("删除工单成功");
      handleQuery();
      fetchStats();
    });
  });
};

// 监听路由参数变化，自动刷新数据
watch(
  () => route.query.refresh,
  (newVal, oldVal) => {
    // 只有当refresh参数发生变化且不为空时才刷新
    if (newVal && newVal !== oldVal) {
      fetchStats();
      handleQuery();
    }
  }
);

onMounted(() => {
  fetchStats();
  handleQuery();
});
</script>

<style lang="scss" scoped>
.order-container {
  padding: 20px;
}

/* 顶部统计卡片 */
.stats-container {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
.stat-card {
  padding: 16px 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
}
.stat-card h3 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: normal;
  color: #666666;
}
.stat-card .number {
  font-size: 28px;
  font-weight: bold;
  color: #333333;
}

/* 搜索区域 */
.search-container {
  padding: 20px;
  margin-bottom: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
}

/* 表格区域 */
.orders-table {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
}
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 移除弹窗相关样式，现在使用独立页面 */
.stat-label {
  font-size: 14px;
  color: #666666;
}
.stat-value {
  margin-top: 8px;
  font-size: 24px;
  font-weight: 600;
  color: #333333;
}
.stat-card.total .stat-value {
  color: #333333;
}
.stat-card.pending-review .stat-value {
  color: #e6a23c; /* warning */
}
.stat-card.review-rejected .stat-value {
  color: #f56c6c; /* danger */
}
.stat-card.pending-acceptance .stat-value {
  color: #409eff; /* primary */
}
.stat-card.processing .stat-value {
  color: #409eff; /* primary */
}
.stat-card.completed .stat-value {
  color: #67c23a; /* success */
}
.stat-card.rejected .stat-value {
  color: #909399; /* info */
}
.stat-card.cancelled .stat-value {
  color: #909399; /* info */
}

/* 筛选栏 */
.search-filter-bar {
  padding: 16px;
  margin-bottom: 16px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
}
.btn-primary {
  color: white;
  background: var(--primary-color);
}
.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.detail-label {
  flex: 0 0 120px;
  color: #666666;
}
.detail-value {
  flex: 1;
  color: #333333;
  word-break: break-all;
}
.template-item {
  margin-bottom: 8px;
}
.inspection-name {
  margin-bottom: 4px;
  font-weight: 600;
}
.operation-items {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 0;
  align-items: center;
}
</style>
<style lang="scss">
.order-dialog.el-dialog {
  display: flex;
  flex-direction: column;
  height: 80vh;
  .el-dialog__header {
    flex-shrink: 0;
  }
  .el-dialog__body {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
  }
  .el-dialog__footer {
    flex-shrink: 0;
    padding: 15px 20px;
    border-top: 1px solid #ebeef5;
  }
}
</style>
