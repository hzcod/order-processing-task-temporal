import { Connection, Client } from '@temporalio/client'
import { cancelUpdate } from '../workflows/orderWorkflow'

async function run(orderId: number) {
    const connection = await Connection.connect()
    const client = new Client({ connection })

    const workflowId = `order-${orderId}`
    const handle = client.workflow.getHandle(workflowId)

    try {
        console.log(
            `[cancelClient] Sending cancel update to workflow ${workflowId}`
        )
        const result = await handle.executeUpdate(cancelUpdate, {
            args: ['canceled'],
        })
        console.log(
            `[cancelClient] Cancellation update executed. Current status: ${result}`
        )
    } catch (err: any) {
        if (
            err?.cause?.details?.includes('Workflow Task in failed state') ||
            err.message?.includes('Workflow execution already completed')
        ) {
            console.warn(
                `[cancelClient] Workflow already completed or cannot accept updates.`
            )
        } else {
            console.error(`[cancelClient] Error sending update:`, err)
        }
    }
}

run(12).catch((err) => {
    console.error('[cancelClient] Top-level error:', err)
})
