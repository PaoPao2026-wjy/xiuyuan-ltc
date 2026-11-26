<template>
  <div class="config-card">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ cfg.name }}</span>
          <div class="header-actions">
            <el-checkbox :model-value="allSelected" :indeterminate="indeterminate" @change="onSelectAllChange">
              全选
            </el-checkbox>
          </div>
        </div>
      </template>

      <el-table :data="cfg.items" border style="width: 100%">
        <el-table-column label="配置选项" fixed="left" prop="name" min-width="160" />
        <el-table-column v-for="op in cfg.operations" :key="op.id" :label="op.name" align="center" min-width="110">
          <template #default="{ row }">
            <el-checkbox
              :model-value="isOperationChecked(row.id, op.id)"
              @change="val => onOperationChange(row.id, op.id, !!val)"
            />
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="选择" align="center" width="100">
          <template #default="{ row }">
            <el-checkbox :model-value="selectedItems[row.id]" @change="val => onRowCheckboxChange(row.id, !!val)" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Order } from "@/api/interface";

const props = defineProps<{
  cfg: Order.ResTempDetail;
  selectedItems: Record<number, boolean>;
  isOperationChecked: (itemId: number, opId: number) => boolean;
  setOperationChecked: (itemId: number, opId: number, checked: boolean) => void;
}>();

const emit = defineEmits<{
  (e: "toggleItem", itemId: number, checked: boolean): void;
  (e: "selectAll", cfg: Order.ResTempDetail, checked: boolean): void;
}>();

const allSelected = computed(() => {
  const items = props.cfg.items || [];
  if (!items.length) return false;
  return items.every(item => !!props.selectedItems[item.id]);
});

const indeterminate = computed(() => {
  const items = props.cfg.items || [];
  const total = items.length;
  const selectedCount = items.filter(item => !!props.selectedItems[item.id]).length;
  return selectedCount > 0 && selectedCount < total;
});

const onSelectAllChange = (val: any) => {
  emit("selectAll", props.cfg, !!val);
};

const onOperationChange = (itemId: number, opId: number, checked: boolean) => {
  props.setOperationChecked(itemId, opId, checked);
  const hasAnyChecked =
    checked || (props.cfg.operations || []).some(o => o.id !== opId && props.isOperationChecked(itemId, o.id));
  emit("toggleItem", itemId, hasAnyChecked);
};

const onRowCheckboxChange = (itemId: number, checked: boolean) => {
  emit("toggleItem", itemId, checked);
  (props.cfg.operations || []).forEach(op => {
    props.setOperationChecked(itemId, op.id, checked);
  });
};
</script>

<style scoped>
.config-card {
  margin-bottom: 16px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
