import {
    proxyActivities,
    defineUpdate,
    defineQuery,
    setHandler,
    sleep,
    CancelledFailure,
} from '@temporalio/workflow'
import type * as activities from '../activities/orderActivities'
import * as heavyActivities from '../activities/memoryIntensiveActivities'

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'canceled'

export const cancelUpdate = defineUpdate<OrderStatus, [OrderStatus]>(
    'cancelUpdate'
)
export const getStatusQuery = defineQuery<OrderStatus>('getStatus')

const normalActivities = proxyActivities<typeof activities>({
    startToCloseTimeout: '10s',
    retry: {
        maximumAttempts: 3,
        initialInterval: '5s',
    },
})

// separate proxy for heavy activities, and its task queue is different.
// heavy activities are routed to workers on a different queue.

const heavyActivitiesProxy = proxyActivities<typeof heavyActivities>({
    taskQueue: 'order-memory-intensive',
    startToCloseTimeout: '30s',
    retry: {
        maximumAttempts: 3,
        initialInterval: '5s',
    },
})

export async function orderWorkflow(orderId: number): Promise<void> {
    let state: { currentStatus: OrderStatus } = { currentStatus: 'pending' }
    let cancelRequested = false

    setHandler(cancelUpdate, (newStatus) => {
        if (newStatus === 'canceled') {
            cancelRequested = true
            state.currentStatus = newStatus
        }
        return state.currentStatus
    })

    setHandler(getStatusQuery, () => state.currentStatus)

    const expirationTimer = sleep(10 * 60 * 1000).then(() => {
        throw new Error('Order expired')
    })

    const processPromise = (async () => {
        await normalActivities.validateOrder(orderId)
        console.log(`[order-${orderId}] Order validated.`)

        console.log(`[order-${orderId}] Waiting 10s before charging payment...`)
        await sleep(10 * 1000)

        if (cancelRequested) {
            console.log(`[order-${orderId}] Order was canceled before payment.`)
            await normalActivities.updateOrderStatus(orderId, 'canceled')
            throw new CancelledFailure('Order was canceled before payment')
        }

        // Calling the heavy version of chargePayment.
        const paymentSuccess = await heavyActivitiesProxy.chargePaymentHeavy(
            orderId
        )
        console.log(`[order-${orderId}] Payment success: ${paymentSuccess}`)

        console.log(`[order-${orderId}] Waiting 10s before shipping...`)
        await sleep(10 * 1000)

        if (cancelRequested) {
            console.log(
                `[order-${orderId}] Order was canceled before shipping.`
            )
            await normalActivities.updateOrderStatus(orderId, 'canceled')
            throw new CancelledFailure('Order was canceled before shipping')
        }

        if (paymentSuccess) {
            state.currentStatus = 'paid'
            await normalActivities.shipOrder(orderId)
            state.currentStatus = 'shipped'
            console.log(`[order-${orderId}] Order has been shipped.`)
        } else {
            state.currentStatus = 'canceled'
            console.log(`[order-${orderId}] Payment failed; order canceled.`)
        }
    })()

    await Promise.race([processPromise, expirationTimer])
}
