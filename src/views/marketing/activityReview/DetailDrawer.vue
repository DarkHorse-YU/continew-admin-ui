<template>
  <a-drawer v-model:visible="visible" title="申请详情" :width="width >= 560 ? 560 : '100%'" :footer="false">
    <a-spin :loading="loading" style="width: 100%;">
      <!-- 状态头部卡片 -->
      <div class="status-header">
        <div class="status-header__left">
          <div class="status-header__title">{{ dataDetail?.activityName }}</div>
          <div class="status-header__id">申请ID：{{ dataDetail?.applicationNo }}</div>
        </div>
        <div class="status-header__right">
          <div class="status-badge" :class="statusClass">
            <span class="status-badge__dot" />
            <span>{{ statusText }}</span>
          </div>
        </div>
      </div>

      <!-- 基本信息网格 -->
      <div class="info-grid">
        <div class="info-item">
          <div class="info-item__label">驳回次数</div>
          <div class="info-item__value">
            <span v-if="dataDetail?.rejectCount" class="reject-count">{{ dataDetail.rejectCount }}</span>
            <span v-else>0</span>
          </div>
        </div>
        <div class="info-item">
          <div class="info-item__label">通过时间</div>
          <div class="info-item__value">{{ dataDetail?.approvedAt || '-' }}</div>
        </div>
        <div class="info-item">
          <div class="info-item__label">创建时间</div>
          <div class="info-item__value">{{ dataDetail?.createdAt }}</div>
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
              <div class="field-card__label">{{ field.fieldName }}</div>
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

      <!-- 驳回问题记录 -->
      <template v-if="dataDetail?.currentSubmission?.issues?.length">
        <div class="issues-section">
          <div class="issues-section__header">
            <icon-exclamation-circle-fill class="issues-section__icon" />
            <span>驳回问题 ({{ dataDetail.currentSubmission.issues.length }})</span>
          </div>
          <div class="issues-list">
            <div v-for="issue in dataDetail.currentSubmission.issues" :key="issue.id" class="issue-card">
              <div class="issue-card__header">
                <span class="issue-card__field">{{ issue.fieldName }}</span>
                <a-tag :color="issue.status === 'OPEN' ? 'red' : 'green'" size="small">
                  {{ issue.status === 'OPEN' ? '待处理' : '已处理' }}
                </a-tag>
              </div>
              <div class="issue-card__message">{{ issue.issueMessage }}</div>
              <div class="issue-card__footer">
                <icon-clock-circle />
                <span>{{ issue.createdAt }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </a-spin>
  </a-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { type ActivityReviewDetailResp, getActivityReview as getDetail } from '@/apis/marketing'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<ActivityReviewDetailResp>()
const visible = ref(false)
const loading = ref(false)

// 状态文本
const statusText = computed(() => {
  const status = dataDetail.value?.currentStatus
  if (status === 'PENDING') return '待审核'
  if (status === 'APPROVED') return '审核通过'
  if (status === 'REJECTED') return '审核驳回'
  return '-'
})

// 状态样式类
const statusClass = computed(() => {
  const status = dataDetail.value?.currentStatus
  if (status === 'PENDING') return 'status-badge--pending'
  if (status === 'APPROVED') return 'status-badge--approved'
  if (status === 'REJECTED') return 'status-badge--rejected'
  return ''
})

// 获取字段卡片样式类
const getFieldCardClass = (fieldType: string) => {
  if (fieldType === 'image') return 'field-card--image'
  if (fieldType === 'file') return 'field-card--file'
  if (fieldType === 'json') return 'field-card--json'
  return ''
}

// 格式化JSON
const formatJson = (value: string) => {
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

// 查询详情
const getDataDetail = async () => {
  loading.value = true
  try {
    const { data } = await getDetail(dataId.value)
    dataDetail.value = data
  } finally {
    loading.value = false
  }
}

// 打开
const onOpen = async (id: string) => {
  dataId.value = id
  await getDataDetail()
  visible.value = true
}

defineExpose({ onOpen })
</script>

<style scoped lang="scss">
// 状态头部卡片
.status-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgb(var(--primary-1)) 0%, rgb(var(--primary-2)) 100%);
  border-radius: 8px;
  margin-bottom: 12px;

  &__left {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-1);
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__id {
    font-size: 12px;
    color: var(--color-text-3);
  }

  &__right {
    flex-shrink: 0;
    margin-left: 12px;
  }
}

// 状态徽章
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  &--pending {
    background-color: rgb(var(--warning-1));
    color: rgb(var(--warning-6));

    .status-badge__dot {
      background-color: rgb(var(--warning-6));
      animation: pulse 2s infinite;
    }
  }

  &--approved {
    background-color: rgb(var(--success-1));
    color: rgb(var(--success-6));

    .status-badge__dot {
      background-color: rgb(var(--success-6));
    }
  }

  &--rejected {
    background-color: rgb(var(--danger-1));
    color: rgb(var(--danger-6));

    .status-badge__dot {
      background-color: rgb(var(--danger-6));
    }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

// 基本信息网格
.info-grid {
  display: flex;
  gap: 16px;
  padding: 10px 12px;
  background: var(--color-fill-1);
  border-radius: 8px;
  margin-bottom: 12px;
}

.info-item {
  flex: 1;
  min-width: 0;
  text-align: center;

  &__label {
    font-size: 14px;
    color: var(--color-text-2);;
    margin-bottom: 2px;
    white-space: nowrap;
  }

  &__value {
    font-size: 12px;
    color: var(--color-text-1);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.reject-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: rgb(var(--danger-6));
  color: #fff;
  border-radius: 10px;
  font-size: 11px;
}

// 字段分组
.field-group {
  background: var(--color-fill-1);
  border-radius: 8px;
  margin-bottom: 12px;
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
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--color-border-3);
  }

  &--image,
  &--file,
  &--json {
    grid-column: 1 / -1;
  }

  &--image &__value {
    display: flex;
    justify-content: center;
  }

  &__label {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-2);
    margin-bottom: 6px;
    display: flex;
    align-items: center;

    &::before {
      content: '';
      display: inline-block;
      width: 2px;
      height: 12px;
      background: rgb(var(--primary-6));
      border-radius: 1px;
      margin-right: 6px;
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

// 驳回问题区域
.issues-section {
  background: rgb(var(--danger-1));
  border: 1px solid rgb(var(--danger-2));
  border-radius: 8px;
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 12px;
    font-size: 13px;
    font-weight: 600;
    color: rgb(var(--danger-6));
    border-bottom: 1px solid rgb(var(--danger-2));
  }

  &__icon {
    font-size: 14px;
  }
}

.issues-list {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.issue-card {
  padding: 10px 12px;
  background: var(--color-bg-1);
  border-radius: 6px;
  border-left: 3px solid rgb(var(--danger-6));

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  &__field {
    font-size: 12px;
    font-weight: 600;
    color: var(--color-text-1);
  }

  &__message {
    font-size: 12px;
    color: rgb(var(--danger-6));
    margin-bottom: 8px;
    line-height: 1.4;
  }

  &__footer {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--color-text-3);
  }
}

// 响应式
@media (max-width: 480px) {
  .info-grid {
    flex-direction: column;
    gap: 8px;
  }

  .field-card {
    flex: 1 1 100%;

    &--image,
    &--file,
    &--json {
      flex: 1 1 100%;
    }
  }
}
</style>
