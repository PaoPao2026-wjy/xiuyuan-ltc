<template>
  <div class="login-right">
    <div class="login-form-header">
      <h2 class="login-title">管理员登录</h2>
      <p class="login-description">请使用您的管理员账号登录系统</p>
    </div>
    <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" size="large">
      <el-form-item prop="username">
        <el-input v-model="loginForm.username" placeholder="请输入您的账号">
          <template #prefix>
            <el-icon class="el-input__icon">
              <user />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          placeholder="请输入您的登录密码"
          show-password
          autocomplete="new-password"
        >
          <template #prefix>
            <el-icon class="el-input__icon">
              <lock />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
    </el-form>
    <el-button class="login-btn" round size="large" type="primary" :loading="loading" @click="login(loginFormRef)">
      登录管理后台
    </el-button>
    <div class="login-footer">
      登录即表示您同意 <a href="#">《服务条款》</a> 和 <a href="#">《隐私政策》</a><br />
      © 2025 恰云电力服务. 保留所有权利
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { HOME_URL } from "@/config";
import { Login } from "@/api/interface";
// import { ElNotification } from "element-plus";
import { loginApi } from "@/api/modules/login";
import { useUserStore } from "@/stores/modules/user";
import { useTabsStore } from "@/stores/modules/tabs";
import { useKeepAliveStore } from "@/stores/modules/keepAlive";
import { initDynamicRouter } from "@/routers/modules/dynamicRouter";
import type { ElForm } from "element-plus";

const router = useRouter();
const userStore = useUserStore();
const tabsStore = useTabsStore();
const keepAliveStore = useKeepAliveStore();

type FormInstance = InstanceType<typeof ElForm>;
const loginFormRef = ref<FormInstance>();
const loginRules = reactive({
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }]
});

const loading = ref(false);
const loginForm = reactive<Login.ReqLoginForm>({
  username: "",
  password: ""
});

// login
const login = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (!valid) return;
    loading.value = true;
    try {
      // 1.执行登录接口
      const { data } = await loginApi(loginForm);
      userStore.setToken(data.access_token);
      userStore.setUserInfo({
        name: data.user.realName
        // role: data.user.role
      });

      // 2.添加动态路由
      await initDynamicRouter();

      // 3.清空 tabs、keepAlive 数据
      tabsStore.setTabs([]);
      keepAliveStore.setKeepAliveName([]);

      // 4.跳转到首页
      router.push(HOME_URL);
    } finally {
      loading.value = false;
    }
  });
};

onMounted(() => {
  // 监听 enter 事件（调用登录）
  document.onkeydown = (e: KeyboardEvent) => {
    if (e.code === "Enter" || e.code === "enter" || e.code === "NumpadEnter") {
      if (loading.value) return;
      login(loginFormRef.value);
    }
  };
});

onBeforeUnmount(() => {
  document.onkeydown = null;
});
</script>

<style scoped lang="scss">
@use "../index";
</style>
