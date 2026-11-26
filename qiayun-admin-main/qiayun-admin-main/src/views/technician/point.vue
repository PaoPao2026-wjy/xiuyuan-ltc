<template>
  <div class="table-box">
    <el-card>
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="变动类型">
          <el-select v-model="queryParams.type" placeholder="请选择积分类型" clearable style="width: 200px">
            <el-option label="完成工单" value="COMPLETE_ORDER" />
            <el-option label="积分扣减" value="DEDUCT" />
            <el-option label="积分过期" value="EXPIRE" />
            <el-option label="管理员手动调整" value="MANUAL_ADJUST" />
            <el-option label="额外奖励" value="REWARD" />
            <el-option label="积分兑换" value="EXCHANGE" />
            <el-option label="其他变动" value="OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item label="积分获取时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
          <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="tableData" style="width: 100%; margin-top: 20px">
        <el-table-column prop="pointsAfter" label="积分" align="center" />
        <el-table-column prop="pointsChange" label="积分变动" align="center">
          <template #default="{ row }">
            <span :style="{ color: row.pointsChange > 0 ? '#67C23A' : '#F56C6C' }">
              {{ row.pointsChange > 0 ? "+" + row.pointsChange : row.pointsChange }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="变动类型" align="center">
          <template #default="{ row }">
            <el-tag :type="getPointTypeTag(row.type)">
              {{ getPointTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="变动原因" align="center" />
        <el-table-column prop="createdAt" label="时间">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-box" style="margin-top: 20px; display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRoute } from "vue-router";
import { Search, Refresh } from "@element-plus/icons-vue";
import { queryTechnicianPointsLogListApi } from "@/api/modules/technician";
import { Technician } from "@/api/interface";

const route = useRoute();
const loading = ref(false);
const total = ref(0);
const tableData = ref<Technician.ResTechnicianPointItem[]>([]);
const dateRange = ref<[string, string] | []>([]);

const queryParams = reactive<Technician.ReqTechnicianLogParams>({
  page: 1,
  pageSize: 10,
  type: "",
  startTime: "",
  endTime: ""
});

const handleDateChange = (val: [string, string]) => {
  if (val) {
    queryParams.startTime = val[0];
    queryParams.endTime = val[1];
  } else {
    queryParams.startTime = "";
    queryParams.endTime = "";
  }
};

const handleQuery = async () => {
  const id = route.params.id as string;
  console.log("handleQuery==>", id);
  if (!id) return;

  loading.value = true;
  try {
    const { data } = await queryTechnicianPointsLogListApi(id, queryParams);
    tableData.value = data.list || [];
    total.value = data.pagination.total || 0;
  } finally {
    loading.value = false;
  }
};

const resetQuery = () => {
  queryParams.type = "";
  queryParams.startTime = "";
  queryParams.endTime = "";
  queryParams.page = 1;
  dateRange.value = [];
  handleQuery();
};

const handleSizeChange = (val: number) => {
  queryParams.pageSize = val;
  handleQuery();
};

const handleCurrentChange = (val: number) => {
  queryParams.page = val;
  handleQuery();
};

const formatDateTime = (dateString: string) => {
  if (!dateString) return "";
  return dateString.replace(/[TZ]/g, " ").replace(/\.\d+/, "");
};

const getPointTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    COMPLETE_ORDER: "完成工单",
    DEDUCT: "积分扣减",
    EXPIRE: "积分过期",
    MANUAL_ADJUST: "管理员手动调整",
    REWARD: "额外奖励",
    EXCHANGE: "积分兑换",
    OTHER: "其他变动"
  };
  return map[type] || type;
};

const getPointTypeTag = (type: string): "success" | "danger" | "info" | "warning" => {
  const map: Record<string, "success" | "danger" | "info" | "warning"> = {
    COMPLETE_ORDER: "success",
    DEDUCT: "danger",
    EXPIRE: "info",
    MANUAL_ADJUST: "warning",
    REWARD: "success",
    EXCHANGE: "warning",
    OTHER: "info"
  };
  return map[type] || "info";
};

onMounted(() => {
  handleQuery();
});
</script>

<style scoped>
.table-box {
  padding: 20px;
}
</style>
