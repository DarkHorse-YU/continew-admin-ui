/** 活动审核状态（1: 待审核；2: 通过；3: 驳回） */
export type ActivityAuditStatus = 1 | 2 | 3

/** 活动审核列表项 */
export interface ActivityReviewResp {
  id: string
  activityName: string
  activityCode: string
  sponsorName: string
  carType?: string | number
  submitUserString: string
  submitTime: string
  currentStatus: ActivityAuditStatus
  auditUserString?: string
  auditTime?: string
  auditRemark?: string
  createTime?: string
  updateTime?: string
}

/** 活动审核详情 */
export interface ActivityReviewDetailResp extends ActivityReviewResp {
  description?: string
}

/** 活动审核查询参数 */
export interface ActivityReviewQuery {
  currentStatus?: ActivityAuditStatus
  carType?: string | number
  startTime?: string
  endTime?: string
  sort: string[]
}

/** 活动审核分页查询参数 */
export interface ActivityReviewPageQuery extends ActivityReviewQuery, PageQuery {}

/** 活动审核请求参数 */
export interface ActivityAuditReq {
  auditStatus: Exclude<ActivityAuditStatus, 1>
  auditRemark?: string
}
