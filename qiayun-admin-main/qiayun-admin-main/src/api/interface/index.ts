// 请求响应参数（不包含data）
export interface Result {
  code: number;
  msg: string;
  message: string;
}

// 请求响应参数（包含data）
export interface ResultData<T = any> extends Result {
  data: T;
}

// 分页响应参数
export interface ResPage<T> {
  list: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

// 分页请求参数
export interface ReqPage {
  page: number;
  pageSize: number;
}

// 文件上传模块
export namespace Upload {
  export interface ResFileUrl {
    fileUrl: string;
  }
}

// 登录模块
export namespace Login {
  export interface ReqLoginForm {
    username: string;
    password: string;
  }
  export interface ResLogin {
    access_token: string;
    user: {
      adminId: number;
      realName: string;
      role: string;
      username: string;
    };
  }
  export interface ResAuthButtons {
    [key: string]: string[];
  }
}

// 用户管理模块
export namespace User {
  export interface ReqUserParams extends ReqPage {
    username: string;
    gender: number;
    idCard: string;
    email: string;
    address: string;
    createTime: string[];
    status: number;
  }
  export interface ResUserList {
    id: string;
    username: string;
    gender: number;
    user: { detail: { age: number } };
    idCard: string;
    email: string;
    address: string;
    createTime: string;
    status: number;
    avatar: string;
    photo: any[];
    children?: ResUserList[];
  }
  export interface ResStatus {
    userLabel: string;
    userValue: number;
  }
  export interface ResGender {
    genderLabel: string;
    genderValue: number;
  }
  export interface ResDepartment {
    id: string;
    name: string;
    children?: ResDepartment[];
  }
  export interface ResRole {
    id: string;
    name: string;
    children?: ResDepartment[];
  }
}

export namespace Company {
  export interface ReqCompanyParams extends ReqPage {
    keyword?: string;
    enterpriseType?: string;
  }
  export interface ResCompanyList {
    list: ResCompany[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
    };
  }
  export interface ResCompany {
    id: string;
    enterpriseName: string;
    enterpriseType: string;
    socialCreditCode: string; // 必填：统一社会信用代码
    businessLicensePhoto: string; // 必填：营业执照照片
    enterpriseAddress: string;
    contactPhone: string;
    contactName: string;
    createdAt: string;
    enterpriseEmail: string;
    contactPosition: string;
    contactMobile: string;
    contactEmail: string;
    contactName2?: string; // 第二联系人姓名
    contactMobile2?: string; // 第二联系人手机号
    contactName3?: string; // 第三联系人姓名
    contactMobile3?: string; // 第三联系人手机号
    enterpriseUserNo1?: string;
    enterpriseUserNo2?: string;
    enterpriseMeterNo1?: string;
    enterpriseMeterNo2?: string;
    transformerCapacity1: number;
    transformerCapacity2: number;
    usageCapacity1: number;
    usageCapacity2: number;
    powerSupplyMode?: string;
    powerSupplyMaintenanceType?: string;
    highVoltageCabinetCount: number;
    lowVoltageCabinetCount: number;
    transformerCount: number;
    capacitorCabinetCount: number;
    dcScreen?: string;
    operationMaintenanceUnit?: string;
    electricalTestDate?: string;
    analogScreen?: string;
    safetyEquipment?: string;
    fireFightingEquipment?: string;
    ventilationEquipment?: string;
    airConditioner?: string;
    highResistanceScreen?: string;
  }
  export interface ReqCreateCompanyParams {
    enterpriseName: string; // 必填：企业名称
    enterpriseType: string; // 必填：企业类型
    socialCreditCode: string; // 必填：统一社会信用代码
    businessLicensePhoto: string; // 必填：营业执照照片
    enterpriseAddress: string; // 必填：企业地址
    contactPhone: string; // 必填：联系电话
    contactName: string; // 必填：联系人姓名
    enterpriseEmail?: string; // 企业邮箱
    contactPosition: string; // 必填：联系人职务
    contactMobile: string; // 必填：联系人手机号
    contactEmail?: string; // 联系人邮箱
    contactName2?: string; // 第二联系人姓名
    contactMobile2?: string; // 第二联系人手机号
    contactName3?: string; // 第三联系人姓名
    contactMobile3?: string; // 第三联系人手机号
    enterpriseUserNo1?: string; // 户号1
    enterpriseUserNo2?: string; // 户号2
    enterpriseMeterNo1?: string; // 表号1
    enterpriseMeterNo2?: string; // 表号2
    transformerCapacity1?: number; // 变压器容量1（kVA）
    transformerCapacity2?: number; // 变压器容量2（kVA）
    usageCapacity1?: number; // 使用容量1（kVA）
    usageCapacity2?: number; // 使用容量2（kVA）
    powerSupplyMode?: string; // 进线方式
    powerSupplyMaintenanceType?: string; // 进线修程
    highVoltageCabinetCount?: number; // 高压柜数量
    lowVoltageCabinetCount?: number; // 低压柜数量
    transformerCount?: number; // 变压器数量
    capacitorCabinetCount?: number; // 电容柜数量
    dcScreen?: string; // 直流屏信息
    operationMaintenanceUnit?: string;
    electricalTestDate?: string;
    analogScreen?: string;
    safetyEquipment?: string;
    fireFightingEquipment?: string;
    ventilationEquipment?: string;
    airConditioner?: string;
    highResistanceScreen?: string;
  }
  export interface ReqUpdateCompanyParams extends ReqCreateCompanyParams {
    id: string;
  }
  export interface ResCreateCompany {
    id: string;
  }
}

export namespace System {
  export interface ReqSystemUserParams extends ReqPage {}

  export interface ResSystemUserList {
    list: ResUserList[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
    };
  }

  export interface ResUserList {
    adminId: number;
    username: string;
    realName: string;
    phone: string;
    email: string;
    role: string;
    avatar: string;
    status: string;
    lastLoginAt: string;
    createdAt: string;
  }

  export interface ReqSystemUserForm {
    username: string;
    realName: string;
    phone: string;
    email: string;
    role: string;
    password: string;
  }

  export interface ReqUpdateSystemUserForm extends ReqSystemUserForm {
    id: number;
  }
}

export namespace Order {
  export interface ReqOrderParams extends ReqPage {
    type?: string; // 工单类型 REPAIR 维修、MAINTENANCE 维保、INSPECTION 巡检
    status?: string; // 工单状态 DRAFT 草稿 、ASSIGNED 已分配、PROCESSING 处理中、COMPLETED 已完成、CANCELLED 已取消
    priority?: string; // 优先级 URGENT 紧急、 NORMAL 普通 、LOW 较低
    startDate?: string; // 日期范围-开始时间
    endDate?: string; // 日期范围-结束时间
    keyword: string; // 搜索关键字
    orderNo?: string; // 工单编号
  }

  // 草稿箱分页查询参数
  export interface ReqDraftParams extends ReqPage {
    type?: string; // 工单类型 REPAIR 维修、MAINTENANCE 维保、INSPECTION 巡检
    priority?: string; // 优先级 URGENT 紧急、 NORMAL 普通 、LOW 较低
    startDate?: string; // 日期范围-开始时间
    endDate?: string; // 日期范围-结束时间
    keyword: string; // 搜索关键字
  }

  export interface ResOrder {
    list: ResOrderList[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
    };
  }
  export interface ResOrderList {
    id: number;
    title: string;
    type: string;
    estimatedHours: number;
    priority: string;
    enterpriseId: string;
    contactPhone: string;
    workAddress: string;
    descriptionType: string;
    customDescription: string;
    selectedTemplateItems: templateData;
    draftId: number;
    specificRequirements: string;
    plannedStartTime: string; // "2024-06-10T01:30:00.000Z"
    plannedEndTime: string; // "2024-06-10T03:30:00.000Z"
    specialRequirements: string[];
    remarks: string;
    status: string;
    createdBy: number;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    deletedAt: null;
    enterprise: {
      id: number;
      enterpriseName: string;
    };
    creator: {
      realName: string;
    };
    draft: {
      id: number;
      draftStatus: string;
    };
  }

  export interface SelectedTemplateItems {
    operationItems: [
      {
        operationType: string;
        operationItemId: number;
        operationItemName: string;
      }
    ];
    inspectionItemId: number;
    inspectionItemName: string;
  }
  export interface ResOrderStats {
    total: number; // 总工单数
    pendingReview: number; // 待审核工单数
    reviewRejected: number; // 审核拒绝工单数
    pendingAcceptance: number; // 待接单工单数
    inProgress: number; // 处理中工单数
    completed: number; // 已完成工单数
    rejected: number; // 已拒绝工单数
    cancelled: number; // 已取消工单数
  }

  // 创建工单
  export interface ReqCreateOrder {
    title: string; // 必填 工单标题（字符串，非空）
    type: string; // 必填 工单类型（故障单，可选：REPAIR/MAINTENANCE/INSPECTION）
    estimatedHours: number; // 必填 预计工时（整数，最小值1）
    priority: string; // 必填 优先级（故障级，可选：URGENT/NORMAL/LOW）
    enterpriseId: string; // 必填 关联企业ID（整数，对应企业表主键）
    contactPhone: string; // 必填 联系电话（字符串，非空，建议符合手机号格式）
    contactName: string; // 必填 联系人姓名（字符串，非空）
    workAddress: string; // 必填 工作地址（字符串，非空）
    descriptionType: string; // 必填 描述类型（仅允许值：template/custom，对应"模板选择"或"自定义描述"）
    customDescription?: string; // 自定义描述（仅当descriptionType=custom时需要）
    selectedTemplateItems: templateData; // 模板选择的检查项（仅当descriptionType=template时需要）
    specificRequirements?: string; // 具体要求（字符串）
    plannedStartTime?: string; // 计划开始时间（ISO8601格式，允许为空）
    plannedEndTime?: string; // 计划完成时间（同上）
    specialRequirements?: string[]; // 特殊要求（数组，故障，故单值）
    remarks?: string; // 备注（字符串，可选）
    images?: string[]; // 工单图片（数组，可选）
  }

  // 工单详情
  export interface ResOrderDetail {
    id: number;
    title: string;
    type: string;
    estimatedHours: number;
    priority: string;
    enterpriseId: string;
    contactPhone: string;
    contactName: string; // 联系人姓名（字符串，非空）
    workAddress: string;
    descriptionType: string;
    customDescription: string;
    selectedTemplateItems: templateData;
    draftId: number;
    specificRequirements: string;
    plannedStartTime: string;
    plannedEndTime: string;
    specialRequirements: string[];
    remarks: string;
    status: string;
    createdBy: number;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    deletedAt: null;
    images?: string[]; // 工单图片
    enterprise: {
      id: number;
      enterpriseName: string;
      enterpriseAddress: string;
    };
    creator: {
      adminId: number;
      realName: string;
    };
    draft: {
      id: number;
      draftStatus: string;
      title: string;
    };
    assignments: {
      technician: ITechnician;
    }[];

    workOrderTechnicians: ResOrderProcessingInfo[];
  }

  export interface ITechnician {
    technicianId: number;
    realName: string;
    phone: string;
  }

  export interface ReqTempParams extends ReqPage {
    keyword: string;
  }

  export interface ResTempList {
    list: ResTemp[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
    };
  }

  export interface ResTemp {
    id: number;
    name: string;
    description: string;
    createdBy: number;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    deletedAt: string;
    creator: {
      realName: string;
    };
  }

  export interface ResTempDetail extends ResTemp {
    items: TempItem[];
    operations: itemOperations[];
  }

  export interface TempItem {
    id: number;
    name: string;
    templateId: number;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    deletedAt: string;
    operations: itemOperations[];
  }

  export interface itemOperations {
    id: number;
    name: string;
    type: string;
    options: string[];
    inspectionItemId: number;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    deletedAt: string;
    inspectionItem: {
      id: number;
      name: string;
    };
  }

  export interface ReqCreateTemp {
    name: string;
    description: string;
  }

  export interface ReqItemOperations {
    name: string;
    type: string; // SELECT , TEXT , BOOLEAN
    options: string[];
  }

  export interface ReqTempCascader {
    keyword: string;
  }
  // 指派工程师工单
  export interface ReqAssignEngineer {
    technicianId: string;
    remark?: string;
  }
  export interface ReqTechnicianParams extends ReqPage {
    keyword: string;
    workStatus?: string;
    status?: string;
  }

  export interface ResTechnician {
    list: ResTechnicianItem[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
    };
  }

  export interface ResTechnicianItem {
    technicianId: string;
    wechatId: number;
    realName: string;
    phone: string;
    skills: string[];
    certificates: string[];
    experienceYears: number;
    rating: number;
    totalOrders: number;
    completedOrders: number;
    workStatus: string;
    locationLat: number;
    locationLng: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    deletedAt: string;
  }

  export interface ReqTemplatesParams extends ReqPage {
    keyword: string;
  }

  export interface ResTemplatesList {
    list: ResTemplate[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
    };
  }

  export interface ResTemplate {
    id: number;
    templateName: string;
    status: string;
    createdBy: number;
    templateData: templateData;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    deletedAt: string;
    creator: {
      realName: string;
    };
  }

  export interface operationItems {
    id: string;
    name: string;
    sort: number;
    type: string;
    options: string[];
    required: boolean;
    bindInspectionId: string;
    value?: string | number | boolean;
  }
  export interface inspectionItems {
    id: string;
    name: string;
    sort: number;
    required: boolean;
  }

  export interface ReqTemplates {
    templateName: string;
    status?: string;
    templateData: templateData;
  }

  export interface templateData {
    templateId?: number;
    tempList: {
      id: string;
      name: string;
      items: {
        id: string;
        name: string;
        operationItems: operationItems[];
      }[];
    }[];
  }

  export interface ResTemplates extends ReqTemplates {
    id: number;
  }

  export interface ResOrderProcessingInfo {
    processingImages: string[];
    processingVideos: string[];
    remark: string;
    processingStatus: string;
    estimatedArrivalTime: string;
    arrivalNotifiedRemark: string;
    departedRemark: string;
    arrivedRemark: string;
    selfInspectedRemark: string;
    rejectTime: string;
    rejectReason: string;
    departureTime: string;
    arrivalTime: string;
    selfInspectionTime: string;
    selfInspectionPhotos?: string[];
    executionStartTime: string;
    completeTime: string;
    technician: ITechnician;
    processingResult?: {
      tempList: {
        id: string;
        name: string;
        items: {
          id: string;
          name: string;
          operationItems: operationItems[];
        }[];
      }[];
    };
    tempList: {
      id: string;
      name: string;
      items: {
        id: string;
        name: string;
        operationItems: operationItems[];
      }[];
    }[];
  }
}

export namespace Equipment {
  export interface ReqEquipmentParams extends ReqPage {
    type: string;
    page: number;
    pageSize: number;
  }

  export interface ResEquipmentList {
    items: ResEquipment[];
    page: number;
    pageSize: number;
    total: number;
  }

  export interface ResEquipment {
    id: string;
    name: string;
    type: string;
    defaultStructure: string;
    createdBy: number;
    description: string;
    createdAt: string;
    isDefault: boolean;
    deletedAt: string;
    equipmentNo?: string;
    manufactureDate?: string;
    nameplatePhoto?: string;
    devicePhotos?: string[];
    remarks?: string;
    customInfo?: string;
    enterpriseId?: string;
    enterprise?: {
      id: string;
      enterpriseName: string;
    };
    creator: {
      realName: string;
    };
  }

  export interface ReqCreateEquipmentTem {
    name: string;
    type: string;
    defaultStructure: string;
    description: string;
  }

  export interface ReqEquipmentListParams extends ReqPage {
    enterpriseId: string;
  }

  export interface ResEquipmentTem {
    id: string;
    name: string;
    type: string;
    defaultStructure: string;
    isDefault: boolean;
  }

  export interface ReqCreateEquipment {
    name: string;
    type: string;
    equipmentNo: string;
    enterpriseId: string;
    manufactureDate: string;
    nameplatePhoto: string;
    devicePhotos?: string[];
    customInfo: string;
    remarks: string;
  }
}

export namespace Technician {
  export interface ReqTechnicianParams extends ReqPage {
    keyword?: string;
    realAuthStatus?: string;
  }

  export interface ResTechnician {
    list: ResTechnicianItem[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
    };
  }

  export interface ResTechnicianItem {
    technicianId: string;
    wechatId: number;
    realName: string;
    phone: string;
    jobName: string;
    skills: string[];
    certificates: string[];
    experienceYears: number;
    rating: number;
    points: number;
    idCardNo: string;
    idCardFrontPhoto: string;
    idCardBackPhoto: string;
    totalOrders: number;
    completedOrders: number;
    rejectedOrders: number;
    workStatus: string;
    locationLat: number;
    locationLng: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    deletedAt: string;
    wechatUser: {
      avatarUrl: string;
      city: string;
      country: string;
      gender: number;
      language: string;
      nickname: string;
      province: string;
      unionId: string;
      wechatId: number;
    };
    workExperience: WorkExperience[];
  }

  export interface WorkExperience {
    companyName: string;
    jobDesc: string;
    startTime: string;
    endTime: string;
  }

  export interface ReqTechnicianLogParams extends ReqPage {
    type: string;
    startTime: string;
    endTime: string;
  }

  export interface ResTechnicianPoint {
    list: ResTechnicianPointItem[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
    };
  }

  export interface ResTechnicianPointItem {
    logId: string;
    technicianId: string;
    points: number;
    pointsChange: number; // Added
    type: string;
    reason: string; // Changed from remark
    createdAt: string;
  }
}

export namespace User {
  export interface ReqUserParams extends ReqPage {
    keyword?: string;
  }

  export interface ResUser {
    list: ResUserItem[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
    };
  }

  export interface ResUserItem {
    adminId: string;
    username: string;
    realName: string;
    phone: string;
    email: string;
    role: string;
    avatar: string;
    status: string;
    createdAt: string;
  }
}
