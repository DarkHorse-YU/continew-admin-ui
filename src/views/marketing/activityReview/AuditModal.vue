<template>
  <a-modal
    v-model:visible="visible"
    title="活动审核"
    :width="600"
    :ok-loading="loading"
    @before-ok="onBeforeOk"
    @cancel="onClose"
  >
    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <a-form-item label="活动名称">
        <a-input :model-value="current?.activityName" disabled />
      </a-form-item>
      <a-form-item label="活动编号">
        <a-input :model-value="current?.activityCode" disabled />
      </a-form-item>
      <a-form-item field="auditStatus" label="审核结果">
        <a-radio-group v-model="form.auditStatus">
          <a-radio :value="2">审核通过</a-radio>
          <a-radio :value="3">审核驳回</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item field="auditRemark" label="审核备注">
        <a-textarea
          v-model="form.auditRemark"
          :max-length="200"
          show-word-limit
          placeholder="请输入审核备注（驳回建议填写原因）"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import { auditActivityReview, type ActivityReviewResp } from '@/apis/marketing'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const visible = ref(false)
const loading = ref(false)
const current = ref<ActivityReviewResp>()

const formRef = ref<FormInstance>()
const form = reactive({
  auditStatus: 2 as 2 | 3,
  auditRemark: '',
})

const rules: FormInstance['rules'] = {
  auditStatus: [{ required: true, message: '请选择审核结果' }],
  auditRemark: [{
    validator: (value, callback) => {
      if (form.auditStatus === 3 && !value) {
        callback('驳回时请填写审核备注')
        return
      }
      callback()
    },
  }],
}

// 关闭
const onClose = () => {
  form.auditStatus = 2
  form.auditRemark = ''
}

// 打开
const onOpen = (record: ActivityReviewResp) => {
  current.value = record
  onClose()
  visible.value = true
}

// 确认提交
const onBeforeOk = async () => {
  const isInvalid = await formRef.value?.validate()
  if (isInvalid) {
    return false
  }
  if (!current.value?.id) {
    return false
  }
  try {
    loading.value = true
    await auditActivityReview(current.value.id, form)
    Message.success('审核成功')
    emit('save-success')
    onClose()
    return true
  } catch (error) {
    return false
  } finally {
    loading.value = false
  }
}

defineExpose({ onOpen })
</script>

<style scoped lang="scss"></style>
