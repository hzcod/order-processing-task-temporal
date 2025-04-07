import { query } from '../db/db'

export async function validateOrder(orderId: number): Promise<void> {
    const rows = await query('SELECT * FROM orders where id = ?', [orderId])

    if (!rows || (Array.isArray(rows) && rows.length === 0)) {
        throw new Error(`Order ${orderId} not found`)
    }

    console.log(`Order ${orderId} validated`)
}

export async function chargePayment(orderId: number): Promise<boolean> {
    console.log(`Processing payment for order ${orderId}...`)

    const success = Math.random() > 0.3

    if (!success) {
        throw new Error(`Payment failed for order ${orderId}`)
    }

    await query('UPDATE orders SET status = "paid" WHERE id = ?', [orderId])
    console.log(`Payment successful for order ${orderId}.`)
    return true
}

export async function shipOrder(orderId: number): Promise<void> {
    await query('UPDATE orders SET status = "shipped" WHERE id = ?', [orderId])
    console.log(`Order ${orderId} has been shipped.`)
}

export async function updateOrderStatus(
    orderId: number,
    status: string
): Promise<void> {
    await query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId])
    console.log(`Database updated: Order ${orderId} status set to ${status}.`)
}
