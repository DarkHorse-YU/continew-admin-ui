<template>
  <GiPageLayout>
    <GiTable
      row-key="id"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 900 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      @refresh="search"
    >
      <template #toolbar-left>
        <a-select
          v-model="queryForm.currentStatus"
          :options="application_status"
          placeholder="请选择状态"
          allow-clear
          style="width: 180px"
          @change="search"
        />
        <a-select
          v-model="queryForm.carType"
          :options="car_type"
          placeholder="请选择购车类型"
          allow-clear
          style="width: 180px"
          @change="search"
        />
        <DateRangePicker v-model="datetimeRange" :allow-clear="false" @change="onDateRangeChange" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['marketing:activityReview:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #carType="{ record }">
        <GiCellTag :value="record.carType" :dict="car_type" />
      </template>
      <template #currentStatus="{ record }">
        <GiCellTag :value="record.currentStatus" :dict="application_status" />
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['marketing:activityReview:get']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link
            v-if="record.currentStatus === 'PENDING'"
            v-permission="['marketing:activityReview:audit']"
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
import dayjs from 'dayjs'
import DetailDrawer from './DetailDrawer.vue'
import AuditModal from './AuditModal.vue'
import { type ActivityReviewQuery, type ActivityReviewResp, exportActivityReview, listActivityReview } from '@/apis/marketing'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'MarketingActivityReview' })

const { application_status, car_type } = useDict('application_status', 'car_type')

const getDefaultDateRange = () => ([
  dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
  dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
])

const datetimeRange = ref(getDefaultDateRange())

const queryForm = reactive<ActivityReviewQuery>({
  currentStatus: undefined,
  carType: undefined,
  startTime: datetimeRange.value[0],
  endTime: datetimeRange.value[1],
  sort: ['createdAt,desc'],
})

// 监听字典数据加载完成后设置默认值
watch(
  [application_status, car_type],
  ([statusList, carTypeList]) => {
    if (statusList?.length && queryForm.currentStatus === undefined) {
      queryForm.currentStatus = statusList[0].value as string
    }
    if (carTypeList?.length && queryForm.carType === undefined) {
      queryForm.carType = carTypeList[0].value as string
    }
  },
  { immediate: true },
)

const {
  tableData: dataList,
  loading,
  pagination,
  search,
} = useTable((page) => listActivityReview({ ...queryForm, ...page }), { immediate: true })

const columns: TableInstance['columns'] = [
  {
    title: '序号',
    width: 66,
    align: 'center',
    render: ({ rowIndex }) => h('span', {}, rowIndex + 1 + (pagination.current - 1) * pagination.pageSize),
    fixed: !isMobile() ? 'left' : undefined,
  },
  { title: '申请ID', dataIndex: 'applicationNo', width: 200 },
  {
    title: '活动名称',
    dataIndex: 'activityName',
    minWidth: 180,
    ellipsis: true,
    tooltip: true,
  },
  { title: '状态', dataIndex: 'currentStatus', slotName: 'currentStatus', width: 120, align: 'center' },
  { title: '购车类型', dataIndex: 'carType', slotName: 'carType', minWidth: 120, align: 'center' },
  { title: '创建时间', dataIndex: 'createdAt', width: 180 },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 130,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr([
      'marketing:activityReview:get',
      'marketing:activityReview:audit',
    ]),
  },
]

// 重置
const reset = () => {
  queryForm.currentStatus = undefined
  queryForm.carType = undefined
  datetimeRange.value = getDefaultDateRange()
  queryForm.startTime = datetimeRange.value[0]
  queryForm.endTime = datetimeRange.value[1]
  search()
}

// 日期变更
const onDateRangeChange = () => {
  queryForm.startTime = datetimeRange.value[0]
  queryForm.endTime = datetimeRange.value[1]
  search()
}

// 导出
const onExport = () => {
  useDownload(() => exportActivityReview(queryForm))
}

const DetailDrawerRef = ref<InstanceType<typeof DetailDrawer>>()
// 详情
const onDetail = (record: ActivityReviewResp) => {
  DetailDrawerRef.value?.onOpen(record.id.toString())
}

const AuditModalRef = ref<InstanceType<typeof AuditModal>>()
// 审核
const onAudit = (record: ActivityReviewResp) => {
  AuditModalRef.value?.onOpen(record.id.toString())
}
</script>

<style scoped lang="scss"></style>
