<template>
  <div class="account-container">
    <!-- 搜索筛选栏 -->
    <div class="search-filter-bar">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <!-- <el-form-item>
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索用户名、姓名或邮箱..."
            clearable
            style="width: 300px"
            @keyup.enter="handleQuery"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="角色:">
          <el-select v-model="queryParams.role" clearable style="width: 200px" @change="handleQuery">
            <el-option label="所有角色" value="" />
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
            <el-option label="审核员" value="auditor" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态:">
          <el-select v-model="queryParams.status" clearable style="width: 150px" @change="handleQuery">
            <el-option label="所有状态" value="" />
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item> -->
        <el-form-item>
          <!-- <el-button type="primary" @click="handleQuery">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><Refresh /></el-icon>重置
          </el-button> -->
          <el-button class="btn btn-primary" @click="createUser">
            <span class="icon">➕</span>
            新增用户
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 用户列表 -->
    <div class="users-table">
      <div class="table-header">
        <div class="table-title">用户列表</div>
        <div>
          <el-button @click="refreshUsers">
            <el-icon><Refresh /></el-icon>刷新
          </el-button>
        </div>
      </div>

      <el-table :data="userList" style="width: 100%" @row-click="handleRowClick" v-loading="loading">
        <el-table-column prop="username" label="用户名">
          <template #default="{ row }">
            <div class="user-name">{{ row.username }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="realName" label="真实姓名" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="role" label="角色">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)">{{ getRoleLabel(row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginAt" label="最后登录时间">
          <template #default="{ row }">
            {{ formatDateTime(row.lastLoginAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220">
          <template #default="{ row }">
            <el-button type="success" size="small" @click.stop="viewUser(row.adminId)">详情</el-button>
            <el-button type="primary" size="small" @click.stop="editUser(row.adminId)">编辑</el-button>
            <el-button type="danger" size="small" @click.stop="deleteUser(row.adminId)">删除</el-button>
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

    <!-- 新增/编辑用户对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="650px"
      :close-on-click-modal="false"
      :before-close="closeDialog"
    >
      <el-form :model="userForm" :rules="rules" ref="userFormRef" label-width="100px" label-position="right">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="userForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="userForm.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="userForm.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="角色" prop="role">
              <el-select v-model="userForm.role" placeholder="请选择角色" style="width: 100%">
                <el-option label="超级管理员" value="ADMIN" />
                <el-option label="管理员" value="MANAGER" />
                <el-option label="普通用户" value="STAFF" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码" prop="password" v-if="!userForm.id">
              <el-input v-model="userForm.password" type="password" placeholder="请输入密码" show-password />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 用户详情对话框 -->
    <el-dialog
      title="用户详情"
      v-model="detailDialogVisible"
      width="650px"
      :close-on-click-modal="false"
      :before-close="closeDetailDialog"
    >
      <el-form :model="detailUserForm" label-width="100px" label-position="right">
        <el-form-item label="用户名">
          <el-input v-model="detailUserForm.username" readonly />
        </el-form-item>

        <el-form-item label="真实姓名">
          <el-input v-model="detailUserForm.realName" readonly />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号">
              <el-input v-model="detailUserForm.phone" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱">
              <el-input v-model="detailUserForm.email" readonly />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="角色">
              <el-input :value="getRoleLabel(detailUserForm.role)" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最后登录">
              <el-input :value="formatDateTime(detailUserForm.lastLoginAt)" readonly />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="创建时间">
              <el-input :value="formatDateTime(detailUserForm.createdAt)" readonly />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDetailDialog">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="accountManage">
import { ref, reactive, onMounted } from "vue";
import { Refresh } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, FormInstance, FormRules } from "element-plus";
import { queryUserListApi, createUserApi, updateUserApi, deleteUserApi } from "@/api/modules/system";
import { System } from "@/api/interface";

// 日期格式化函数
const formatDateTime = (dateString: string) => {
  if (!dateString) return "";
  return dateString.replace(/[TZ]/g, " ").replace(/\.\d+/, "");
};

// 获取角色标签类型
const getRoleTagType = (role: string): "success" | "warning" | "info" | "primary" | "danger" => {
  const typeMap: Record<string, "success" | "warning" | "info" | "primary" | "danger"> = {
    ADMIN: "danger",
    MANAGER: "warning",
    STAFF: "primary"
  };
  return typeMap[role] || "info";
};

// 获取角色标签文本
const getRoleLabel = (role: string) => {
  const labelMap: Record<string, string> = {
    ADMIN: "超级管理员",
    MANAGER: "管理员",
    STAFF: "普通用户"
  };
  return labelMap[role] || role;
};

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  keyword: "",
  role: "",
  status: ""
});

// 用户列表数据
const userList = ref<System.ResUserList[]>([]);

// 总数据条数
const total = ref(0);
const loading = ref(false);

// 新增/编辑对话框
const dialogVisible = ref(false);
const dialogTitle = ref("新增用户");
const userFormRef = ref<FormInstance>();
const userForm = reactive({
  id: 0,
  username: "",
  realName: "",
  phone: "",
  email: "",
  role: "",
  password: ""
});

// 详情对话框
const detailDialogVisible = ref(false);
const detailUserForm = ref<System.ResUserList>({
  adminId: 0,
  username: "",
  realName: "",
  phone: "",
  email: "",
  role: "",
  avatar: "",
  status: "",
  lastLoginAt: "",
  createdAt: ""
});

// 表单验证规则
const rules = reactive<FormRules>({
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  realName: [{ required: true, message: "请输入真实姓名", trigger: "blur" }],
  phone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号", trigger: "blur" }
  ],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱格式", trigger: "blur" }
  ],
  role: [{ required: true, message: "请选择角色", trigger: "change" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }]
});

// 查询用户列表
const handleQuery = async () => {
  loading.value = true;
  try {
    const params: System.ReqSystemUserParams = {
      page: queryParams.page,
      pageSize: queryParams.pageSize
    };

    const { data } = await queryUserListApi(params);
    userList.value = data.list;
    total.value = data.pagination.total;
  } catch (error) {
    console.error("查询用户列表失败:", error);
  } finally {
    loading.value = false;
  }
};

// 重置查询
// const resetQuery = () => {
//   queryParams.keyword = "";
//   queryParams.role = "";
//   queryParams.status = "";
//   queryParams.page = 1;
//   handleQuery();
// };

// 刷新用户列表
const refreshUsers = () => {
  handleQuery();
};

// 分页大小改变
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size;
  queryParams.page = 1;
  handleQuery();
};

// 当前页改变
const handleCurrentChange = (page: number) => {
  queryParams.page = page;
  handleQuery();
};

// 行点击事件
const handleRowClick = (row: System.ResUserList) => {
  console.log("点击行:", row);
};

// 新增用户
const createUser = () => {
  dialogTitle.value = "新增用户";
  dialogVisible.value = true;
  resetForm();
};

// 编辑用户
const editUser = (id: number) => {
  dialogTitle.value = "编辑用户";
  const user = userList.value.find(item => item.adminId === id);
  if (user) {
    userForm.id = user.adminId;
    userForm.username = user.username;
    userForm.realName = user.realName;
    userForm.phone = user.phone;
    userForm.email = user.email;
    userForm.role = user.role;
    userForm.password = ""; // 编辑时不显示密码
  }
  dialogVisible.value = true;
};

// 查看用户详情
const viewUser = (id: number) => {
  const user = userList.value.find(item => item.adminId === id);
  if (user) {
    detailUserForm.value = { ...user };
    detailDialogVisible.value = true;
  }
};

// 删除用户
const deleteUser = (id: number) => {
  ElMessageBox.confirm("确定要删除该用户吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    try {
      await deleteUserApi(id);
      ElMessage.success("删除成功");
      handleQuery();
    } catch (error) {
      console.error("删除用户失败:", error);
    }
  });
};

// 关闭对话框
const closeDialog = () => {
  dialogVisible.value = false;
  resetForm();
};

// 关闭详情对话框
const closeDetailDialog = () => {
  detailDialogVisible.value = false;
};

// 重置表单
const resetForm = () => {
  userForm.id = 0;
  userForm.username = "";
  userForm.realName = "";
  userForm.phone = "";
  userForm.email = "";
  userForm.role = "";
  userForm.password = "";

  // 重置表单验证
  if (userFormRef.value) {
    userFormRef.value.resetFields();
  }
};

// 提交表单
const submitForm = () => {
  if (!userFormRef.value) return;

  userFormRef.value.validate(async valid => {
    if (valid) {
      try {
        if (userForm.id) {
          // 编辑用户
          const params: System.ReqUpdateSystemUserForm = {
            id: userForm.id,
            username: userForm.username,
            realName: userForm.realName,
            phone: userForm.phone,
            email: userForm.email,
            role: userForm.role,
            password: userForm.password
          };
          await updateUserApi(params);
          ElMessage.success("编辑成功");
        } else {
          // 新增用户
          const params: System.ReqSystemUserForm = {
            username: userForm.username,
            realName: userForm.realName,
            phone: userForm.phone,
            email: userForm.email,
            role: userForm.role,
            password: userForm.password
          };
          await createUserApi(params);
          ElMessage.success("新增成功");
        }
        closeDialog();
        handleQuery();
      } catch (error) {
        console.error("提交表单失败:", error);
      }
    }
  });
};

onMounted(() => {
  handleQuery();
});
</script>

<style scoped lang="scss">
.account-container {
  padding: 20px;
}
.search-filter-bar {
  margin-bottom: 20px;
  .demo-form-inline {
    .el-form-item {
      margin-bottom: 10px;
    }
  }
  .btn {
    &.btn-primary {
      color: white;
      background: var(--primary-color);
      border: none;
      .icon {
        margin-right: 5px;
      }
    }
  }
}
.users-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
  .table-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px solid #ebeef5;
    .table-title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }
  .user-name {
    font-weight: 500;
    color: #409eff;
  }
}
.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 15px;
}
.dialog-footer {
  .el-button {
    margin-left: 10px;
  }
}
</style>
