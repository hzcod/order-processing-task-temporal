import { Worker } from '@temporalio/worker'

async function run() {
    const worker = await Worker.create({
        workflowsPath: require.resolve('../workflows/orderWorkflow'),
        activities: require('../activities/orderActivities'),
        taskQueue: 'order-processing',
    })

    console.log("Worker started, listening on task queue 'order-processing'...")
    await worker.run()
}

run().catch((err) => {
    console.error(err)
    process.exit(1)
})
