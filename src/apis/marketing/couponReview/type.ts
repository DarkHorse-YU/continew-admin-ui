/** 券核销审核状态（PENDING_UPLOAD=待上传，PENDING_AUDIT=待审核，APPROVED=通过，REJECTED=驳回，CANCELLED=已撤销） */
export type CouponAuditStatus = 'PENDING_UPLOAD' | 'PENDING_AUDIT' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

/** 用户核销状态（UNUSED=未使用，APPROVED=已核销，EXPIRED=已过期，CANCELLED=已作废） */
export type UserWriteOffStatus = 'UNUSED' | 'APPROVED' | 'EXPIRED' | 'CANCELLED'

/** 券类型（DISCOUNT=折扣券，CASH=满减券） */
export type CouponType = 'DISCOUNT' | 'CASH'

/** 核销方式（QR_SCAN=扫码，CODE_INPUT=输码） */
export type WriteOffMode = 'QR_SCAN' | 'CODE_INPUT'

/** 字段类型 */
export type FieldType = 'text' | 'number' | 'date' | 'enum' | 'image' | 'phone' | 'money' | 'file' | 'json'

/** 表单字段 */
export interface CouponFormField {
  fieldId: number
  fieldCode: string
  fieldName: string
  fieldType: FieldType
  valueSeq: number | null
  value: string | null
  fileId: number | null
  fileUrl: string | null
  isRequired: number
  isEditable: number
  sortNo: number
  enumOptions: string | null
  validationRule: string | null
  ocrEnabled: number
  ocrMappingKey: string | null
}

/** 字段分组 */
export interface CouponFieldGroup {
  groupName: string
  groupSort: number
  fields: CouponFormField[]
}

/** 问题记录 */
export interface CouponFieldIssue {
  id: number
  fieldId: number
  fieldCode: string
  fieldName: string
  issueCode: string
  issueMessage: string
  status: string
  fixedInSubmissionId: number | null
  createdAt: string
}

/** 当前提交信息 */
export interface CouponCurrentSubmission {
  submissionId: number
  submissionNo: number
  status: string
  submittedBy: number | null
  submittedAt: string
  reviewerId: number | null
  reviewedAt: string | null
  reviewComment: string | null
  groups: CouponFieldGroup[]
  issues: CouponFieldIssue[] | null
}

/** 券核销审核列表项 */
export interface CouponReviewResp {
  id: number
  couponNo: string
  activityId: number
  activityName: string
  deptId: number
  deptName: string
  templateId: number
  templateName: string
  needUploadProof: boolean
  couponType: CouponType
  discountRate: number | null
  discountAmount: number | null
  writeOffMode: WriteOffMode
  userWriteOffStatus: UserWriteOffStatus
  userWriteOffStatusDesc: string
  auditStatus: CouponAuditStatus
  auditStatusDesc: string
  submissionCount: number
  currentSubmissionNo: number
  writeOffTime: string | null
  auditTime: string | null
}

/** 券核销审核详情 */
export interface CouponReviewDetailResp {
  id: number
  claimId: number
  couponNo: string
  activityId: number
  activityName: string
  templateId: number
  templateName: string
  couponType: CouponType
  discountRate: number | null
  discountAmount: number | null
  thresholdAmount: number | null
  formTemplateId: number | null
  writeOffMode: WriteOffMode
  userWriteOffStatus: UserWriteOffStatus
  userWriteOffStatusDesc: string
  auditStatus: CouponAuditStatus
  auditStatusDesc: string
  status: string
  statusDesc: string
  remark: string | null
  writeOffTime: string | null
  currentSubmissionId: number | null
  auditReviewerId: number | null
  auditTime: string | null
  auditComment: string | null
  templateGroups: CouponFieldGroup[]
  currentSubmission: CouponCurrentSubmission | null
}

/** 券核销审核查询参数 */
export interface CouponReviewQuery {
  activityName?: string
  status?: CouponAuditStatus
}

/** 券核销审核分页查询参数 */
export interface CouponReviewPageQuery extends CouponReviewQuery, PageQuery {}

/** 审核问题项 */
export interface CouponAuditIssueItem {
  fieldCode: string
  issueCode: string
  issueMessage: string
}

/** 券核销审核请求参数 */
export interface CouponAuditReq {
  approved: boolean
  reviewComment?: string
  issues?: CouponAuditIssueItem[]
}
