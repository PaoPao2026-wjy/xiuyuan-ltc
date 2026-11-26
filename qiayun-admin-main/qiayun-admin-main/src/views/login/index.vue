<template>
  <div class="login-container">
    <div class="login-left">
      <div class="brand-section">
        <div class="brand-logo">⚡</div>
        <h1 class="brand-title">恰云电力</h1>
        <p class="brand-subtitle">专业电力服务管理平台<br />智能化运维 · 数字化管理</p>

        <ul class="feature-list">
          <li class="feature-item">
            <span class="icon">👥</span>
            客户信息统一管理
          </li>
          <li class="feature-item">
            <span class="icon">📚</span>
            电力知识库维护
          </li>
          <li class="feature-item">
            <span class="icon">💼</span>
            业务内容发布管理
          </li>
        </ul>
      </div>
    </div>
    <LoginForm />
  </div>
</template>

<script setup lang="ts" name="login">
import LoginForm from "./components/LoginForm.vue";
</script>
<style>
#app {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  margin: 0;
  background: linear-gradient(135deg, #e6f7ff 0%, #91d5ff 50%, #40a9ff 100%);
}
</style>
<style scoped lang="scss">
@use "./index";
</style>
