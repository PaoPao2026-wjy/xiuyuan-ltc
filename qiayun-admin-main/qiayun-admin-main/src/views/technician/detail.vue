<template>
  <div class="technician-detail">
    <el-card v-loading="loading" class="detail-card">
      <template #header>
        <div class="header-box">
          <span class="header-title">电工详情</span>
          <el-button @click="router.back()">返回</el-button>
        </div>
      </template>

      <div v-if="technician" class="resume-container">
        <!-- Header / Profile Section -->
        <div class="resume-header">
          <div class="avatar-section">
            <el-avatar :size="100" :src="technician.wechatUser?.avatarUrl || ''" icon="UserFilled" />
          </div>
          <div class="info-section">
            <div class="name-row">
              <h1 class="name">{{ technician.realName || "未实名" }}</h1>
              <el-tag v-if="technician.workStatus" type="info" effect="plain" class="work-status-tag">
                {{ getWorkStatusLabel(technician.workStatus) }}
              </el-tag>
            </div>
            <div class="job-title">{{ technician.jobName || "暂无职位" }}</div>
            <div class="meta-row">
              <span class="meta-item">
                <el-icon><Male /></el-icon> {{ getGenderLabel(technician.wechatUser?.gender) }}
              </span>
              <span class="meta-item">
                <el-icon><Timer /></el-icon> {{ technician.experienceYears }}年经验
              </span>
              <span class="meta-item">
                <el-icon><Star /></el-icon> {{ technician.rating }}分
              </span>
            </div>
          </div>
        </div>

        <el-divider />

        <!-- Main Content -->
        <el-row :gutter="40">
          <!-- Left Column: Contact & ID -->
          <el-col :span="8">
            <div class="section-title">基本信息</div>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="手机号">{{ technician.phone }}</el-descriptions-item>
              <el-descriptions-item label="身份证号">{{ technician.idCardNo }}</el-descriptions-item>
              <el-descriptions-item label="积分">
                {{ technician.points }}
              </el-descriptions-item>
            </el-descriptions>

            <div class="section-title mt-20">身份证照片</div>
            <div class="id-cards">
              <div class="id-card-item">
                <div class="label">人像面</div>
                <el-image
                  v-if="technician.idCardFrontPhoto"
                  :src="technician.idCardFrontPhoto"
                  :preview-src-list="[technician.idCardFrontPhoto]"
                  fit="cover"
                  class="id-img"
                />
                <div v-else class="no-img">暂无照片</div>
              </div>
              <div class="id-card-item">
                <div class="label">国徽面</div>
                <el-image
                  v-if="technician.idCardBackPhoto"
                  :src="technician.idCardBackPhoto"
                  :preview-src-list="[technician.idCardBackPhoto]"
                  fit="cover"
                  class="id-img"
                />
                <div v-else class="no-img">暂无照片</div>
              </div>
            </div>
          </el-col>

          <!-- Right Column: Stats & Skills -->
          <el-col :span="16">
            <div class="section-title">工单统计</div>
            <el-row :gutter="20" class="stats-row">
              <el-col :span="6">
                <div class="stat-card total">
                  <div class="stat-value">{{ technician.totalOrders }}</div>
                  <div class="stat-label">总工单数</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-card completed">
                  <div class="stat-value">{{ technician.completedOrders }}</div>
                  <div class="stat-label">已完成</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-card rejected">
                  <div class="stat-value">{{ technician.rejectedOrders }}</div>
                  <div class="stat-label">已拒绝</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-card points">
                  <div class="stat-value">{{ technician.points }}</div>
                  <div class="stat-label">当前积分</div>
                </div>
              </el-col>
            </el-row>

            <div class="section-title mt-20">专业技能</div>
            <div class="skills-container">
              <el-tag v-for="skill in technician.skills" :key="skill" class="skill-tag" size="large">
                {{ skill }}
              </el-tag>
              <span v-if="!technician.skills?.length" class="no-data">暂无技能标签</span>
            </div>

            <div class="section-title mt-20">证书资质</div>
            <div class="certs-container">
              <el-image
                v-for="(cert, index) in technician.certificates"
                :key="index"
                :src="cert"
                :preview-src-list="technician.certificates"
                fit="cover"
                class="cert-img"
              />
              <span v-if="!technician.certificates?.length" class="no-data">暂无证书</span>
            </div>

            <div class="section-title mt-20">工作经历</div>
            <div class="experience-container">
              <el-timeline v-if="technician.workExperience?.length">
                <el-timeline-item
                  v-for="(item, index) in technician.workExperience"
                  :key="index"
                  :timestamp="item.startTime + ' - ' + (item.endTime || '至今')"
                  placement="top"
                >
                  <el-card shadow="hover" class="exp-card">
                    <h4 class="exp-title">{{ item.companyName }}</h4>
                    <p class="exp-desc">{{ item.jobDesc }}</p>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
              <span v-else class="no-data">暂无工作经历</span>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Male, Timer, Star } from "@element-plus/icons-vue";
import { queryTechnicianDetailApi } from "@/api/modules/technician";
import { Technician } from "@/api/interface";

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const technician = ref<Technician.ResTechnicianItem>();

const getTechnicianDetail = async () => {
  const id = route.params.id as string;
  if (!id) return;

  loading.value = true;
  try {
    const { data } = await queryTechnicianDetailApi(id);
    technician.value = data;
  } finally {
    loading.value = false;
  }
};

const getGenderLabel = (gender?: number) => {
  if (gender === 1) return "男";
  if (gender === 2) return "女";
  return "未知";
};

const getWorkStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    BUSY: "忙碌",
    AVAILABLE: "空闲"
  };
  return map[status] || status;
};

onMounted(() => {
  getTechnicianDetail();
});
</script>

<style scoped>
.technician-detail {
  padding: 20px;
}
.header-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-title {
  font-size: 18px;
  font-weight: bold;
}
.resume-container {
  padding: 20px;
}
.resume-header {
  display: flex;
  align-items: center;
  gap: 30px;
}
.info-section {
  flex: 1;
}
.name-row {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}
.name {
  margin: 0;
  font-size: 28px;
  color: #303133;
}
.job-title {
  font-size: 16px;
  color: #606266;
  margin-bottom: 15px;
}
.meta-row {
  display: flex;
  gap: 20px;
  color: #909399;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 15px;
  border-left: 4px solid #409eff;
  padding-left: 10px;
}
.mt-20 {
  margin-top: 30px;
}

.id-cards {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.id-card-item {
  background: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
}
.id-card-item .label {
  margin-bottom: 8px;
  color: #606266;
  font-size: 12px;
}
.id-img {
  width: 100%;
  height: 150px;
  border-radius: 4px;
  cursor: pointer;
}
.no-img {
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  background: #e4e7ed;
  border-radius: 4px;
}

.stats-row .stat-card {
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  background: #f5f7fa;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}
.stat-label {
  font-size: 12px;
  color: #909399;
}
.stat-card.total .stat-value {
  color: #409eff;
}
.stat-card.completed .stat-value {
  color: #67c23a;
}
.stat-card.rejected .stat-value {
  color: #f56c6c;
}
.stat-card.points .stat-value {
  color: #e6a23c;
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.certs-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}
.cert-img {
  width: 120px;
  height: 120px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  cursor: pointer;
}
.no-data {
  color: #909399;
  font-size: 13px;
}
.exp-card :deep(.el-card__body) {
  padding: 15px;
}
.exp-title {
  margin: 0 0 8px;
  font-size: 16px;
  color: #303133;
}
.exp-desc {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  white-space: pre-wrap;
}
</style>
