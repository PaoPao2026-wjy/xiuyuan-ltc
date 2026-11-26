<template>
  <div class="create-order-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
        <h1 class="page-title">{{ getPageTitle() }}</h1>
      </div>
    </div>

    <!-- 工单表单 -->
    <div class="form-container">
      <el-form ref="orderFormRef" :model="orderForm" :rules="orderRules" label-width="120px" class="order-form">
        <!-- 1. 基本信息 -->
        <div class="form-section">
          <div class="section-title">基本信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="工单标题" prop="title">
                <el-input v-model="orderForm.title" placeholder="请输入工单标题" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="工单类型" prop="type">
                <el-select v-model="orderForm.type" placeholder="请选择工单类型" style="width: 100%">
                  <el-option label="巡检" value="INSPECTION" />
                  <el-option label="保养" value="MAINTENANCE" />
                  <el-option label="维修" value="REPAIR" />
                  <el-option label="电试" value="ELECTRICAL_TEST" />
                  <el-option label="改造" value="TRANSFORMATION" />
                  <el-option label="抢修" value="EMERGENCY_REPAIR" />
                  <el-option label="日常采购" value="DAILY_PURCHASE" />
                  <el-option label="技术指导" value="TECHNICAL_GUIDANCE" />
                  <el-option label="其他" value="OTHER" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="预计工期(小时)" prop="estimatedHours">
                <el-input-number v-model="orderForm.estimatedHours" :min="1" :max="999" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="优先级" prop="priority">
                <el-select v-model="orderForm.priority" placeholder="请选择优先级" style="width: 100%">
                  <el-option label="紧急" value="URGENT" />
                  <el-option label="普通" value="NORMAL" />
                  <el-option label="较低" value="LOW" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 2. 客户信息 -->
        <div class="form-section">
          <div class="section-title">客户信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="客户单位" prop="enterpriseId">
                <el-select
                  v-model="orderForm.enterpriseId"
                  placeholder="请选择客户单位"
                  style="width: 100%"
                  filterable
                  remote
                  :remote-method="searchCompanies"
                  :loading="companyLoading"
                  @change="handleCompanySelect"
                >
                  <el-option
                    v-for="company in companyOptions"
                    :key="company.id"
                    :label="company.enterpriseName"
                    :value="company.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系人姓名" prop="contactName">
                <el-input v-model="orderForm.contactName" placeholder="请输入联系人姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话" prop="contactPhone">
                <el-input v-model="orderForm.contactPhone" placeholder="请输入联系电话" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="工作地点" prop="workAddress">
            <el-input v-model="orderForm.workAddress" placeholder="请输入工作地点" />
          </el-form-item>
        </div>

        <!-- 3. 工单详情 -->
        <div class="form-section">
          <div class="section-title">工单详情</div>
          <el-form-item label="问题描述" prop="descriptionType">
            <el-select
              v-model="orderForm.descriptionType"
              placeholder="请选择描述类型"
              style="width: 200px"
              @change="onDescriptionTypeChange"
            >
              <el-option label="工单模板" value="template" />
              <el-option label="配置项选择" value="config" />
              <el-option label="自定义描述" value="custom" />
            </el-select>
          </el-form-item>

          <!-- 模板选择 -->
          <el-form-item v-if="orderForm.descriptionType === 'template'" label="选择模板">
            <el-select
              v-model="selectedTemplateId"
              placeholder="请选择工单模板"
              style="width: 100%"
              @change="onTemplateSelectChange"
            >
              <el-option v-for="tpl in templatesList" :key="tpl.id" :label="tpl.templateName" :value="tpl.id" />
            </el-select>
          </el-form-item>

          <el-form-item v-if="orderForm.descriptionType === 'config'" label="选择配置项">
            <el-select
              v-model="selectedConfigIds"
              multiple
              filterable
              clearable
              :collapse-tags="true"
              collapse-tags-tooltip
              placeholder="请选择配置项"
              @change="onConfigSelectionChange"
            >
              <el-option v-for="cfg in cascaderConfigs" :key="cfg.id" :label="cfg.name" :value="Number(cfg.id)" />
            </el-select>
          </el-form-item>

          <div v-if="orderForm.descriptionType === 'template' || orderForm.descriptionType === 'config'">
            <ConfigItemCard
              v-for="cfg in configList"
              :key="cfg.id"
              :cfg="cfg"
              :selected-items="selectedItems"
              :is-operation-checked="isOperationChecked"
              :set-operation-checked="setOperationChecked"
              @toggle-item="onToggleItem"
              @select-all="onSelectAll"
            />
          </div>

          <!-- 自定义描述 -->
          <el-form-item label="工单描述" prop="customDescription">
            <el-input v-model="orderForm.customDescription" type="textarea" :rows="4" placeholder="请输入自定义工单描述" />
          </el-form-item>

          <el-form-item label="具体要求" prop="specificRequirements">
            <el-input v-model="orderForm.specificRequirements" type="textarea" :rows="3" placeholder="请输入具体要求" />
          </el-form-item>

          <el-form-item label="相关图片">
            <UploadImgs v-model:file-list="imageFiles" :limit="9">
              <template #tip>最多上传9张，支持 jpg/png/gif</template>
            </UploadImgs>
          </el-form-item>
        </div>

        <!-- 4. 任务分配 -->
        <div class="form-section">
          <div class="section-title">任务分配</div>
          <el-form-item label="计划时间" prop="plannedTime">
            <el-date-picker
              v-model="plannedTimeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DDTHH:mm:ss.sssZ"
              style="width: 100%"
              @change="onPlannedTimeChange"
            />
          </el-form-item>

          <el-form-item label="特殊要求" prop="specialRequirements">
            <el-checkbox-group v-model="orderForm.specialRequirements">
              <el-checkbox label="需要高压作业证">需要高压作业证</el-checkbox>
              <el-checkbox label="需要专业工具">需要专业工具</el-checkbox>
              <el-checkbox label="需要安全监护">需要安全监护</el-checkbox>
              <el-checkbox label="需要停电作业">需要停电作业</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="备注信息" prop="remarks">
            <el-input v-model="orderForm.remarks" type="textarea" :rows="3" placeholder="请输入备注信息" />
          </el-form-item>
        </div>
      </el-form>
    </div>

    <!-- 底部操作按钮 -->
    <div class="form-footer">
      <el-button @click="goBack" size="large">取消</el-button>
      <el-button v-if="!isDraftMode && !isEdit" type="info" @click="saveOrderDraft" :loading="savingDraft" size="large">
        保存草稿
      </el-button>
      <el-button type="primary" @click="submitOrder" :loading="submitting" size="large">
        {{ getSubmitButtonText() }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts" name="create-order">
import { ref, reactive, onMounted, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ArrowLeft } from "@element-plus/icons-vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import {
  createOrderApi,
  updateOrderApi,
  createOrderDraftApi,
  updateOrderDraftApi,
  queryOrderDetailApi,
  queryOrderDraftDetailApi,
  queryTempCascaderApi,
  queryTemplateListApi,
  queryTemplateDetailApi
} from "@/api/modules/order";
import { queryCompanyListApi } from "@/api/modules/company";
import { Order, Company } from "@/api/interface";
import ConfigItemCard from "@/components/ConfigItemCard/index.vue";
import UploadImgs from "@/components/Upload/Imgs.vue";
import type { UploadUserFile } from "element-plus";
import { useTabsStore } from "@/stores/modules/tabs";
const tabStore = useTabsStore();

const router = useRouter();
const route = useRoute();

// 是否为编辑模式
const isEdit = computed(() => !!route.params.id);
// 是否为草稿模式
const isDraftMode = computed(() => route.query.mode === "draft");
const currentOrderId = ref<number | null>(null);

const templatesList = ref<Order.ResTemplate[]>([]);
const selectedTemplateId = ref<number | null>(null);
const cascaderConfigs = ref<Order.ResTempDetail[]>([]);
const configList = ref<Order.ResTempDetail[]>([]);
const selectedConfigIds = ref<number[]>([]);

const selectedItems = reactive<Record<number, boolean>>({});
const selectedOps = reactive<Record<number, Record<number, boolean>>>({});
const imageFiles = ref<UploadUserFile[]>([]);
watch(imageFiles, list => {
  orderForm.images = list.filter(f => !!f.url).map(f => f.url!);
});

// 表单引用
const orderFormRef = ref<FormInstance>();
const submitting = ref(false);
const savingDraft = ref(false);

// 表单数据
const orderForm = reactive<Order.ReqCreateOrder>({
  title: "",
  type: "",
  estimatedHours: 1,
  priority: "",
  enterpriseId: "",
  contactPhone: "",
  contactName: "",
  workAddress: "",
  descriptionType: "template",
  customDescription: "",
  selectedTemplateItems: {
    tempList: []
  },
  specificRequirements: "",
  plannedStartTime: "",
  plannedEndTime: "",
  specialRequirements: [],
  remarks: "",
  images: []
});

// 表单验证规则
const orderRules: FormRules = {
  title: [{ required: true, message: "请输入工单标题", trigger: "blur" }],
  type: [{ required: true, message: "请选择工单类型", trigger: "change" }],
  estimatedHours: [{ required: true, message: "请输入预计工期", trigger: "blur" }],
  priority: [{ required: true, message: "请选择优先级", trigger: "change" }],
  enterpriseId: [{ required: true, message: "请选择客户单位", trigger: "change" }],
  contactPhone: [
    { required: true, message: "请输入联系电话", trigger: "blur" },
    { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号码", trigger: "blur" }
  ],
  contactName: [{ required: true, message: "请输入联系人姓名", trigger: "blur" }],
  workAddress: [{ required: true, message: "请输入工作地点", trigger: "blur" }],
  descriptionType: [{ required: true, message: "请选择描述类型", trigger: "change" }],
  customDescription: [
    {
      validator: (rule, value, callback) => {
        if (orderForm.descriptionType === "custom" && !value) {
          callback(new Error("请输入自定义描述"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  selectedTemplateItems: [
    {
      validator: (rule, value, callback) => {
        if (orderForm.descriptionType === "template" || orderForm.descriptionType === "config") {
          // 仅统计当前展示的配置项中的勾选数量
          const displayedItemIds = configList.value.flatMap(cfg => (cfg.items || []).map(item => item.id));
          const selectedCount = displayedItemIds.filter(id => selectedItems[id]).length;
          if (selectedCount === 0) return callback(new Error("请至少选择一个配置项"));
        }
        callback();
      },
      trigger: "change"
    }
  ]
};

// 企业相关
const companyOptions = ref<Company.ResCompany[]>([]);
const companyLoading = ref(false);

const selectedTemplateValues = ref<any[]>([]);
const plannedTimeRange = ref<string[]>([]);

const onConfigSelectionChange = (ids: number[] = []) => {
  const idSet = new Set(ids.map(n => Number(n)));
  configList.value = cascaderConfigs.value.filter(cfg => idSet.has(Number(cfg.id)));
};
// 加载所有配置项（含检查项与操作项）
const loadCascaderConfigs = async () => {
  const res = await queryTempCascaderApi({ keyword: "" });
  cascaderConfigs.value = res.data || [];

  // 初始化勾选状态
  cascaderConfigs.value.forEach(cfg => {
    cfg.items.forEach(item => {
      if (selectedItems[item.id] === undefined) selectedItems[item.id] = false;
      if (!selectedOps[item.id]) selectedOps[item.id] = {};
      Array.isArray(cfg.operations) &&
        cfg.operations.forEach(op => {
          if (selectedOps[item.id][op.id] === undefined) selectedOps[item.id][op.id] = false;
        });
    });
  });
};

// 加载模板列表
const loadTemplatesList = async () => {
  const res = await queryTemplateListApi();
  templatesList.value = res.data || [];
};

// 勾选操作项
const isOperationChecked = (itemId: number, opId: number) => !!selectedOps[itemId]?.[opId];
const setOperationChecked = (itemId: number, opId: number, checked: boolean) => {
  if (!selectedOps[itemId]) selectedOps[itemId] = {};
  selectedOps[itemId][opId] = !!checked;
};

// 勾选检查项
const onToggleItem = (itemId: number, checked: boolean) => {
  selectedItems[itemId] = checked;
};

// 配置组全选
const onSelectAll = (cfg: Order.ResTempDetail, checked: boolean) => {
  (cfg.items || []).forEach(item => {
    selectedItems[item.id] = checked;
    const opMap = selectedOps[item.id] || (selectedOps[item.id] = {});
    (cfg.operations || []).forEach(op => {
      opMap[op.id] = checked;
    });
  });
};

// 根据当前选择提交的模板数据结构）
const buildSelectedTemplateItems = (): Order.templateData => {
  const tempList: {
    id: string;
    name: string;
    items: {
      id: string;
      name: string;
      operationItems: Order.operationItems[];
    }[];
  }[] = [];

  configList.value.forEach(cfg => {
    const items: {
      id: string;
      name: string;
      operationItems: Order.operationItems[];
    }[] = [];

    (cfg.items || []).forEach(item => {
      if (selectedItems[item.id]) {
        const opCheckedMap = selectedOps[item.id] || {};
        const ops: Order.operationItems[] = (cfg.operations || [])
          .filter(op => !!opCheckedMap[op.id])
          .map((op, idx) => ({
            id: String(op.id),
            name: op.name,
            sort: idx,
            type: op.type,
            options: op.options || [],
            required: false,
            bindInspectionId: String(item.id)
          }));
        items.push({
          id: String(item.id),
          name: item.name,
          operationItems: ops
        });
      }
    });

    if (items.length) {
      tempList.push({
        id: String(cfg.id),
        name: cfg.name,
        items
      });
    }
  });

  return { templateId: selectedTemplateId.value ?? undefined, tempList };
};

// 描述类型变化处理
const onDescriptionTypeChange = async (value: string) => {
  if (value === "template") {
    orderForm.customDescription = "";
    if (!cascaderConfigs.value.length) await loadCascaderConfigs();
    await loadTemplatesList();
    configList.value = [];
    selectedTemplateId.value = null;
    // 重置选择状态
    Object.keys(selectedItems).forEach(k => (selectedItems[Number(k)] = false));
    Object.keys(selectedOps).forEach(k => {
      const map = selectedOps[Number(k)];
      Object.keys(map).forEach(opId => (map[Number(opId)] = false));
    });
  } else if (value === "config") {
    orderForm.customDescription = "";
    if (!cascaderConfigs.value.length) await loadCascaderConfigs();
    selectedConfigIds.value = [];
    configList.value = [];
    // 重置选择状态
    Object.keys(selectedItems).forEach(k => (selectedItems[Number(k)] = false));
    Object.keys(selectedOps).forEach(k => {
      const map = selectedOps[Number(k)];
      Object.keys(map).forEach(opId => (map[Number(opId)] = false));
    });
  } else {
    // custom
    configList.value = [];
    selectedTemplateId.value = null;
  }
};
// 模板选择变化：只展示模板 tempList 中的配置项并回填勾选
const onTemplateSelectChange = async (id: number) => {
  selectedTemplateId.value = id;

  orderForm.selectedTemplateItems.templateId = id;
  // 重置当前选择
  Object.keys(selectedItems).forEach(k => (selectedItems[Number(k)] = false));
  Object.keys(selectedOps).forEach(k => {
    const map = selectedOps[Number(k)];
    Object.keys(map).forEach(opId => (map[Number(opId)] = false));
  });

  const res = await queryTemplateDetailApi(id);
  const tempList = res?.data?.templateData?.tempList || [];

  // 仅保留模板中已有的配置项，并根据 operationItems 做回填
  const groups = cascaderConfigs.value
    .filter(cfg => tempList.some(t => String(t.id) === String(cfg.id)))
    .map(cfg => {
      const tGroup = tempList.find(t => String(t.id) === String(cfg.id)) || { items: [] };
      const allowedItemIds = new Set((tGroup.items || []).map((i: any) => String(i.id)));
      const itemsFiltered = (cfg.items || []).filter(item => allowedItemIds.has(String(item.id)));

      // 回填勾选状态（检查项 + 操作项）
      itemsFiltered.forEach(item => {
        selectedItems[item.id] = true;
        const opCheckedMap = selectedOps[item.id] || (selectedOps[item.id] = {});
        const tItem = (tGroup.items || []).find((x: any) => String(x.id) === String(item.id));
        (tItem?.operationItems || []).forEach((op: any) => {
          opCheckedMap[Number(op.id)] = true;
        });
      });

      // 返回过滤后的组（沿用原 operations 列定义）
      return { ...cfg, items: itemsFiltered };
    });

  configList.value = groups;
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 获取页面标题
const getPageTitle = () => {
  if (isEdit.value) {
    return isDraftMode.value ? "编辑草稿" : "编辑工单";
  } else {
    return isDraftMode.value ? "新增草稿" : "创建工单";
  }
};

// 获取提交按钮文本
const getSubmitButtonText = () => {
  if (isDraftMode.value) {
    return isEdit.value ? "更新草稿" : "保存草稿";
  } else {
    return isEdit.value ? "更新工单" : "发布工单";
  }
};

// 搜索企业
const searchCompanies = async (query: string) => {
  companyLoading.value = true;
  try {
    const res = await queryCompanyListApi({ page: 1, pageSize: 20, keyword: query });
    if (res.code === 200) {
      companyOptions.value = res.data.list || [];
    }
  } catch (error) {
    console.error("搜索企业失败:", error);
  } finally {
    companyLoading.value = false;
  }
};

// 企业选择处理
const handleCompanySelect = (id: string) => {
  const company = companyOptions.value.find(c => c.id === id);
  orderForm.contactName = company?.contactName || "";
  orderForm.contactPhone = company?.contactPhone || "";
  orderForm.workAddress = company?.enterpriseAddress || "";
};

// 计划时间变化处理
const onPlannedTimeChange = (value: string[]) => {
  if (value && value.length === 2) {
    orderForm.plannedStartTime = value[0];
    orderForm.plannedEndTime = value[1];
  } else {
    orderForm.plannedStartTime = "";
    orderForm.plannedEndTime = "";
  }
};

// 重置表单
const resetOrderForm = () => {
  orderForm.title = "";
  orderForm.type = "";
  orderForm.estimatedHours = 1;
  orderForm.priority = "";
  orderForm.enterpriseId = "";
  orderForm.contactPhone = "";
  orderForm.workAddress = "";
  orderForm.descriptionType = "template";
  orderForm.customDescription = "";
  orderForm.selectedTemplateItems = {
    tempList: []
  };
  orderForm.specificRequirements = "";
  orderForm.plannedStartTime = "";
  orderForm.plannedEndTime = "";
  orderForm.specialRequirements = [];
  orderForm.remarks = "";

  selectedTemplateValues.value = [];
  plannedTimeRange.value = [];
  companyOptions.value = [];

  orderForm.images = [];
  imageFiles.value = [];

  orderFormRef.value?.clearValidate();
};

// 保存草稿
const saveOrderDraft = async () => {
  if (!orderFormRef.value) return;

  savingDraft.value = true;
  try {
    const payload = { ...orderForm };
    payload.images = imageFiles.value.map(f => f.url!).filter(Boolean);
    if (payload.descriptionType === "config" || payload.descriptionType === "template") {
      payload.descriptionType = "template";
      payload.selectedTemplateItems = buildSelectedTemplateItems();
      payload.customDescription = "";
    }

    const res = await createOrderDraftApi(payload);
    if (res.code === 200) {
      ElMessage.success("草稿保存成功");
      // 跳转到草稿管理页面，添加刷新参数
      // router.push("/order/draft?refresh=" + Date.now());
      router.back();
      const currentTabPath = route.fullPath;
      tabStore.removeTabs(currentTabPath, false);
    } else {
      ElMessage.error(res.msg || "保存草稿失败");
    }
  } catch (error) {
    ElMessage.error("保存草稿失败");
  } finally {
    savingDraft.value = false;
  }
};

// 提交工单
const submitOrder = async () => {
  if (!orderFormRef.value) return;

  const valid = await orderFormRef.value.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  const currentTabPath = route.fullPath;
  try {
    const payload = { ...orderForm };
    payload.images = imageFiles.value.map(f => f.url!).filter(Boolean);
    if (payload.descriptionType === "config" || payload.descriptionType === "template") {
      payload.descriptionType = "template";
      payload.selectedTemplateItems = buildSelectedTemplateItems();
      payload.customDescription = "";
    }
    if (isDraftMode.value) {
      if (isEdit.value && currentOrderId.value) {
        await updateOrderDraftApi(currentOrderId.value, payload);
        ElMessage.success("草稿更新成功");
      } else {
        await createOrderDraftApi(payload);
        ElMessage.success("草稿保存成功");
      }
      // 跳转到草稿管理页面，添加刷新参数
      // router.push("/order/draft?refresh=" + Date.now());
      router.back();
      tabStore.removeTabs(currentTabPath, false);
    } else {
      if (isEdit.value && currentOrderId.value) {
        await updateOrderApi(currentOrderId.value, payload);
        ElMessage.success("工单更新成功");
      } else {
        await createOrderApi(payload);
        ElMessage.success("工单创建成功");
      }
      // 跳转到工单管理页面，添加刷新参数
      // router.push("/order/workOrder?refresh=" + Date.now());
      router.back();
      tabStore.removeTabs(currentTabPath, false);
    }
  } catch (error) {
    const errorMsg = isDraftMode.value
      ? isEdit.value
        ? "更新草稿失败"
        : "保存草稿失败"
      : isEdit.value
        ? "更新工单失败"
        : "创建工单失败";
    ElMessage.error(errorMsg);
  } finally {
    submitting.value = false;
  }
};

// 加载工单详情（编辑模式）
const loadOrderDetail = async (id: number) => {
  try {
    let res;
    if (isDraftMode.value) {
      // 草稿模式：调用草稿详情API
      res = await queryOrderDraftDetailApi(id);
    } else {
      // 工单模式：调用工单详情API
      res = await queryOrderDetailApi(id);
    }

    if (res.code === 200) {
      const orderData = res.data || {};

      // 字段映射处理
      const mappedData = {
        ...orderData,
        // 确保企业ID字段正确
        enterpriseId: orderData.enterpriseId || orderData.companyId || "",
        // 处理联系人信息
        contactPhone: orderData.contactPhone || "",
        workAddress: orderData.workAddress || orderData.contactAddress || "",
        // 处理描述类型
        descriptionType: orderData.descriptionType || "template",
        customDescription: orderData.customDescription || orderData.description || "",
        // 处理模板相关
        templateId: orderData.templateId || null,
        selectedTemplateItems: orderData.selectedTemplateItems || { tempList: [] }
      };

      Object.assign(orderForm, mappedData);
      imageFiles.value = Array.isArray(orderData.images)
        ? orderData.images.map((url: string, idx: number) => ({ name: `图片${idx + 1}`, url }))
        : [];
      // 处理计划时间数据
      if (orderData.plannedStartTime && orderData.plannedEndTime) {
        plannedTimeRange.value = [orderData.plannedStartTime, orderData.plannedEndTime];
      }

      // 清空选择状态
      Object.keys(selectedItems).forEach(k => (selectedItems[Number(k)] = false));
      Object.keys(selectedOps).forEach(k => {
        const map = selectedOps[Number(k)];
        Object.keys(map).forEach(opId => (map[Number(opId)] = false));
      });

      // 根据描述类型与 templateId / tempList 回显
      if (orderForm.descriptionType === "template") {
        const st = orderForm.selectedTemplateItems || { tempList: [] };

        if (st.templateId) {
          // 工单模板模式：先按模板过滤展示，再用 tempList 覆盖勾选状态
          selectedTemplateId.value = st.templateId;
          await onTemplateSelectChange(st.templateId);
          // 清空默认勾选
          Object.keys(selectedItems).forEach(k => (selectedItems[Number(k)] = false));
          Object.keys(selectedOps).forEach(k => {
            const map = selectedOps[Number(k)];
            Object.keys(map).forEach(opId => (map[Number(opId)] = false));
          });
          // 使用订单的 tempList 回填
          st.tempList.forEach(group => {
            (group.items || []).forEach(item => {
              const itemId = Number(item.id);
              selectedItems[itemId] = true;
              const opCheckedMap = selectedOps[itemId] || (selectedOps[itemId] = {});
              (item.operationItems || []).forEach(op => {
                opCheckedMap[Number(op.id)] = true;
              });
            });
          });
        } else {
          // 配置项选择模式：根据 tempList 回显选择框并仅展示所选配置项
          const groupIds = st.tempList.map((group: any) => Number(group.id));
          selectedConfigIds.value = groupIds;
          onConfigSelectionChange(groupIds);

          st.tempList.forEach(group => {
            (group.items || []).forEach(item => {
              const itemId = Number(item.id);
              selectedItems[itemId] = true;
              const opCheckedMap = selectedOps[itemId] || (selectedOps[itemId] = {});
              (item.operationItems || []).forEach(op => {
                opCheckedMap[Number(op.id)] = true;
              });
            });
          });
        }
      } else {
        // 自定义描述：不展示配置项
        configList.value = [];
        selectedTemplateId.value = null;
      }
    }
  } catch (error) {
    const errorMsg = isDraftMode.value ? "获取草稿详情失败" : "获取工单详情失败";
    ElMessage.error(errorMsg);
    console.error("加载详情失败:", error);
  }
};

// 初始化
onMounted(async () => {
  await loadCascaderConfigs();
  await loadTemplatesList();
  searchCompanies("");

  if (isEdit.value && route.params.id) {
    currentOrderId.value = Number(route.params.id);
    await loadOrderDetail(currentOrderId.value);
  } else {
    resetOrderForm();
  }
});
</script>

<style lang="scss" scoped>
.create-order-container {
  min-height: 100vh;
  padding: 20px;
  background: #f5f7fa;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  margin-bottom: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
  .header-left {
    display: flex;
    gap: 16px;
    align-items: center;
  }
  .page-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #333333;
  }
}
.form-container {
  margin-bottom: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
}
.order-form {
  padding: 24px;
}
.form-section {
  padding: 16px;
  margin-bottom: 24px;
  background: #f8f9fa;
  border-left: 4px solid #409eff;
  border-radius: 6px;
  .section-title {
    padding-left: 8px;
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 600;
    color: #333333;
  }
}
.form-footer {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
}

/* 级联选择器样式调整 */
:deep(.el-cascader) {
  width: 100%;
}

/* 复选框组样式 */
:deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
:deep(.el-checkbox) {
  margin-right: 0;
}
</style>
