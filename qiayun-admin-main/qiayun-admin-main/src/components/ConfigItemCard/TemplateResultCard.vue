<template>
  <div class="config-card">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ cfg.name }}</span>
        </div>
      </template>

      <el-table :data="cfg.items" border style="width: 100%">
        <el-table-column label="配置选项" fixed="left" prop="name" min-width="160" />
        <el-table-column v-for="op in cfg.operations" :key="op.id" :label="op.name" align="center" min-width="140">
          <template #default="{ row }">
            <el-tooltip :content="formatValue(row.id, op)" placement="top" effect="light" :disabled="!formatValue(row.id, op)">
              <div class="value-ellipsis" :title="formatValue(row.id, op)">
                {{ formatValue(row.id, op) || "-" }}
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Order } from "@/api/interface";

const props = defineProps<{
  cfg: Order.ResTempDetail;
  resultMap: Record<number, Record<number, any>>;
}>();

const getRawFromMap = (itemId: number | string, opId: number | string): any => {
  const iid = Number(itemId);
  const oid = Number(opId);
  return props.resultMap?.[iid]?.[oid];
};

const formatValue = (itemId: number | string, op: any): string => {
  const raw = getRawFromMap(itemId, op.id);
  if (raw === undefined || raw === null || raw === "") return "";

  switch (op?.type) {
    case "BOOLEAN": {
      const truthy = raw === true || raw === "true" || raw === 1 || raw === "1";
      const falsy = raw === false || raw === "false" || raw === 0 || raw === "0";
      if (truthy) return "是";
      if (falsy) return "否";
      return String(raw);
    }
    case "SELECT":
    case "TEXT":
    default:
      return Array.isArray(raw) ? raw.join("、") : String(raw);
  }
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
.value-ellipsis {
  width: 100%;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
