import type * as T from './type'
import http from '@/utils/http'

export type * from './type'

const BASE_URL = '/activity/subsidy/admin/application'

/** @desc 查询活动审核列表 */
export function listActivityReview(query: T.ActivityReviewPageQuery) {
  return http.get<PageRes<T.ActivityReviewResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询活动审核详情 */
export function getActivityReview(id: string) {
  return http.get<T.ActivityReviewDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 审核活动 */
export function auditActivityReview(id: string, data: T.ActivityAuditReq) {
  return http.post(`${BASE_URL}/${id}/review`, data)
}

/** @desc 导出活动审核 */
export function exportActivityReview(query: T.ActivityReviewQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
