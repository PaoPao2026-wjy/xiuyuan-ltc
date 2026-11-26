<template>
  <div class="equipment-container">
    <!-- 搜索筛选栏 -->
    <div class="search-filter-bar">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="企业">
          <el-select v-model="queryParams.enterpriseId" placeholder="请选择企业" clearable filterable style="width: 200px">
            <el-option v-for="item in companyOptions" :key="item.id" :label="item.enterpriseName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新建设备</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 设备列表 -->
    <div class="equipment-table">
      <div class="table-header">
        <div class="table-title">设备列表</div>
      </div>

      <el-table v-loading="loading" :data="tableData" style="width: 100%">
        <el-table-column prop="name" label="设备名称" align="center" fixed="left" width="200" show-overflow-tooltip />
        <el-table-column prop="enterprise.enterpriseName" label="企业" align="center" min-width="250" show-overflow-tooltip />
        <el-table-column prop="type" label="设备类型" align="center" min-width="120">
          <template #default="{ row }">
            {{ getTypeLabel(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="manufactureDate" label="生产日期" align="center" min-width="120">
          <template #default="{ row }">
            {{ formatDateTime(row.manufactureDate, true) }}
          </template>
        </el-table-column>
        <el-table-column label="铭牌照片" align="center" min-width="140">
          <template #default="{ row }">
            <el-image
              v-if="row.nameplatePhoto"
              style="width: 50px; height: 50px"
              :src="row.nameplatePhoto"
              :preview-src-list="[row.nameplatePhoto]"
              fit="cover"
              preview-teleported
            />
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="设备照片" align="center" width="250">
          <template #default="{ row }">
            <div class="photo-list" v-if="row.devicePhotos && row.devicePhotos.length">
              <el-image
                v-for="(photo, index) in row.devicePhotos.slice(0, 3)"
                :key="index"
                style="width: 50px; height: 50px; margin-right: 5px"
                :src="photo"
                :preview-src-list="row.devicePhotos"
                :initial-index="index"
                fit="cover"
                preview-teleported
              />
            </div>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建日期" align="center" width="200">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="EditPen" @click="handleEdit(row)">编辑</el-button>
            <el-button type="primary" link :icon="View" @click="handleDetail(row)">详情</el-button>
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

<script setup lang="ts" name="equipmentList">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Refresh, Plus, EditPen, Delete, View } from "@element-plus/icons-vue";
import { queryEquipmentListApi, deleteEquipmentApi } from "@/api/modules/equipment";
import { queryAllCompanyApi } from "@/api/modules/company";
import { Equipment, Company } from "@/api/interface";

const router = useRouter();
const loading = ref(false);
const total = ref(0);
const tableData = ref<Equipment.ResEquipment[]>([]);
const companyOptions = ref<Company.ResCompany[]>([]);

const queryParams = reactive<Equipment.ReqEquipmentListParams>({
  page: 1,
  pageSize: 10,
  enterpriseId: ""
});

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    LOW_VOLTAGE_CABINET: "低压柜",
    TRANSFORMER: "变压器",
    HIGH_VOLTAGE_CABINET: "高压柜"
  };
  return map[type] || type;
};

const formatDateTime = (time: string, isDateOnly = false) => {
  if (!time) return "--";
  if (isDateOnly) return time.split("T")[0];
  return time.replace("T", " ").split(".")[0];
};

const fetchCompanies = async () => {
  try {
    const { data } = await queryAllCompanyApi();
    // Assuming the API returns a list directly or inside data
    // Based on interface ResCompanyList, it has a list property, but queryAllCompanyApi might return array directly depending on implementation.
    // Let's assume standard response structure. If it's a list wrapper:
    if (Array.isArray(data)) {
      companyOptions.value = data;
    } else if (data && Array.isArray((data as any).list)) {
      companyOptions.value = (data as any).list;
    } else {
      companyOptions.value = [];
    }
  } catch (error) {
    console.error("获取企业列表失败", error);
  }
};

const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await queryEquipmentListApi(queryParams);
    tableData.value = data.items || [];
    total.value = data.total || 0;
  } catch (error) {
    console.error("获取设备列表失败", error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  queryParams.page = 1;
  fetchData();
};

const handleReset = () => {
  queryParams.enterpriseId = "";
  handleSearch();
};

const handleAdd = () => {
  router.push("/equipment/create");
};

const handleEdit = (row: Equipment.ResEquipment) => {
  router.push(`/equipment/edit/${row.id}`);
};

const handleDetail = (row: Equipment.ResEquipment) => {
  router.push(`/equipment/detail/${row.id}`);
};

const handleDelete = (row: Equipment.ResEquipment) => {
  ElMessageBox.confirm(`是否确认删除设备 "${row.name}"?`, "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    try {
      await deleteEquipmentApi(row.id);
      ElMessage.success("删除成功");
      fetchData();
    } catch (error) {
      console.error(error);
    }
  });
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
  fetchCompanies();
  fetchData();
});
</script>

<style lang="scss" scoped>
.equipment-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.search-filter-bar {
  background-color: #fff;
  padding: 18px 20px 0;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.equipment-table {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;

    .table-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.photo-list {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
