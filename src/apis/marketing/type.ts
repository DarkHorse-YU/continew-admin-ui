/** 活动审核状态（PENDING: 待审核；APPROVED: 通过；REJECTED: 驳回） */
export type ActivityAuditStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

/** 字段类型 */
export type FieldType = 'text' | 'number' | 'date' | 'enum' | 'image' | 'phone' | 'money' | 'file' | 'json'

/** 表单字段 */
export interface FormField {
  fieldId: number
  fieldCode: string
  fieldName: string
  fieldType: FieldType
  valueSeq: number
  value: string
  fileId: number | null
  isRequired: number
  isUserEditable: number
  sortNo: number
  enumOptions: string | null
  validationRule: string | null
  ocrEnabled: number
  ocrMappingKey: string | null
  isCalculated: number
}

/** 字段分组 */
export interface FieldGroup {
  groupName: string
  groupSort: number
  fields: FormField[]
}

/** 问题记录 */
export interface FieldIssue {
  id: number
  fieldId: number
  fieldCode: string
  fieldName: string
  issueCode: string
  issueMessage: string
  status: string
  createdAt: string
}

/** 当前提交信息 */
export interface CurrentSubmission {
  submissionId: number
  submissionNo: number
  status: string
  submittedAt: string
  reviewedAt: string | null
  reviewerId: number | null
  reviewComment: string | null
  groups: FieldGroup[]
  issues: FieldIssue[]
}

/** 活动审核列表项 */
export interface ActivityReviewResp {
  id: number
  customerId: number
  applicationNo: string
  activityId: number
  activityName: string
  userId: number
  currentStatus: ActivityAuditStatus
  carType: string
  createdAt: string
  updatedAt: string
}

/** 活动审核详情 */
export interface ActivityReviewDetailResp {
  id: number
  customerId: number
  applicationNo: string
  activityId: number
  activityName: string
  userId: number
  currentStatus: ActivityAuditStatus
  rejectCount: number
  approvedAt: string | null
  createdAt: string
  currentSubmission: CurrentSubmission
}

/** 活动审核查询参数 */
export interface ActivityReviewQuery {
  currentStatus?: ActivityAuditStatus
  carType?: string
  startTime?: string
  endTime?: string
  sort: string[]
}

/** 活动审核分页查询参数 */
export interface ActivityReviewPageQuery extends ActivityReviewQuery, PageQuery {}

/** 审核问题项 */
export interface AuditIssueItem {
  fieldCode: string
  issueCode: string
  issueMessage: string
}

/** 活动审核请求参数 */
export interface ActivityAuditReq {
  approved: boolean
  reviewComment?: string
  issues?: AuditIssueItem[]
}
