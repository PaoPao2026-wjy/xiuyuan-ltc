<template>
  <div class="company-container">
    <!-- 搜索筛选栏 -->
    <div class="search-filter-bar">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item>
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索企业名称、地址或联系方式..."
            clearable
            style="width: 300px"
            @keyup.enter="handleQuery"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="企业类型:">
          <el-select v-model="queryParams.enterpriseType" clearable style="width: 200px" @change="handleQuery">
            <el-option label="所有类型" value="" />
            <el-option label="国有企业" value="STATE_OWNED" />
            <el-option label="民营企业" value="PRIVATE" />
            <el-option label="外资企业" value="FOREIGN" />
            <el-option label="合资企业" value="JOINT_VENTURE" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
          <el-button class="btn btn-primary" @click="createCompany">
            <span class="icon">➕</span>
            新增企业
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 企业列表 -->
    <div class="companies-table">
      <div class="table-header">
        <div class="table-title">企业列表</div>
        <div>
          <el-button @click="refreshCompanies">
            <el-icon><Refresh /></el-icon>刷新
          </el-button>
        </div>
      </div>

      <el-table :data="companyList" style="width: 100%" @row-click="handleRowClick" v-loading="loading">
        <el-table-column prop="enterpriseName" label="企业名称">
          <template #default="{ row }">
            <div class="company-name">{{ row.enterpriseName }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="企业类型">
          <template #default="{ row }">
            <span :class="['company-type', row.enterpriseType]">{{ typeMap[row.enterpriseType] || "" }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="enterpriseAddress" label="地址" />
        <el-table-column prop="contactPhone" label="企业联系电话" />
        <el-table-column prop="contactName" label="联系人" />
        <el-table-column prop="contactPosition" label="联系人职务" />
        <el-table-column prop="contactMobile" label="联系人电话" />
        <el-table-column prop="contactEmail" label="联系人邮箱" />
        <!-- <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === '正常' ? 'success' : row.status === '审核中' ? 'warning' : 'danger'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column> -->
        <el-table-column prop="createdAt" label="注册时间">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220">
          <template #default="{ row }">
            <el-button type="success" size="small" @click.stop="viewCompany(row.id)">详情</el-button>
            <el-button type="primary" size="small" @click.stop="editCompany(row.id)">编辑</el-button>
            <el-button type="danger" size="small" @click.stop="deleteCompany(row.id)">删除</el-button>
            <!-- <el-button
              :type="row.status === '审核中' ? 'warning' : 'danger'"
              size="small"
              @click.stop="row.status === '审核中' ? approveCompany(row.id) : toggleCompanyStatus(row.id)"
            >
              {{ row.status === "审核中" ? "审核" : "停用" }}
            </el-button> -->
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
  </div>
</template>

<script setup lang="ts" name="company">
import { ref, reactive, onMounted } from "vue";
import { Search, Refresh } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { queryCompanyListApi, deleteCompanyApi } from "@/api/modules/company";
import { Company } from "@/api/interface";
import { useRouter } from "vue-router";

const router = useRouter();
// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  keyword: "",
  enterpriseType: ""
});

// 公司列表数据
const companyList = ref<Company.ResCompany[]>([]);

const typeMap = {
  STATE_OWNED: "国有企业",
  PRIVATE: "民营企业",
  FOREIGN: "外资企业",
  JOINT_VENTURE: "合资企业"
};

// 总数据条数
const total = ref(4);
const loading = ref(false);

const formatDateTime = (dateString: string) => {
  if (!dateString) return "";
  return dateString.replace(/[TZ]/g, " ").replace(/\.\d+/, "");
};

// 查询列表
const handleQuery = () => {
  loading.value = true;
  queryCompanyListApi(queryParams).then(res => {
    companyList.value = res.data.list;
    total.value = res.data.pagination.total;
    loading.value = false;
  });
};

// 重置查询
const resetQuery = () => {
  queryParams.keyword = "";
  queryParams.enterpriseType = "";
  queryParams.page = 1;
  handleQuery();
};

const createCompany = () => {
  router.push({ name: "createCompany" });
};

const editCompany = (id: string) => {
  router.push({ name: "editCompany", params: { id } });
};

// 删除公司
const deleteCompany = (id: string) => {
  ElMessageBox.confirm("确认删除该公司吗？", "删除确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteCompanyApi(id).then(res => {
      if (res.code === 200) {
        ElMessage.success("删除成功");
        handleQuery();
      } else {
        ElMessage.error(res.msg || "删除失败");
      }
    });
  });
};

// 刷新列表
const refreshCompanies = () => {
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

// 行点击事件
const handleRowClick = () => {
  // viewCompany(row.id);row: any
};

// 查看公司详情
const viewCompany = (id: string) => {
  router.push({ name: "companyDetail", params: { id } });
};
// 切换公司状态
// const toggleCompanyStatus = (id: string) => {
//   ElMessage.success(`已停用公司：${id}`);
//   // 这里应该是调用API修改状态
// };

// // 审核公司
// const approveCompany = (id: string) => {
//   ElMessage.success(`已审核通过公司：${id}`);
//   // 这里应该是调用API修改状态
// };

onMounted(() => {
  handleQuery();
});
</script>

<style scoped lang="scss">
@use "./index";
.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 15px;
}
.search-filter-bar {
  margin-bottom: 20px;
}
</style>
