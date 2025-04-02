import { proxyActivities } from '@temporalio/workflow'
import type * as activities from '../activities/orderActivities'

const { validateOrder, chargePayment, shipOrder } = proxyActivities<
    typeof activities
>({
    startToCloseTimeout: '10s',
    retry: {
        maximumAttempts: 3,
        initialInterval: '5s',
    },
})

export async function orderWorkflow(orderId: number): Promise<void> {
    await validateOrder(orderId)

    const paymentSuccess = await chargePayment(orderId)

    if (paymentSuccess) {
        await shipOrder(orderId)
    } else {
        console.log(`Order ${orderId} payment failed, order will be canceled.`)
    }
}
