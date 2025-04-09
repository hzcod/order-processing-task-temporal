// import { Connection, Client } from '@temporalio/client'
// import { orderWorkflow } from '../workflows/orderWorkflow'

// async function run() {
//     const connection = await Connection.connect()
//     const client = new Client({ connection })

//     const orderId = 16

//     const handle = await client.workflow.start(orderWorkflow, {
//         args: [orderId],
//         taskQueue: 'order-processing',
//         workflowId: `order-${orderId}`,
//     })

//     console.log(`Workflow started: ${handle.workflowId}`)
// }

// run().catch((err) => {
//     console.error(err)
//     process.exit(1)
// })
