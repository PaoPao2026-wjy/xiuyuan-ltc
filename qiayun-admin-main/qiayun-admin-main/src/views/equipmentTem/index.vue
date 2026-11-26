<template>
  <div class="template-container">
    <!-- 搜索筛选栏 -->
    <div class="search-filter-bar">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="模板类型">
          <el-select v-model="queryParams.type" placeholder="请选择模板类型" clearable style="width: 200px">
            <el-option label="低压柜" value="LOW_VOLTAGE_CABINET" />
            <el-option label="变压器" value="TRANSFORMER" />
            <el-option label="高压柜" value="HIGH_VOLTAGE_CABINET" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新建设备模板</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 模板列表 -->
    <div class="templates-table">
      <div class="table-header">
        <div class="table-title">设备模板列表</div>
      </div>

      <el-table v-loading="loading" :data="tableData" style="width: 100%">
        <el-table-column prop="name" label="设备模板名称" align="center" />
        <el-table-column prop="type" label="设备模板类型" align="center">
          <template #default="{ row }">
            {{ getTypeLabel(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="设备模板描述" align="center" show-overflow-tooltip />
        <el-table-column prop="creator.realName" label="创建人" align="center" />
        <el-table-column prop="createdAt" label="创建时间" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="EditPen" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="equipmentTem">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Refresh, Plus, EditPen, Delete } from "@element-plus/icons-vue";
import { queryEquipmentTemListApi, deleteEquipmentTemApi } from "@/api/modules/equipment";
import { Equipment } from "@/api/interface";

const router = useRouter();
const loading = ref(false);
const total = ref(0);
const tableData = ref<Equipment.ResEquipment[]>([]);

const queryParams = reactive<Equipment.ReqEquipmentParams>({
  page: 1,
  pageSize: 10,
  type: ""
});

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    LOW_VOLTAGE_CABINET: "低压柜",
    TRANSFORMER: "变压器",
    HIGH_VOLTAGE_CABINET: "高压柜"
  };
  return map[type] || type;
};

const formatDateTime = (time: string) => {
  if (!time) return "--";
  return time.replace("T", " ").split(".")[0];
};

const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await queryEquipmentTemListApi(queryParams);
    tableData.value = data.items || [];
    total.value = data.total || 0;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  queryParams.page = 1;
  fetchData();
};

const handleReset = () => {
  queryParams.type = "";
  handleSearch();
};

const handleAdd = () => {
  router.push("/equipmentTem/create");
};

const handleEdit = (row: Equipment.ResEquipment) => {
  router.push({ path: "/equipmentTem/edit/" + row.id });
};

const handleDelete = async (row: Equipment.ResEquipment) => {
  try {
    await ElMessageBox.confirm(`确认删除设备模板 "${row.name}" 吗?`, "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });
    await deleteEquipmentTemApi(row.id);
    ElMessage.success("删除成功");
    fetchData();
  } catch (error) {
    // cancelled or error
  }
};

const handleSizeChange = (val: number) => {
  queryParams.pageSize = val;
  fetchData();
};

const handleCurrentChange = (val: number) => {
  queryParams.page = val;
  fetchData();
};

onMounted(() => {
  fetchData();
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
    .pagination-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
  }
}
</style>
