import type * as T from './couponReview/type'
import http from '@/utils/http'

export type * from './couponReview/type'

const BASE_URL = '/coupon/reviewer'

/** @desc 查询券核销审核列表 */
export function listCouponReview(query: T.CouponReviewPageQuery) {
  return http.get<PageRes<T.CouponReviewResp[]>>(`${BASE_URL}/pending-review`, query)
}

/** @desc 查询券核销审核详情 */
export function getCouponReview(id: string) {
  return http.get<T.CouponReviewDetailResp>(`${BASE_URL}/write-off/${id}`)
}

/** @desc 审核券核销 */
export function auditCouponReview(id: string, data: T.CouponAuditReq) {
  return http.post(`${BASE_URL}/write-off/${id}/review`, data)
}
