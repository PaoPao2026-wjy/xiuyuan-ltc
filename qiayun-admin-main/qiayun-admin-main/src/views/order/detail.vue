<template>
  <div class="order-detail-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
        <h1 class="page-title">工单详情</h1>
      </div>
      <div class="header-right" v-if="orderDetailData">
        <el-tag :type="statusTagType(orderDetailData.status)" size="large">
          {{ getStatusLabel(orderDetailData.status) }}
        </el-tag>
      </div>
    </div>

    <!-- 工单详情内容 -->
    <div class="detail-content" v-loading="loading">
      <div v-if="orderDetailData" class="detail-container">
        <!-- 1. 基本信息 -->
        <div class="detail-section">
          <div class="section-title">基本信息</div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">工单标题</span>
              <span class="detail-value">{{ orderDetailData.title || "-" }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">工单类型</span>
              <span class="detail-value">{{ typeLabel(orderDetailData.type) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">预计工期(小时)</span>
              <span class="detail-value">{{ orderDetailData.estimatedHours ?? "-" }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">优先级</span>
              <span class="detail-value">
                <el-tag :type="priorityTagType(orderDetailData.priority)">
                  {{ getPriorityLabel(orderDetailData.priority) }}
                </el-tag>
              </span>
            </div>
          </div>
        </div>

        <!-- 2. 客户信息 -->
        <div class="detail-section">
          <div class="section-title">客户信息</div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">客户单位</span>
              <span class="detail-value">{{ orderDetailData.enterprise?.enterpriseName || "-" }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">联系人姓名</span>
              <span class="detail-value">{{ orderDetailData.contactName || "-" }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">联系电话</span>
              <span class="detail-value">{{ orderDetailData.contactPhone || "-" }}</span>
            </div>
            <div class="detail-item full-width">
              <span class="detail-label">工作地点</span>
              <span class="detail-value">{{ orderDetailData.workAddress || "-" }}</span>
            </div>
          </div>
        </div>

        <!-- 3. 工单详情 -->
        <div class="detail-section">
          <div class="section-title">工单详情</div>
          <div class="detail-wrap">
            <div class="detail-grid vertical-layout">
              <div class="detail-item full-width">
                <span class="detail-label">已指派电工</span>
                <span class="detail-value">
                  <el-select
                    v-model="technicianId"
                    placeholder="选择电工"
                    style="width: 200px"
                    size="default"
                    @change="handleTechnicianChange"
                  >
                    <el-option
                      v-for="item in technicians"
                      :key="item.technicianId"
                      :label="item.realName"
                      :value="item.technicianId"
                    />
                  </el-select>
                </span>
              </div>
              <div class="detail-item full-width flex-grow">
                <span class="detail-label">具体要求</span>
                <span class="detail-value">{{ orderDetailData.specificRequirements || "-" }}</span>
              </div>

              <div class="detail-item full-width flex-grow">
                <span class="detail-label">相关图片</span>
                <span class="detail-value">
                  <div v-if="orderDetailData.images && orderDetailData.images.length" class="images-grid">
                    <div v-for="(img, i) in orderDetailData.images" :key="i" class="image-wrap">
                      <el-image
                        :src="img"
                        fit="cover"
                        :preview-src-list="orderDetailData.images"
                        :initial-index="i"
                        :preview-teleported="true"
                        lazy
                        style="width: 100%; height: 100%"
                      />
                    </div>
                  </div>
                  <span v-else>-</span>
                </span>
              </div>
            </div>
            <div class="detail-status">
              <div v-if="processing.length" class="timeline">
                <div v-for="(item, index) in processing" :key="index" class="timeline-item">
                  <div class="timeline-left">
                    <div class="timeline-icon" :style="{ backgroundColor: getStatusColor(item.status) }">
                      <el-icon><component :is="getStatusIcon(item.status)" /></el-icon>
                    </div>
                    <div class="timeline-line" v-if="index !== processing.length - 1"></div>
                  </div>
                  <div class="timeline-content">
                    <div class="timeline-title">{{ item.label }}</div>
                    <div class="timeline-time" :class="{ 'is-bold': item.status === 'ARRIVAL_NOTIFIED' }">
                      <template v-if="item.time">
                        <span v-if="item.status === 'ARRIVAL_NOTIFIED'">预计到达时间: </span>{{ item.time }}
                      </template>
                    </div>
                    <div class="timeline-remark">{{ getStatusDescription(item.status) }}</div>
                    <div v-if="item.photos && item.photos.length" class="timeline-photos">
                      <el-image
                        v-for="(photo, pIndex) in item.photos"
                        :key="pIndex"
                        :src="photo"
                        :preview-src-list="item.photos"
                        :initial-index="pIndex"
                        fit="cover"
                        preview-teleported
                      />
                    </div>
                    <div v-if="item.reason" class="timeline-remark mt10">拒绝原因: {{ item.reason }}</div>
                    <div v-if="item.remark" class="timeline-remark mt10">备注: {{ item.remark }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <template v-if="orderDetailData?.status === 'COMPLETED' && configList.length">
            <div class="template-details">
              <TemplateResultCard v-for="cfg in configList" :key="cfg.id" :cfg="cfg" :result-map="resultMap" />
            </div>
          </template>
          <!-- 模板选择详情 -->
          <template v-else-if="orderDetailData.descriptionType === 'template'">
            <div class="template-details">
              <ConfigItemCard
                v-for="cfg in configList"
                :key="cfg.id"
                :cfg="cfg"
                :selected-items="selectedItems"
                :is-operation-checked="isOperationChecked"
                :set-operation-checked="setOperationChecked"
              />
            </div>
          </template>

          <!-- 自定义描述详情 -->
          <template v-else>
            <div class="custom-description">
              <div class="custom-section-title">自定义描述</div>
              <div class="custom-content">
                {{ orderDetailData.customDescription || "-" }}
              </div>
            </div>
          </template>
        </div>

        <!-- 4. 计划时间 -->
        <div class="detail-section">
          <div class="section-title">计划时间</div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">计划开始时间</span>
              <span class="detail-value">{{ formatDateTime(orderDetailData.plannedStartTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">计划结束时间</span>
              <span class="detail-value">{{ formatDateTime(orderDetailData.plannedEndTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">预计处理时间</span>
              <span class="detail-value">
                {{ formatPlannedDuration(orderDetailData.plannedStartTime, orderDetailData.plannedEndTime) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 5. 其他信息 -->
        <div class="detail-section">
          <div class="section-title">其他信息</div>
          <div class="detail-grid">
            <div class="detail-item full-width">
              <span class="detail-label">特殊要求</span>
              <span class="detail-value">
                <span v-if="Array.isArray(orderDetailData.specialRequirements) && orderDetailData.specialRequirements.length">
                  <el-tag v-for="(sr, i) in orderDetailData.specialRequirements" :key="i" class="requirement-tag">
                    {{ sr }}
                  </el-tag>
                </span>
                <span v-else>-</span>
              </span>
            </div>
            <div class="detail-item full-width">
              <span class="detail-label">备注</span>
              <span class="detail-value">{{ orderDetailData.remarks || "-" }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">创建人</span>
              <span class="detail-value">{{ orderDetailData.creator?.realName || "-" }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">创建时间</span>
              <span class="detail-value">{{ formatDateTime(orderDetailData.createdAt) }}</span>
            </div>
            <!-- <div class="detail-item full-width">
              <span class="detail-label">已指派电工</span>
              <span class="detail-value">{{ getAssignments(orderDetailData.assignments) }}</span>
            </div> -->
          </div>
        </div>

        <div v-if="orderDetailData?.status === 'COMPLETED'" class="detail-section">
          <div class="section-title">电工处理结果</div>
          <div class="detail-grid">
            <!-- 任务处理图片 -->
            <div class="detail-item full-width">
              <span class="detail-label">任务处理图片</span>
              <span class="detail-value">
                <span v-if="processingInfo?.processingImages?.length">
                  <div class="image-grid">
                    <el-image
                      v-for="(img, idx) in processingInfo.processingImages"
                      :key="idx"
                      :src="img"
                      fit="cover"
                      :preview-src-list="processingInfo.processingImages"
                      :initial-index="idx"
                      preview-teleported
                      :z-index="3000"
                    />
                  </div>
                </span>
                <span v-else>-</span>
              </span>
            </div>

            <!-- 工单处理视频 -->
            <div class="detail-item full-width">
              <span class="detail-label">工单处理视频</span>
              <span class="detail-value">
                <span v-if="processingInfo?.processingVideos?.length">
                  <div class="video-grid">
                    <div
                      v-for="(video, vidx) in processingInfo.processingVideos"
                      :key="vidx"
                      class="video-thumb"
                      @click="openVideoPreview(video)"
                      title="点击预览"
                    >
                      <span class="play-icon">▶</span>
                      <span class="video-name">点击预览</span>
                    </div>
                  </div>
                </span>
                <span v-else>-</span>
              </span>
            </div>

            <!-- 工单处理备注 -->
            <div class="detail-item full-width">
              <span class="detail-label">工单处理备注</span>
              <span class="detail-value">{{ processingInfo?.remark || "-" }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 无数据状态 -->
      <div v-else-if="!loading" class="no-data">
        <el-empty description="工单数据不存在或已被删除" />
      </div>
    </div>

    <el-dialog v-model="videoPreviewVisible" title="视频预览" width="60%" append-to-body>
      <video
        v-if="currentVideoUrl && videoPreviewVisible"
        :src="currentVideoUrl"
        controls
        style="width: 100%; max-height: 70vh"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="order-detail">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ArrowLeft, Document, User, Van, Location, Check, VideoPlay, CircleCheck, CircleClose } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { queryOrderDetailApi, queryTempCascaderApi } from "@/api/modules/order";
import { Order } from "@/api/interface";
import ConfigItemCard from "@/components/ConfigItemCard/index.vue";
import TemplateResultCard from "@/components/ConfigItemCard/TemplateResultCard.vue";

const router = useRouter();
const route = useRoute();

const taskStatusMap = [
  {
    status: "NOT_STARTED",
    label: "未开始",
    time: "",
    remark: ""
  },
  {
    status: "ARRIVAL_NOTIFIED",
    label: "已通知预计到达时间",
    time: "",
    remark: ""
  },
  {
    status: "DEPARTED",
    label: "已出发",
    time: "",
    remark: ""
  },
  {
    status: "ARRIVED",
    label: "已到达",
    time: "",
    remark: ""
  },
  {
    status: "SELF_INSPECTED",
    label: "已完成装备自检",
    photos: [],
    time: "",
    remark: ""
  },
  {
    status: "EXECUTING",
    label: "执行巡检任务",
    time: "",
    remark: ""
  },
  {
    status: "COMPLETED",
    label: "已完成",
    time: "",
    remark: ""
  },
  {
    status: "REJECTED",
    label: "已拒绝",
    time: "",
    remark: "",
    reason: ""
  }
];

const processing = ref<{ status: string; label: string; time: string; remark: string; photos?: string[]; reason?: string }[]>([]);

const getStatusIcon = (status: string) => {
  switch (status) {
    case "NOT_STARTED":
      return Document;
    case "ARRIVAL_NOTIFIED":
      return User;
    case "DEPARTED":
      return Van;
    case "ARRIVED":
      return Location;
    case "SELF_INSPECTED":
      return Check;
    case "EXECUTING":
      return VideoPlay;
    case "COMPLETED":
      return CircleCheck;
    case "REJECTED":
      return CircleClose;
    default:
      return Document;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "NOT_STARTED":
      return "#26C2CD";
    case "ARRIVAL_NOTIFIED":
      return "#26C2CD";
    case "DEPARTED":
      return "#FF9A2E";
    case "ARRIVED":
      return "#FF4D4F";
    case "SELF_INSPECTED":
      return "#409EFF";
    case "EXECUTING":
      return "#409EFF";
    case "COMPLETED":
      return "#67C23A";
    case "REJECTED":
      return "#F56C6C";
    default:
      return "#909399";
  }
};

const getStatusDescription = (status: string) => {
  switch (status) {
    case "NOT_STARTED":
      return "工单已创建，已分配电工";
    case "ARRIVAL_NOTIFIED":
      return "电工已确认接单，通知预计到达时间";
    case "DEPARTED":
      return "电工已出发前往现场";
    case "ARRIVED":
      return "电工已到达现场";
    case "SELF_INSPECTED":
      return "电工已完成装备自检";
    case "EXECUTING":
      return "正在执行巡检任务";
    case "COMPLETED":
      return "任务已完成";
    case "REJECTED":
      return "工单已拒绝";
    default:
      return "";
  }
};

const resultMap = ref<Record<number, Record<number, string>>>({});
// 数据状态
const loading = ref(false);
const orderDetailData = ref<Order.ResOrderDetail | null>(null);
const cascaderConfigs = ref<Order.ResTempDetail[]>([]);
const configList = ref<Order.ResTempDetail[]>([]);
const selectedItems = ref<Record<number, boolean>>({});
const selectedOps = ref<Record<number, Record<number, boolean>>>({});
const technicians = ref<Order.ITechnician[]>([]);
const technicianId = ref<number | undefined>(undefined);
const processingInfo = ref<Order.ResOrderProcessingInfo>({
  processingImages: [],
  processingVideos: [],
  remark: "",
  processingStatus: "",
  estimatedArrivalTime: "",
  arrivalNotifiedRemark: "",
  departedRemark: "",
  arrivedRemark: "",
  selfInspectedRemark: "",
  rejectTime: "",
  rejectReason: "",
  departureTime: "",
  arrivalTime: "",
  selfInspectionTime: "",
  executionStartTime: "",
  completeTime: "",
  tempList: [],
  processingResult: undefined,
  technician: {
    technicianId: 0,
    realName: "",
    phone: ""
  }
});

const videoPreviewVisible = ref(false);
const currentVideoUrl = ref<string>("");

const handleTechnicianChange = (id: number) => {
  if (!orderDetailData.value?.workOrderTechnicians) return;
  const target = (orderDetailData.value.workOrderTechnicians as any[]).find((item: any) => item.technician?.technicianId === id);
  if (target) {
    updateViewWithTechnicianData(target);
  }
};

const updateViewWithTechnicianData = (data: any) => {
  processingInfo.value.processingImages = data.processingImages || [];
  processingInfo.value.processingVideos = data.processingVideos || [];
  processingInfo.value.remark = data.remark || "";

  let processingResult = data.processingResult;
  if (typeof processingResult === "string") {
    try {
      processingResult = JSON.parse(processingResult);
    } catch (e) {
      console.error("JSON parse error", e);
      processingResult = {};
    }
  }
  const tempList = processingResult?.tempList || [];
  processingInfo.value.tempList = tempList;
  buildResultMapFromProcessingTempList(tempList);

  const workOrderTechnicians = data;
  processingInfo.value.processingImages = workOrderTechnicians.processingImages || [];
  processingInfo.value.processingVideos = workOrderTechnicians.processingVideos || [];
  processingInfo.value.remark = workOrderTechnicians.remark || "";
  technicianId.value = workOrderTechnicians.technician.technicianId || 0;
  let processingList: typeof processing.value = [];
  if (workOrderTechnicians.processingStatus !== "REJECTED") {
    const index = taskStatusMap.findIndex(item => item.status === workOrderTechnicians.processingStatus);
    if (index !== -1) {
      processingList = taskStatusMap.slice(0, index + 1).map(item => ({ ...item }));
    }
  } else {
    processingList = taskStatusMap.slice(0, 1).map(item => ({ ...item }));
    processingList.push({
      status: "REJECTED",
      label: "已拒绝",
      time: formatDateTime(workOrderTechnicians.rejectTime) || "",
      reason: workOrderTechnicians.rejectReason || "",
      remark: workOrderTechnicians.remark || ""
    });
  }
  processingList.forEach(item => {
    switch (item.status) {
      case "ARRIVAL_NOTIFIED":
        item.time = formatDateTime(workOrderTechnicians.estimatedArrivalTime) || "";
        item.remark = workOrderTechnicians.arrivalNotifiedRemark || "";
        break;
      case "DEPARTED":
        item.time = formatDateTime(workOrderTechnicians.departureTime) || "";
        item.remark = workOrderTechnicians.departedRemark || "";
        break;
      case "ARRIVED":
        item.time = formatDateTime(workOrderTechnicians.arrivalTime) || "";
        item.remark = workOrderTechnicians.arrivedRemark || "";
        break;
      case "SELF_INSPECTED":
        item.time = formatDateTime(workOrderTechnicians.selfInspectionTime) || "";
        item.photos = workOrderTechnicians.selfInspectionPhotos || [];
        item.remark = workOrderTechnicians.selfInspectedRemark || "";
        break;
      case "EXECUTING":
        item.time = formatDateTime(workOrderTechnicians.executionStartTime) || "";
        break;
      case "COMPLETED":
        item.time = formatDateTime(workOrderTechnicians.completeTime) || "";
        break;
      default:
        if (item.status === "NOT_STARTED") {
          const time = orderDetailData.value?.createdAt || "";
          item.time = formatDateTime(time);
        }
        break;
    }
  });
  processing.value = processingList;
};

const openVideoPreview = (url: string) => {
  currentVideoUrl.value = url;
  videoPreviewVisible.value = true;
};

const isOperationChecked = (itemId: number, opId: number) => {
  return !!selectedOps.value[itemId]?.[opId];
};

const setOperationChecked = () => {
  // noop in detail page
};

// 加载配置项分组
const loadCascaderConfigs = async () => {
  try {
    const res = await queryTempCascaderApi({ keyword: "" });
    cascaderConfigs.value = res.data || [];
  } catch {
    cascaderConfigs.value = [];
  }
};

const buildConfigFromTempList = () => {
  const st = orderDetailData.value?.selectedTemplateItems || { tempList: [] };
  const tempList = Array.isArray(st.tempList) ? st.tempList : [];

  // 过滤出 tempList 中的配置组，并只保留被选择的检查项
  const groups = cascaderConfigs.value
    .filter(cfg => tempList.some(t => String(t.id) === String(cfg.id)))
    .map(cfg => {
      const tGroup = tempList.find(t => String(t.id) === String(cfg.id)) || { items: [] };
      const allowedItemIds = new Set((tGroup.items || []).map((i: any) => String(i.id)));
      const itemsFiltered = (cfg.items || []).filter(item => allowedItemIds.has(String(item.id)));

      // 回显：行选择 + 操作项选择
      itemsFiltered.forEach(item => {
        const itemId = Number(item.id);
        selectedItems.value[itemId] = true;
        const opMap = selectedOps.value[itemId] || (selectedOps.value[itemId] = {});
        const tItem = (tGroup.items || []).find((x: any) => String(x.id) === String(item.id));
        (tItem?.operationItems || []).forEach((op: any) => {
          opMap[Number(op.id)] = true;
        });
      });

      // 返回过滤后的组，沿用原始 operations 作为列
      return { ...cfg, items: itemsFiltered };
    });

  configList.value = groups;
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 格式化日期时间
const formatDateTime = (dateString: string) => {
  if (!dateString) return "-";
  return dateString.replace(/[TZ]/g, " ").replace(/\.\d+/, "");
};

// 格式化计划时长
const formatPlannedDuration = (start: string, end: string) => {
  if (!start || !end) return "-";
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  if (diffMs <= 0) return "-";
  const totalMinutes = Math.round(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}小时${minutes}分钟`;
};

// 获取指派信息
// const getAssignments = (assignments: any[]) => {
//   const names = Array.isArray(assignments)
//     ? assignments.map(item => (typeof item === "string" ? item : item?.technician?.realName)).filter(Boolean)
//     : [];
//   const uniqueNames = Array.from(new Set(names));
//   return uniqueNames.length ? uniqueNames.join("、") : "-";
// };

// 类型中文映射
const typeLabel = (type?: string) => {
  switch (type) {
    case "INSPECTION":
      return "巡检";
    case "MAINTENANCE":
      return "保养";
    case "REPAIR":
      return "维修";
    case "ELECTRICAL_TEST":
      return "电试";
    case "TRANSFORMATION":
      return "改造";
    case "EMERGENCY_REPAIR":
      return "抢修";
    case "DAILY_PURCHASE":
      return "日常采购";
    case "TECHNICAL_GUIDANCE":
      return "技术指导";
    case "OTHER":
      return "其他";
    default:
      return type || "-";
  }
};

// 状态标签类型
const statusTagType = (status?: string) => {
  if (!status) return "info";
  const map: Record<string, "primary" | "success" | "warning" | "danger" | "info"> = {
    PENDING_REVIEW: "warning",
    REVIEW_REJECTED: "danger",
    PENDING_ACCEPTANCE: "warning",
    ACCEPTED: "primary",
    IN_PROGRESS: "primary",
    COMPLETED: "success",
    REJECTED: "danger",
    CANCELLED: "info"
  };
  return map[status] || "info";
};

// 状态标签文本
const getStatusLabel = (status?: string) => {
  const statusMap = [
    { key: "ALL", label: "全部" },
    { key: "PENDING_REVIEW", label: "待审核" },
    { key: "REVIEW_REJECTED", label: "审核驳回" },
    { key: "PENDING_ACCEPTANCE", label: "待接单" },
    { key: "ACCEPTED", label: "已接单" },
    { key: "IN_PROGRESS", label: "进行中" },
    { key: "COMPLETED", label: "已完成" },
    { key: "REJECTED", label: "已拒绝" },
    { key: "CANCELLED", label: "已取消" }
  ];
  const item = statusMap.find(item => item.key === status);
  return item ? item.label : status || "-";
};

// 优先级标签类型
const priorityTagType = (priority?: string) => {
  switch (priority) {
    case "URGENT":
      return "danger";
    case "NORMAL":
      return "warning";
    case "LOW":
      return "info";
    default:
      return "info";
  }
};

// 优先级标签文本
const getPriorityLabel = (priority?: string) => {
  switch (priority) {
    case "URGENT":
      return "紧急";
    case "NORMAL":
      return "普通";
    case "LOW":
      return "较低";
    default:
      return priority || "-";
  }
};

const buildResultMapFromProcessingTempList = (tempList: any[]) => {
  const map: Record<number, Record<number, string>> = {};
  (tempList || []).forEach(group => {
    (group.items || []).forEach((item: any) => {
      const itemId = Number(item.id);
      const opMap = map[itemId] || (map[itemId] = {});
      (item.operationItems || []).forEach((op: any) => {
        const opId = Number(op.id);
        let raw = op?.value;
        // 兜底处理：有些接口可能用其他字段名
        if (raw === undefined) raw = op?.selected ?? op?.text ?? op?.checked;

        let show = "";
        switch (op?.type) {
          case "BOOLEAN":
            show = raw === true || raw === "true" || raw === 1 || raw === "1" ? "是" : "否";
            break;
          case "SELECT":
          case "TEXT":
          default:
            show = Array.isArray(raw) ? raw.join("、") : String(raw ?? "");
            break;
        }
        opMap[opId] = show;
      });
    });
  });
  resultMap.value = map;
};

// 加载工单详情
const loadOrderDetail = async (id: number) => {
  loading.value = true;
  try {
    const res = await queryOrderDetailApi(id);
    if (res.code === 200) {
      orderDetailData.value = res.data || null;

      if (orderDetailData.value?.descriptionType === "template") {
        buildConfigFromTempList();
      }
      technicians.value = res.data.workOrderTechnicians.map(item => item.technician);
      if (res.data.workOrderTechnicians && res.data.workOrderTechnicians.length > 0) {
        const workIndex = res.data.workOrderTechnicians.findIndex(item => item.processingStatus === "COMPLETED");
        const workOrderTechnicians =
          workIndex !== -1 ? res.data.workOrderTechnicians[workIndex] : res.data.workOrderTechnicians[0];
        processingInfo.value.processingImages = workOrderTechnicians.processingImages || [];
        processingInfo.value.processingVideos = workOrderTechnicians.processingVideos || [];
        processingInfo.value.remark = workOrderTechnicians.remark || "";
        technicianId.value = workOrderTechnicians.technician.technicianId || undefined;
        const processingResult = workOrderTechnicians.processingResult;
        const tempList = (processingResult && processingResult.tempList) || [];
        processingInfo.value.tempList = tempList;
        buildResultMapFromProcessingTempList(tempList);
        console.log("processingResult====>", tempList);
        let processingList: typeof processing.value = [];
        if (workOrderTechnicians.processingStatus !== "REJECTED") {
          const index = taskStatusMap.findIndex(item => item.status === workOrderTechnicians.processingStatus);
          if (index !== -1) {
            processingList = taskStatusMap.slice(0, index + 1).map(item => ({ ...item }));
          }
        } else {
          processingList = taskStatusMap.slice(0, 1).map(item => ({ ...item }));
          processingList.push({
            status: "REJECTED",
            label: "已拒绝",
            time: formatDateTime(workOrderTechnicians.rejectTime) || "",
            reason: workOrderTechnicians.rejectReason || "",
            remark: workOrderTechnicians.remark || ""
          });
        }
        processingList.forEach(item => {
          switch (item.status) {
            case "ARRIVAL_NOTIFIED":
              item.time = formatDateTime(workOrderTechnicians.estimatedArrivalTime) || "";
              item.remark = workOrderTechnicians.arrivalNotifiedRemark || "";
              break;
            case "DEPARTED":
              item.time = formatDateTime(workOrderTechnicians.departureTime) || "";
              item.remark = workOrderTechnicians.departedRemark || "";
              break;
            case "ARRIVED":
              item.time = formatDateTime(workOrderTechnicians.arrivalTime) || "";
              item.remark = workOrderTechnicians.arrivedRemark || "";
              break;
            case "SELF_INSPECTED":
              item.time = formatDateTime(workOrderTechnicians.selfInspectionTime) || "";
              item.photos = workOrderTechnicians.selfInspectionPhotos || [];
              item.remark = workOrderTechnicians.selfInspectedRemark || "";
              break;
            case "EXECUTING":
              item.time = formatDateTime(workOrderTechnicians.executionStartTime) || "";
              break;
            case "COMPLETED":
              item.time = formatDateTime(workOrderTechnicians.completeTime) || "";
              break;
            default:
              // Try to find a time if possible, or leave blank
              if (item.status === "NOT_STARTED") {
                // Maybe creation time?
                item.time = formatDateTime(res.data.createdAt);
              }
              break;
          }
        });
        processing.value = processingList;
      }
    } else {
      ElMessage.error(res.msg || "获取工单详情失败");
      orderDetailData.value = null;
    }
  } catch (error) {
    ElMessage.error("获取工单详情失败");
    console.log("获取工单详情失败", error);
    orderDetailData.value = null;
  } finally {
    loading.value = false;
  }
};

// 初始化
onMounted(async () => {
  await loadCascaderConfigs();
  const orderId = route.params.id;
  if (orderId) {
    loadOrderDetail(Number(orderId));
  } else {
    ElMessage.error("工单ID不存在");
    router.back();
  }
});
</script>

<style lang="scss" scoped>
.order-detail-container {
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  margin-bottom: 24px;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgb(0 0 0 / 8%);
  .header-left {
    display: flex;
    gap: 20px;
    align-items: center;
  }
  .page-title {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: #1a1a1a;
    letter-spacing: -0.5px;
  }
  .header-right {
    display: flex;
    align-items: center;
  }
}
.detail-content {
  min-height: 400px;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
}
.detail-container {
  padding: 0;
}
.detail-wrap .detail-grid.vertical-layout {
  display: flex;
  flex-direction: column;
}
.detail-item.flex-grow {
  flex: 1;
  align-items: flex-start;
}
.detail-section {
  padding: 24px;
  margin-bottom: 24px;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 4%);
  animation: fade-in-up 0.6s ease-out;
  .detail-wrap {
    display: flex;
    justify-content: space-between;
  }
  .section-title {
    position: relative;
    padding: 0 0 16px;
    margin-bottom: 20px;
    font-size: 18px;
    font-weight: 600;
    color: #333333;
    border-bottom: 2px solid #f0f0f0;
    &::before {
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 40px;
      height: 2px;
      content: "";
      background: linear-gradient(90deg, #409eff, #67c23a);
      border-radius: 1px;
    }
  }
  .images-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 8px;
  }
  .image-wrap {
    width: 120px;
    height: 120px;
    overflow: hidden;
    background: #fafafa;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgb(0 0 0 / 6%);
  }
}
.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

/* 现代化细节优化 */
.detail-item {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 40px;
  padding: 12px 16px;
  overflow: hidden;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  animation: fade-in-up 0.4s ease-out;
  animation-fill-mode: both;
  &::before {
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    content: "";
    background: linear-gradient(180deg, #409eff, #67c23a);
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  &.full-width {
    grid-column: 1 / -1;
  }
  &:hover {
    border-color: #e6f7ff;
    box-shadow: 0 2px 8px rgb(64 158 255 / 10%);
    transform: translateY(-1px);
    &::before {
      opacity: 1;
    }
  }
  .detail-label {
    position: relative;
    flex-shrink: 0;
    width: 120px;
    margin-right: 16px;
    font-size: 14px;
    font-weight: 500;
    color: #666666;
    &::after {
      margin-left: 2px;
      content: ":";
    }
  }
  .detail-value {
    display: flex;
    flex: 1;
    align-items: center;
    min-height: 20px;
    font-size: 14px;
    font-weight: 400;
    color: #333333;
    word-break: break-all;
  }
}
.template-details {
  padding: 20px;
  margin-top: 20px;
  background: #fafbfc;
  border: 1px solid #e8eaed;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 4%);
  .template-section-title {
    margin-bottom: 16px;
    font-size: 15px;
    font-weight: 600;
    color: #333333;
  }
}
.template-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.template-item {
  padding: 12px;
  background: #f8f9fa;
  border-left: 3px solid #409eff;
  border-radius: 4px;
  .inspection-name {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #333333;
  }
  .operation-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
    .operation-label {
      font-size: 13px;
      color: #666666;
    }
    .operation-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .operation-tag {
      font-size: 12px;
    }
    .no-data {
      font-style: italic;
      color: #999999;
    }
  }
}
.custom-description {
  padding: 20px;
  margin-top: 20px;
  background: #fafbfc;
  border: 1px solid #e8eaed;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 4%);
  .custom-section-title {
    margin-bottom: 16px;
    font-size: 15px;
    font-weight: 600;
    color: #333333;
  }
  .custom-content {
    padding: 16px;
    font-size: 14px;
    line-height: 1.7;
    color: #333333;
    white-space: pre-wrap;
    background: white;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
  }
}
.requirement-tag {
  padding: 4px 12px;
  margin-right: 8px;
  margin-bottom: 6px;
  font-size: 12px;
  border-radius: 16px;
}
.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}
.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.image-grid :deep(.el-image) {
  width: 88px;
  height: 88px;
  overflow: hidden;
  border-radius: 6px;
}
.video-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.video-thumb {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 160px;
  height: 90px;
  color: #606266;
  cursor: pointer;
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  transition: all 0.2s ease;
}
.video-thumb:hover {
  color: #409eff;
  border-color: #c0c4cc;
}
.play-icon {
  font-size: 18px;
  line-height: 1;
}

/* 加载动画 */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (width <= 768px) {
  .order-detail-container {
    padding: 16px;
  }
  .page-header {
    padding: 20px;
    .page-title {
      font-size: 20px;
    }
  }
  .detail-section {
    padding: 20px;
    .section-title {
      font-size: 16px;
    }
  }
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .detail-item {
    .detail-label {
      width: 100px;
      font-size: 13px;
    }
    .detail-value {
      font-size: 13px;
    }
  }
}

@media (width <= 480px) {
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    .detail-label {
      width: 100%;
      margin-right: 0;
      margin-bottom: 8px;
    }
  }
}
.detail-wrap .detail-grid {
  flex: 1;
}
.detail-status {
  flex-shrink: 0;
  width: 300px;
  margin-left: 40px;
}
.timeline {
  display: flex;
  flex-direction: column;
}
.timeline-item {
  display: flex;
  min-height: 100px;
}
.timeline-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 16px;
}
.timeline-icon {
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
  .el-icon {
    font-size: 20px;
  }
}
.timeline-line {
  flex: 1;
  width: 2px;
  margin-top: 4px;
  background-color: #e4e7ed;
}
.timeline-content {
  padding-bottom: 24px;
}
.timeline-title {
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.timeline-time {
  margin-bottom: 8px;
  font-size: 13px;
  color: #909399;
  &.is-bold {
    font-size: 14px;
    font-weight: 600;
    color: #333333;
  }
}
.timeline-remark {
  font-size: 14px;
  line-height: 1.4;
  color: #606266;
}
.timeline-photos {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  .el-image {
    width: 60px;
    height: 60px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
  }
}
</style>
