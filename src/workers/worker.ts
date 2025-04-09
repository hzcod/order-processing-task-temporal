import { Worker } from '@temporalio/worker'
import * as normalActivities from '../activities/orderActivities'
import * as heavyActivities from '../activities/memoryIntensiveActivities'

async function run() {
    const useHeavy = process.env.MEMORY_WORKER === 'true'

    const activitiesToRegister = useHeavy
        ? {
              validateOrder: normalActivities.validateOrder,
              shipOrder: normalActivities.shipOrder,
              updateOrderStatus: normalActivities.updateOrderStatus,
              chargePaymentHeavy: heavyActivities.chargePaymentHeavy,
          }
        : normalActivities

    const taskQueue = useHeavy ? 'order-memory-intensive' : 'order-processing'

    const worker = await Worker.create({
        workflowsPath: require.resolve('../workflows/orderWorkflow'),
        activities: activitiesToRegister,
        taskQueue,
    })

    console.log(`Worker started, listening on task queue '${taskQueue}'...`)
    await worker.run()
}

run().catch((err) => {
    console.error(err)
    process.exit(1)
})
