import { query } from '../db/db'

export async function chargePaymentHeavy(orderId: number): Promise<boolean> {
    console.log(
        `Processing heavy payment (memory-intensive) for order ${orderId}...`
    )

    await new Promise((resolve) => setTimeout(resolve, 5000))

    const success = Math.random() > 0.3

    if (!success) {
        throw new Error(`Heavy payment failed for order ${orderId}`)
    }

    await query('UPDATE orders SET status = "paid" WHERE id = ?', [orderId])
    console.log(`Heavy payment successful for order ${orderId}.`)
    return true
}
