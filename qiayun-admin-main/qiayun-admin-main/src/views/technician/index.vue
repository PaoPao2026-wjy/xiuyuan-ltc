<template>
  <div class="table-box">
    <el-card>
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="电工姓名">
          <el-input v-model="queryParams.keyword" placeholder="请输入电工姓名" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="实名认证状态">
          <el-select v-model="queryParams.realAuthStatus" placeholder="请选择实名认证状态" clearable style="width: 200px">
            <el-option label="未认证" value="UNAUTHORIZED" />
            <el-option label="审核中" value="AUDITING" />
            <el-option label="已认证" value="AUTHORIZED" />
            <el-option label="已拒绝" value="REJECTED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
          <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="tableData" style="width: 100%; margin-top: 20px">
        <el-table-column prop="realName" label="姓名" min-width="100" align="center" />
        <el-table-column prop="phone" label="手机号" min-width="120" align="center" />
        <el-table-column prop="idCardNo" label="身份证号" min-width="180" align="center" />
        <el-table-column prop="jobName" label="职位" min-width="120" align="center" />
        <el-table-column prop="totalOrders" label="总工单数" min-width="100" align="center" />
        <el-table-column prop="completedOrders" label="已完成工单数" min-width="120" align="center" />
        <el-table-column prop="rejectedOrders" label="拒绝工单数" min-width="120" align="center" />
        <el-table-column prop="points" label="积分总数" min-width="120" align="center">
          <template #default="{ row }">
            <el-tag type="success" class="cursor-pointer" @click="toPointsPage(row)">
              {{ row.points }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="toPointsPage(row)">查看积分</el-button>
            <el-button type="primary" link @click="toDetailPage(row)">查看详情</el-button>
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
import { useRouter } from "vue-router";
import { Search, Refresh } from "@element-plus/icons-vue";
import { queryTechnicianListApi } from "@/api/modules/technician";
import { Technician } from "@/api/interface";

const router = useRouter();
const loading = ref(false);
const total = ref(0);
const tableData = ref<Technician.ResTechnicianItem[]>([]);

const queryParams = reactive<Technician.ReqTechnicianParams>({
  page: 1,
  pageSize: 10,
  keyword: "",
  realAuthStatus: ""
});

const handleQuery = async () => {
  loading.value = true;
  try {
    const { data } = await queryTechnicianListApi(queryParams);
    tableData.value = data.list || [];
    total.value = data.pagination.total || 0;
  } finally {
    loading.value = false;
  }
};

const resetQuery = () => {
  queryParams.keyword = "";
  queryParams.realAuthStatus = "";
  queryParams.page = 1;
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

const toPointsPage = (row: Technician.ResTechnicianItem) => {
  router.push(`/technician/points/${row.technicianId}`);
};

const toDetailPage = (row: Technician.ResTechnicianItem) => {
  router.push(`/technician/detail/${row.technicianId}`);
};

onMounted(() => {
  handleQuery();
});
</script>

<style scoped>
.table-box {
  padding: 20px;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
