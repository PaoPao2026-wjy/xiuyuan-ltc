import { defineStore } from "pinia";
import { AuthState } from "@/stores/interface";
import { getAuthButtonListApi } from "@/api/modules/login";
// getAuthMenuListApi
import { getFlatMenuList, getShowMenuList, getAllBreadcrumbList } from "@/utils";

export const useAuthStore = defineStore({
  id: "geeker-auth",
  state: (): AuthState => ({
    // 按钮权限列表
    authButtonList: {},
    // 菜单权限列表
    authMenuList: [],
    // 当前页面的 router name，用来做按钮权限筛选
    routeName: ""
  }),
  getters: {
    // 按钮权限列表
    authButtonListGet: state => state.authButtonList,
    // 菜单权限列表 ==> 这里的菜单没有经过任何处理
    authMenuListGet: state => state.authMenuList,
    // 菜单权限列表 ==> 左侧菜单栏渲染，需要剔除 isHide == true
    showMenuListGet: state => getShowMenuList(state.authMenuList),
    // 菜单权限列表 ==> 扁平化之后的一维数组菜单，主要用来添加动态路由
    flatMenuListGet: state => getFlatMenuList(state.authMenuList),
    // 递归处理后的所有面包屑导航列表
    breadcrumbListGet: state => getAllBreadcrumbList(state.authMenuList)
  },
  actions: {
    // Get AuthButtonList
    async getAuthButtonList() {
      const { data } = await getAuthButtonListApi();
      this.authButtonList = data;
    },
    // Get AuthMenuList
    async getAuthMenuList() {
      // const { data } = await getAuthMenuListApi();
      this.authMenuList = [
        // {
        //   component: "/home/index",
        //   meta: {
        //     icon: "HomeFilled",
        //     title: "首页",
        //     isFull: false,
        //     isHide: false,
        //     isAffix: true,
        //     isKeepAlive: true,
        //     isLink: ""
        //   },
        //   name: "home",
        //   path: "/home/index"
        // },
        {
          name: "order",
          path: "/order",
          redirect: "/order/workOrder",
          meta: {
            icon: "Briefcase",
            title: "工单管理",
            isFull: false,
            isHide: false,
            isAffix: false,
            isKeepAlive: false,
            isLink: ""
          },
          children: [
            {
              path: "/order/workOrder",
              name: "workOrder",
              component: "/order/index",
              meta: {
                icon: "Menu",
                title: "工单管理",
                isLink: "",
                isHide: false,
                isFull: false,
                isAffix: false,
                isKeepAlive: false
              }
            },
            {
              path: "/order/create",
              name: "createOrder",
              component: "/order/create",
              meta: {
                icon: "Menu",
                title: "创建工单",
                isLink: "",
                isHide: true,
                isFull: false,
                isAffix: false,
                isKeepAlive: false
              }
            },
            {
              path: "/order/edit/:id",
              name: "editOrder",
              component: "/order/create",
              meta: {
                icon: "Menu",
                title: "编辑工单",
                isLink: "",
                isHide: true,
                isFull: false,
                isAffix: false,
                isKeepAlive: false
              }
            },
            {
              path: "/order/detail/:id",
              name: "orderDetail",
              component: "/order/detail",
              meta: {
                icon: "Menu",
                title: "工单详情",
                isLink: "",
                isHide: true,
                isFull: false,
                isAffix: false,
                isKeepAlive: false
              }
            },
            {
              path: "/order/draft",
              name: "draft",
              component: "/order/draft",
              meta: {
                icon: "Menu",
                title: "草稿管理",
                isLink: "",
                isHide: false,
                isFull: false,
                isAffix: false,
                isKeepAlive: false
              }
            },
            {
              path: "/order/configItemManage",
              name: "configItemManage",
              component: "/order/configItem",
              meta: {
                icon: "Menu",
                title: "工单配置项管理",
                isLink: "",
                isHide: false,
                isFull: false,
                isAffix: false,
                isKeepAlive: false
              }
            },
            {
              path: "/order/templateManage",
              name: "templateManage",
              component: "/order/template",
              meta: {
                icon: "Menu",
                title: "工单模板管理",
                isLink: "",
                isHide: false,
                isFull: false,
                isAffix: false,
                isKeepAlive: false
              }
            },
            {
              path: "/order/templateForm",
              name: "templateForm",
              component: "/order/templateForm",
              meta: {
                icon: "Menu",
                title: "工单模板表单",
                isLink: "",
                isHide: true,
                isFull: false,
                isAffix: false,
                isKeepAlive: false
              }
            }
          ]
        },
        {
          path: "/company",
          name: "company",
          component: "/company/index",
          meta: {
            icon: "Histogram",
            title: "企业管理",
            isFull: false,
            isHide: false,
            isAffix: true,
            isKeepAlive: false,
            isLink: ""
          }
        },
        {
          path: "/company/create",
          name: "createCompany",
          component: "/company/companyForm",
          meta: {
            icon: "Menu",
            title: "创建企业",
            isLink: "",
            isHide: true,
            isFull: false,
            isAffix: false,
            isKeepAlive: false
          }
        },
        {
          path: "/company/edit/:id",
          name: "editCompany",
          component: "/company/companyForm",
          meta: {
            icon: "Menu",
            title: "编辑企业",
            isLink: "",
            isHide: true,
            isFull: false,
            isAffix: false,
            isKeepAlive: false
          }
        },
        {
          path: "/company/detail/:id",
          name: "companyDetail",
          component: "/company/companyDetail",
          meta: {
            icon: "Menu",
            title: "企业详情",
            isLink: "",
            isHide: true,
            isFull: false,
            isAffix: false,
            isKeepAlive: false
          }
        },
        {
          name: "equipment",
          path: "/equipment",
          redirect: "/equipmentTem/list",
          meta: {
            icon: "Briefcase",
            title: "设备管理",
            isFull: false,
            isHide: false,
            isAffix: false,
            isKeepAlive: false,
            isLink: ""
          },
          children: [
            {
              path: "/equipmentTem/list",
              name: "equipmentTemList",
              component: "/equipmentTem/index",
              meta: {
                icon: "Menu",
                title: "设备模板管理",
                isLink: "",
                isHide: false,
                isFull: false,
                isAffix: false,
                isKeepAlive: false
              }
            },
            {
              path: "/equipmentTem/create",
              name: "createEquipmentTem",
              component: "/equipmentTem/templateForm",
              meta: {
                icon: "Menu",
                title: "创建设备模板",
                isLink: "",
                isHide: true,
                isFull: false,
                isAffix: false,
                isKeepAlive: false
              }
            },
            {
              path: "/equipmentTem/edit/:id",
              name: "editEquipmentTem",
              component: "/equipmentTem/templateForm",
              meta: {
                icon: "Menu",
                title: "编辑设备模板",
                isLink: "",
                isHide: true,
                isFull: false,
                isAffix: false,
                isKeepAlive: false
              }
            },
            {
              path: "/equipmentTem/detail/:id",
              name: "equipmentTemDetail",
              component: "/equipmentTem/detail",
              meta: {
                icon: "Menu",
                title: "设备模板详情",
                isLink: "",
                isHide: true,
                isFull: false,
                isAffix: false,
                isKeepAlive: false
              }
            },
            {
              path: "/equipment/list",
              name: "equipmentList",
              component: "/equipment/index",
              meta: {
                icon: "Menu",
                title: "设备管理",
                isLink: "",
                isHide: false,
                isFull: false,
                isAffix: false,
                isKeepAlive: false
              }
            },
            {
              path: "/equipment/create",
              name: "createEquipment",
              component: "/equipment/templateForm",
              meta: {
                icon: "Menu",
                title: "创建设备",
                isLink: "",
                isHide: true,
                isFull: false,
                isAffix: false,
                isKeepAlive: false
              }
            },
            {
              path: "/equipment/edit/:id",
              name: "editEquipment",
              component: "/equipment/templateForm",
              meta: {
                icon: "Menu",
                title: "编辑设备",
                isLink: "",
                isHide: true,
                isFull: false,
                isAffix: false,
                isKeepAlive: false
              }
            },
            {
              path: "/equipment/detail/:id",
              name: "equipmentDetail",
              component: "/equipment/detail",
              meta: {
                icon: "Menu",
                title: "设备详情",
                isLink: "",
                isHide: true,
                isFull: false,
                isAffix: false,
                isKeepAlive: false
              }
            }
          ]
        },
        {
          name: "technician",
          path: "/technician",
          redirect: "/technician/index",
          meta: {
            icon: "User",
            title: "电工管理",
            isFull: false,
            isHide: false,
            isAffix: false,
            isKeepAlive: false,
            isLink: ""
          },
          children: [
            {
              path: "/technician/index",
              name: "technicianList",
              component: "/technician/index",
              meta: {
                icon: "Menu",
                title: "电工列表",
                isLink: "",
                isHide: false,
                isFull: false,
                isAffix: false,
                isKeepAlive: false
              }
            },
            {
              path: "/technician/points/:id",
              name: "technicianPoints",
              component: "/technician/point",
              meta: {
                icon: "Menu",
                title: "查看积分",
                isLink: "",
                isHide: true,
                isFull: false,
                isAffix: false,
                isKeepAlive: false
              }
            },
            {
              path: "/technician/detail/:id",
              name: "technicianDetail",
              component: "/technician/detail",
              meta: {
                icon: "Menu",
                title: "电工详情",
                isLink: "",
                isHide: true,
                isFull: false,
                isAffix: false,
                isKeepAlive: false
              }
            }
          ]
        },
        {
          name: "system",
          path: "/system",
          redirect: "/system/accountManage",
          meta: {
            icon: "Tools",
            title: "系统管理",
            isFull: false,
            isHide: false,
            isAffix: false,
            isKeepAlive: true,
            isLink: ""
          },
          children: [
            {
              path: "/system/accountManage",
              name: "accountManage",
              component: "/system/accountManage/index",
              meta: {
                icon: "Menu",
                title: "账号管理",
                isLink: "",
                isHide: false,
                isFull: false,
                isAffix: false,
                isKeepAlive: true
              }
            },
            {
              path: "/system/roleManage",
              name: "roleManage",
              component: "/system/roleManage/index",
              meta: {
                icon: "Menu",
                title: "角色管理",
                isLink: "",
                isHide: false,
                isFull: false,
                isAffix: false,
                isKeepAlive: true
              }
            }
          ]
        }
      ];
    },
    // Set RouteName
    async setRouteName(name: string) {
      this.routeName = name;
    }
  }
});
