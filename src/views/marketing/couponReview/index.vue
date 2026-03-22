<template>
  <GiPageLayout>
    <GiTable
      row-key="id"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 800 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      @refresh="search"
    >
      <template #toolbar-left>
        <a-input
          v-model="queryForm.activityName"
          placeholder="请输入活动名称"
          allow-clear
          style="width: 200px"
          @press-enter="search"
        />
        <a-select
          v-model="queryForm.status"
          :options="coupon_audit_status"
          placeholder="请选择审核状态"
          allow-clear
          style="width: 180px"
          @change="search"
        />
        <a-button type="primary" @click="search">
          <template #icon><icon-search /></template>
          <template #default>搜索</template>
        </a-button>
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #couponType="{ record }">
        <GiCellTag :value="record.couponType" :dict="coupon_type" />
      </template>
      <template #writeOffMode="{ record }">
        <GiCellTag :value="record.writeOffMode" :dict="write_off_mode" />
      </template>
      <template #auditStatus="{ record }">
        <GiCellTag :value="record.auditStatus" :dict="coupon_audit_status" />
      </template>
      <template #discountAmount="{ record }">
        <span v-if="record.couponType === 'CASH' && record.discountAmount">¥{{ record.discountAmount }}</span>
        <span v-else-if="record.couponType === 'DISCOUNT' && record.discountRate">{{ (record.discountRate * 10).toFixed(1) }}折</span>
        <span v-else>-</span>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['marketing:couponReview:get']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link
            v-if="record.auditStatus === 'PENDING_AUDIT'"
            v-permission="['marketing:couponReview:audit']"
            status="warning"
            title="审核"
            @click="onAudit(record)"
          >
            审核
          </a-link>
        </a-space>
      </template>
    </GiTable>

    <DetailDrawer ref="DetailDrawerRef" />
    <AuditModal ref="AuditModalRef" @save-success="search" />
  </GiPageLayout>
</template>

<script setup lang="ts">
import type { TableInstance } from '@arco-design/web-vue'
import DetailDrawer from './DetailDrawer.vue'
import AuditModal from './AuditModal.vue'
import { type CouponReviewQuery, type CouponReviewResp, listCouponReview } from '@/apis/marketing'
import { useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'MarketingCouponReview' })

const { coupon_audit_status, coupon_type, write_off_mode } = useDict(
  'coupon_audit_status',
  'coupon_type',
  'write_off_mode',
)

const queryForm = reactive<CouponReviewQuery>({
  activityName: undefined,
  status: undefined,
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
} = useTable((page) => listCouponReview({ ...queryForm, ...page }), { immediate: true })

const columns: TableInstance['columns'] = [
  {
    title: '序号',
    width: 66,
    align: 'center',
    render: ({ rowIndex }) => h('span', {}, rowIndex + 1 + (pagination.current - 1) * pagination.pageSize),
    fixed: !isMobile() ? 'left' : undefined,
  },
  { title: '券码', dataIndex: 'couponNo', width: 140 },
  {
    title: '活动名称',
    dataIndex: 'activityName',
    minWidth: 160,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: '商家名称',
    dataIndex: 'deptName',
    minWidth: 160,
    ellipsis: true,
    tooltip: true,
  },
  { title: '券类型', dataIndex: 'couponType', slotName: 'couponType', width: 100, align: 'center' },
  { title: '优惠', dataIndex: 'discountAmount', slotName: 'discountAmount', width: 100, align: 'center' },
  { title: '核销方式', dataIndex: 'writeOffMode', slotName: 'writeOffMode', width: 100, align: 'center' },
  { title: '审核状态', dataIndex: 'auditStatus', slotName: 'auditStatus', width: 100, align: 'center' },
  { title: '核销时间', dataIndex: 'writeOffTime', width: 170 },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 130,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr([
      'marketing:couponReview:get',
      'marketing:couponReview:audit',
    ]),
  },
]

// 重置
const reset = () => {
  queryForm.activityName = undefined
  queryForm.status = undefined
  search()
}

const DetailDrawerRef = ref<InstanceType<typeof DetailDrawer>>()
// 详情
const onDetail = (record: CouponReviewResp) => {
  DetailDrawerRef.value?.onOpen(record.id.toString())
}

const AuditModalRef = ref<InstanceType<typeof AuditModal>>()
// 审核
const onAudit = (record: CouponReviewResp) => {
  AuditModalRef.value?.onOpen(record.id.toString())
}
</script>

<style scoped lang="scss"></style>
