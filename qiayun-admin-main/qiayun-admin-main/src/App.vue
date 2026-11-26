<template>
  <el-config-provider :locale="locale" :size="assemblySize" :button="buttonConfig">
    <router-view></router-view>
  </el-config-provider>
</template>

<script setup lang="ts">
import { onMounted, reactive, computed } from "vue";
import { useI18n } from "vue-i18n";
import { getBrowserLang } from "@/utils";
import { useTheme } from "@/hooks/useTheme";
import { ElConfigProvider } from "element-plus";
import { LanguageType } from "./stores/interface";
import { useGlobalStore } from "@/stores/modules/global";
import en from "element-plus/es/locale/lang/en";
import zhCn from "element-plus/es/locale/lang/zh-cn";

const globalStore = useGlobalStore();

// init theme
const { initTheme } = useTheme();
initTheme();

// init language
const i18n = useI18n();
onMounted(() => {
  const language = globalStore.language ?? getBrowserLang();
  i18n.locale.value = language;
  globalStore.setGlobalState("language", language as LanguageType);
});

// element language
const locale = computed(() => {
  if (globalStore.language == "zh") return zhCn;
  if (globalStore.language == "en") return en;
  return getBrowserLang() == "zh" ? zhCn : en;
});

// element assemblySize
const assemblySize = computed(() => globalStore.assemblySize);

// element button config
const buttonConfig = reactive({ autoInsertSpace: false });
</script>
<style>
:root {
  --primary-color: #14cccc;
  --primary-dark: #007acc;
  --primary-light: #66d9ef;
  --secondary-color: #e6f7ff;
  --accent-color: #ffa500;
  --danger-color: #ff4d4f;
  --success-color: #52c41a;
  --warning-color: #faad14;
  --background-color: #f5f7fa;
  --card-background: #ffffff;
  --text-primary: #333333;
  --text-secondary: #666666;
  --text-light: #999999;
  --border-color: #e6e6e6;
  --border-light: #f0f0f0;
  --shadow-color: rgba(0, 0, 0, 0.08);
  --shadow-hover: rgba(0, 0, 0, 0.12);
}
</style>
