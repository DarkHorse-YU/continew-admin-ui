<template>
  <a-drawer v-model:visible="visible" title="活动审核详情" :width="width >= 700 ? 700 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="ID">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="活动编号">{{ dataDetail?.activityCode }}</a-descriptions-item>
      <a-descriptions-item label="活动名称" :span="2">{{ dataDetail?.activityName }}</a-descriptions-item>
      <a-descriptions-item label="购车类型">{{ dataDetail?.carType ?? '-' }}</a-descriptions-item>
      <a-descriptions-item label="发起人">{{ dataDetail?.sponsorName }}</a-descriptions-item>
      <a-descriptions-item label="提交人">{{ dataDetail?.submitUserString }}</a-descriptions-item>
      <a-descriptions-item label="提交时间">{{ dataDetail?.submitTime }}</a-descriptions-item>
      <a-descriptions-item label="状态">
        <a-tag v-if="dataDetail?.currentStatus === 1" color="orangered">待审核</a-tag>
        <a-tag v-else-if="dataDetail?.currentStatus === 2" color="green">审核通过</a-tag>
        <a-tag v-else color="red">审核驳回</a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="审核人">{{ dataDetail?.auditUserString || '-' }}</a-descriptions-item>
      <a-descriptions-item label="审核时间">{{ dataDetail?.auditTime || '-' }}</a-descriptions-item>
      <a-descriptions-item label="审核备注" :span="2">{{ dataDetail?.auditRemark || '-' }}</a-descriptions-item>
      <a-descriptions-item label="活动描述" :span="2">{{ dataDetail?.description || '-' }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type ActivityReviewDetailResp, getActivityReview as getDetail } from '@/apis/marketing'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<ActivityReviewDetailResp>()
const visible = ref(false)

// 查询详情
const getDataDetail = async () => {
  const { data } = await getDetail(dataId.value)
  dataDetail.value = data
}

// 打开
const onOpen = async (id: string) => {
  dataId.value = id
  await getDataDetail()
  visible.value = true
}

defineExpose({ onOpen })
</script>

<style scoped lang="scss"></style>
