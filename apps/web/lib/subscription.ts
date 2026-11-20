export type PremiumCapableSubscription = {
  subscriptionPlan?: string | null
  subscriptionExpiresAt?: string | null
}

/**
 * Single subscription-status rule used by the global premium provider and by
 * components that receive an arbitrary vendor/profile from the API.
 *
 * Premium identity is derived only from persisted subscription fields. A
 * missing expiry means the plan has no end date in the existing system; an
 * invalid or past date is never treated as active. Customers and non-vendor
 * accounts never reach this check with vendor subscription data.
 */
export function isActivePremiumSubscription(
  subscription: PremiumCapableSubscription | null | undefined
): boolean {
  if (subscription?.subscriptionPlan !== "premium") {
    return false
  }

  if (!subscription.subscriptionExpiresAt) {
    return true
  }

  const expiresAt = new Date(subscription.subscriptionExpiresAt).getTime()

  return Number.isFinite(expiresAt) && expiresAt > Date.now()
}
