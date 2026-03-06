<template>
  <a-modal
    v-model:visible="visible"
    title="活动审核"
    :width="720"
    :ok-loading="loading"
    :ok-text="form.issues.length ? '确认驳回' : '确认通过'"
    :ok-button-props="{ status: form.issues.length ? 'warning' : 'success' }"
    @before-ok="onBeforeOk"
    @cancel="onClose"
  >
    <a-spin :loading="detailLoading" style="width: 100%;">
      <div class="audit-modal">
        <!-- 状态头部 -->
        <div class="status-header">
          <div class="status-header__left">
            <div class="status-header__title">{{ dataDetail?.activityName }}</div>
            <div class="status-header__id">申请ID：{{ dataDetail?.applicationNo }}</div>
          </div>
        </div>

        <!-- 动态字段分组 -->
        <template v-if="dataDetail?.currentSubmission?.groups?.length">
          <div v-for="group in dataDetail.currentSubmission.groups" :key="group.groupName" class="field-group">
            <div class="field-group__header">
              <span class="field-group__icon" />
              <span class="field-group__title">{{ group.groupName }}</span>
            </div>
            <div class="field-list">
              <div
                v-for="field in group.fields"
                :key="field.fieldId"
                class="field-card"
                :class="getFieldCardClass(field.fieldType)"
              >
                <div class="field-card__header">
                  <div class="field-card__label">{{ field.fieldName }}</div>
                  <a-button
                    v-if="!isFieldHasIssue(field.fieldCode)"
                    size="small"
                    status="warning"
                    @click="openIssueDialog(field)"
                  >
                    <template #icon><icon-close-circle /></template>
                    标记问题
                  </a-button>
                  <a-tag v-else color="red" size="small">
                    <template #icon><icon-close-circle-fill /></template>
                    已标记
                  </a-tag>
                </div>
                <div class="field-card__value">
                  <!-- 文本类型 -->
                  <template v-if="field.fieldType === 'text'">
                    {{ field.value || '-' }}
                  </template>
                  <!-- 数字类型 -->
                  <template v-else-if="field.fieldType === 'number'">
                    {{ field.value || '-' }}
                  </template>
                  <!-- 日期类型 -->
                  <template v-else-if="field.fieldType === 'date'">
                    {{ field.value || '-' }}
                  </template>
                  <!-- 枚举类型 -->
                  <template v-else-if="field.fieldType === 'enum'">
                    <a-tag v-if="field.value" color="arcoblue" size="small">{{ field.value }}</a-tag>
                    <span v-else>-</span>
                  </template>
                  <!-- 手机号 -->
                  <template v-else-if="field.fieldType === 'phone'">
                    <span class="phone-value">{{ field.value || '-' }}</span>
                  </template>
                  <!-- 金额类型 -->
                  <template v-else-if="field.fieldType === 'money'">
                    <span v-if="field.value" class="money-value">¥{{ field.value }}</span>
                    <span v-else>-</span>
                  </template>
                  <!-- 图片类型 -->
                  <template v-else-if="field.fieldType === 'image'">
                    <div v-if="field.value" class="image-preview">
                      <a-image :src="field.value" width="100%" height="auto" fit="cover" />
                    </div>
                    <span v-else class="empty-value">暂无图片</span>
                  </template>
                  <!-- 文件类型 -->
                  <template v-else-if="field.fieldType === 'file'">
                    <a v-if="field.value" :href="field.value" target="_blank" class="file-link">
                      <icon-file />
                      <span>点击查看文件</span>
                    </a>
                    <span v-else class="empty-value">暂无文件</span>
                  </template>
                  <!-- JSON类型 -->
                  <template v-else-if="field.fieldType === 'json'">
                    <pre v-if="field.value" class="json-content">{{ formatJson(field.value) }}</pre>
                    <span v-else class="empty-value">-</span>
                  </template>
                  <!-- 默认 -->
                  <template v-else>
                    {{ field.value || '-' }}
                  </template>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- 已标记问题列表 -->
        <div v-if="form.issues.length" class="issues-section">
          <div class="issues-section__header">
            <span>已标记问题 ({{ form.issues.length }})</span>
          </div>
          <div class="issues-section__list">
            <div v-for="(issue, index) in form.issues" :key="issue.fieldCode" class="issue-item">
              <div class="issue-item__header">
                <span class="issue-item__field">{{ issue.fieldName }}</span>
                <a-space>
                  <a-link @click="editIssue(issue)">
                    <icon-edit />
                    编辑
                  </a-link>
                  <a-link status="danger" @click="removeIssue(index)">
                    <icon-delete />
                    删除
                  </a-link>
                </a-space>
              </div>
              <div class="issue-item__content">
                <a-tag :color="getIssueTagColor(issue.issueCode)" size="small">
                  {{ getIssueLabel(issue.issueCode) }}
                </a-tag>
                <span class="issue-item__message">{{ issue.issueMessage }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 审核备注 -->
        <div class="remark-section">
          <div class="remark-section__label">审核备注{{ form.issues.length ? '（驳回建议填写原因）' : '（选填）' }}</div>
          <a-textarea
            v-model="form.reviewComment"
            :max-length="200"
            show-word-limit
            placeholder="请输入审核备注"
          />
        </div>
      </div>
    </a-spin>
  </a-modal>

  <!-- 添加/编辑问题弹框 -->
  <a-modal
    v-model:visible="issueDialogVisible"
    :title="isEditMode ? '编辑问题' : '标记问题'"
    :width="400"
    :ok-loading="issueLoading"
    @before-ok="onIssueSubmit"
    @cancel="closeIssueDialog"
  >
    <a-form :model="issueForm" layout="vertical">
      <a-form-item label="字段名称">
        <a-input :model-value="issueForm.fieldName" disabled />
      </a-form-item>
      <a-form-item label="问题类型" required>
        <a-select v-model="issueForm.issueCode" :options="issueOptions" placeholder="请选择问题类型" />
      </a-form-item>
      <a-form-item label="问题描述" required>
        <a-textarea
          v-model="issueForm.issueMessage"
          :max-length="200"
          show-word-limit
          placeholder="请输入问题描述"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import {
  auditActivityReview,
  getActivityReview,
  type ActivityReviewDetailResp,
  type AuditIssueItem,
  type FormField,
} from '@/apis/marketing'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const visible = ref(false)
const loading = ref(false)
const detailLoading = ref(false)
const dataDetail = ref<ActivityReviewDetailResp>()

const form = reactive({
  reviewComment: '',
  issues: [] as (AuditIssueItem & { fieldName: string })[],
})

// 问题弹框
const issueDialogVisible = ref(false)
const issueLoading = ref(false)
const isEditMode = ref(false)
const editingFieldCode = ref('')
const issueForm = reactive({
  fieldCode: '',
  fieldName: '',
  issueCode: '',
  issueMessage: '',
})

// 问题类型选项
const issueOptions = [
  { label: '信息错误', value: 'INCORRECT' },
  { label: '信息缺失', value: 'MISSING' },
  { label: '格式错误', value: 'INVALID' },
  { label: '图片模糊', value: 'BLURRY' },
  { label: '其他问题', value: 'OTHER' },
]

// 获取问题类型标签颜色
const getIssueTagColor = (code: string) => {
  const colorMap: Record<string, string> = {
    INCORRECT: 'red',
    UNCLEAR: 'orange',
    MISSING: 'arcoblue',
    INVALID: 'purple',
    BLURRY: 'cyan',
    OTHER: 'gray',
  }
  return colorMap[code] || 'gray'
}

// 获取问题类型标签文本
const getIssueLabel = (code: string) => {
  const option = issueOptions.find((o) => o.value === code)
  return option?.label || code
}

// 获取字段卡片样式类
const getFieldCardClass = (fieldType: string) => {
  const classes: string[] = []
  if (fieldType === 'image' || fieldType === 'file' || fieldType === 'json') {
    classes.push('field-card--full')
  }
  return classes.join(' ')
}

// 格式化JSON
const formatJson = (value: string) => {
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

// 判断字段是否有问题
const isFieldHasIssue = (fieldCode: string) => {
  return form.issues.some((issue) => issue.fieldCode === fieldCode)
}

// 打开问题弹框
const openIssueDialog = (field: FormField) => {
  isEditMode.value = false
  editingFieldCode.value = ''
  issueForm.fieldCode = field.fieldCode
  issueForm.fieldName = field.fieldName
  issueForm.issueCode = 'OTHER'
  issueForm.issueMessage = ''
  issueDialogVisible.value = true
}

// 编辑问题
const editIssue = (issue: AuditIssueItem & { fieldName: string }) => {
  isEditMode.value = true
  editingFieldCode.value = issue.fieldCode
  issueForm.fieldCode = issue.fieldCode
  issueForm.fieldName = issue.fieldName
  issueForm.issueCode = issue.issueCode
  issueForm.issueMessage = issue.issueMessage
  issueDialogVisible.value = true
}

// 关闭问题弹框
const closeIssueDialog = () => {
  issueForm.fieldCode = ''
  issueForm.fieldName = ''
  issueForm.issueCode = ''
  issueForm.issueMessage = ''
}

// 提交问题
const onIssueSubmit = async () => {
  if (!issueForm.issueCode) {
    Message.warning('请选择问题类型')
    return false
  }
  if (!issueForm.issueMessage.trim()) {
    Message.warning('请输入问题描述')
    return false
  }

  if (isEditMode.value) {
    // 编辑模式：更新现有问题
    const index = form.issues.findIndex((i) => i.fieldCode === editingFieldCode.value)
    if (index > -1) {
      form.issues[index] = {
        fieldCode: issueForm.fieldCode,
        issueCode: issueForm.issueCode,
        issueMessage: issueForm.issueMessage,
        fieldName: issueForm.fieldName,
      }
    }
  } else {
    // 新增模式
    form.issues.push({
      fieldCode: issueForm.fieldCode,
      issueCode: issueForm.issueCode,
      issueMessage: issueForm.issueMessage,
      fieldName: issueForm.fieldName,
    })
  }

  closeIssueDialog()
  return true
}

// 移除问题
const removeIssue = (index: number) => {
  form.issues.splice(index, 1)
}

// 关闭
const onClose = () => {
  dataDetail.value = undefined
  form.reviewComment = ''
  form.issues = []
}

// 打开
const onOpen = async (id: string) => {
  onClose()
  detailLoading.value = true
  try {
    const { data } = await getActivityReview(id)
    dataDetail.value = data
    visible.value = true
  } finally {
    detailLoading.value = false
  }
}

// 确认提交
const onBeforeOk = async () => {
  if (!dataDetail.value?.id) {
    return false
  }

  try {
    loading.value = true
    const reqData = {
      approved: form.issues.length === 0,
      reviewComment: form.reviewComment || undefined,
      issues: form.issues.length > 0
        ? form.issues.map(({ fieldCode, issueCode, issueMessage }) => ({
            fieldCode,
            issueCode,
            issueMessage,
          }))
        : undefined,
    }
    await auditActivityReview(dataDetail.value.id.toString(), reqData)
    Message.success(form.issues.length ? '审核驳回成功' : '审核通过成功')
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

<style scoped lang="scss">
.audit-modal {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// 状态头部
.status-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgb(var(--primary-1)) 0%, rgb(var(--primary-2)) 100%);
  border-radius: 8px;

  &__left {
    text-align: center;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-1);
    margin-bottom: 4px;
  }

  &__id {
    font-size: 12px;
    color: var(--color-text-3);
  }
}

// 字段分组
.field-group {
  background: var(--color-fill-1);
  border-radius: 8px;
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 12px;
    background: var(--color-bg-1);
    border-bottom: 1px solid var(--color-border-2);
  }

  &__icon {
    width: 3px;
    height: 12px;
    background: rgb(var(--primary-6));
    border-radius: 1px;
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text-1);
  }
}

// 字段列表
.field-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  padding: 8px;
  gap: 8px;
}

// 字段卡片
.field-card {
  padding: 10px 12px;
  background: var(--color-bg-1);
  border-radius: 6px;
  border: 1px solid var(--color-border-1);
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-border-3);
  }

  &--full {
    grid-column: 1 / -1;

    .field-card__value {
      display: flex;
      justify-content: center;
    }
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
    gap: 8px;
  }

  &__label {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-2);
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;

    &::before {
      content: '';
      display: inline-block;
      width: 2px;
      height: 12px;
      background: rgb(var(--primary-6));
      border-radius: 1px;
      margin-right: 6px;
      flex-shrink: 0;
    }
  }

  &__value {
    font-size: 13px;
    color: var(--color-text-1);
    word-break: break-all;
    line-height: 1.4;
  }
}

.phone-value {
  font-family: 'SF Mono', 'Fira Code', monospace;
  letter-spacing: 0.5px;
}

.money-value {
  font-size: 15px;
  font-weight: 600;
  color: rgb(var(--warning-6));
}

.image-preview {
  max-width: 160px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--color-border-2);

  :deep(.arco-image) {
    display: block;
  }
}

.file-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  background: rgb(var(--primary-1));
  color: rgb(var(--primary-6));
  text-decoration: none;
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgb(var(--primary-2));
    color: rgb(var(--primary-5));
  }
}

.json-content {
  margin: 0;
  padding: 10px;
  background: var(--color-fill-2);
  border-radius: 4px;
  font-size: 11px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  overflow: auto;
  max-height: 160px;
  line-height: 1.5;
  border: 1px solid var(--color-border-2);
}

.empty-value {
  color: var(--color-text-4);
  font-size: 12px;
}

// 问题区域
.issues-section {
  background: rgb(var(--danger-1));
  border: 1px solid rgb(var(--danger-2));
  border-radius: 8px;
  overflow: hidden;

  &__header {
    padding: 10px 12px;
    font-size: 13px;
    font-weight: 600;
    color: rgb(var(--danger-6));
    border-bottom: 1px solid rgb(var(--danger-2));
  }

  &__list {
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 200px;
    overflow-y: auto;
  }
}

.issue-item {
  padding: 10px 12px;
  background: var(--color-bg-1);
  border-radius: 6px;
  border-left: 3px solid rgb(var(--danger-6));

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  &__field {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-1);
  }

  &__content {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  &__message {
    font-size: 12px;
    color: var(--color-text-2);
    line-height: 1.4;
  }
}

// 审核备注
.remark-section {
  &__label {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-2);
    margin-bottom: 10px;
  }
}
</style>
