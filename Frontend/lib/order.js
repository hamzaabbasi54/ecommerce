/**
 * Shared order utilities — reusable by both public lookup endpoints
 * and authenticated order-management code.
 */

const RETURN_WINDOW_DAYS = 30;

/**
 * Check whether an order is eligible for a refund or exchange.
 * Eligible only if:
 *   1. The order has been delivered (deliveredAt is set)
 *   2. The current date is within RETURN_WINDOW_DAYS of deliveredAt
 *
 * @param {Object} order - The order object with at least { status, deliveredAt }
 * @returns {{ eligible: boolean, reason: string }}
 */
export function checkRefundEligibility(order) {
  if (!order.deliveredAt) {
    return {
      eligible: false,
      reason: order.status === 'cancelled'
        ? 'This order has been cancelled and is not eligible for return'
        : 'This order has not been delivered yet',
    };
  }

  const deliveredDate = new Date(order.deliveredAt);
  const deadlineDate = new Date(deliveredDate);
  deadlineDate.setDate(deadlineDate.getDate() + RETURN_WINDOW_DAYS);

  if (new Date() > deadlineDate) {
    return {
      eligible: false,
      reason: `The ${RETURN_WINDOW_DAYS}-day return window has expired (delivered on ${deliveredDate.toLocaleDateString()})`,
    };
  }

  return { eligible: true, reason: null };
}
