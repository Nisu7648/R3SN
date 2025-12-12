/**
 * R3SN Task Execution Engine
 * Real-time task queue, priority scheduling, and parallel execution
 */

const EventEmitter = require('events');
const { Worker } = require('worker_threads');

class TaskExecutionEngine extends EventEmitter {
    constructor() {
        super();
        this.queue = [];
        this.executing = new Map();
        this.completed = new Map();
        this.failed = new Map();
        this.workers = new Map();
        this.maxConcurrent = 10;
        this.maxWorkers = 5;
        this.isProcessing = false;
    }

    /**
     * Add task to queue
     */
    async addTask(task) {
        const taskId = this.generateTaskId();

        const taskData = {
            id: taskId,
            name: task.name || 'Unnamed Task',
            type: task.type || 'generic',
            priority: task.priority || 5,
            data: task.data || {},
            dependencies: task.dependencies || [],
            timeout: task.timeout || 300000, // 5 minutes default
            retries: task.retries || 3,
            retryCount: 0,
            status: 'queued',
            progress: 0,
            result: null,
            error: null,
            createdAt: Date.now(),
            startedAt: null,
            completedAt: null,
            executionTime: null
        };

        this.queue.push(taskData);
        this.sortQueue();

        this.emit('task:queued', { taskId, task: taskData });

        // Start processing if not already running
        if (!this.isProcessing) {
            this.startProcessing();
        }

        return {
            success: true,
            taskId,
            position: this.queue.findIndex(t => t.id === taskId) + 1,
            queueSize: this.queue.length
        };
    }

    /**
     * Add multiple tasks
     */
    async addTasks(tasks) {
        const results = await Promise.all(
            tasks.map(task => this.addTask(task))
        );

        return {
            success: true,
            count: results.length,
            tasks: results
        };
    }

    /**
     * Start processing queue
     */
    async startProcessing() {
        if (this.isProcessing) return;

        this.isProcessing = true;
        this.emit('processing:started');

        while (this.queue.length > 0 || this.executing.size > 0) {
            // Process tasks while under concurrent limit
            while (this.queue.length > 0 && this.executing.size < this.maxConcurrent) {
                const task = this.getNextTask();
                if (task) {
                    this.executeTask(task);
                } else {
                    break;
                }
            }

            // Wait a bit before checking again
            await this.delay(100);
        }

        this.isProcessing = false;
        this.emit('processing:stopped');
    }

    /**
     * Get next task from queue
     */
    getNextTask() {
        // Find task with no pending dependencies
        for (let i = 0; i < this.queue.length; i++) {
            const task = this.queue[i];
            
            if (this.areDependenciesMet(task)) {
                this.queue.splice(i, 1);
                return task;
            }
        }

        return null;
    }

    /**
     * Check if task dependencies are met
     */
    areDependenciesMet(task) {
        if (!task.dependencies || task.dependencies.length === 0) {
            return true;
        }

        return task.dependencies.every(depId => {
            const dep = this.completed.get(depId);
            return dep && dep.status === 'completed';
        });
    }

    /**
     * Execute task
     */
    async executeTask(task) {
        try {
            task.status = 'executing';
            task.startedAt = Date.now();
            this.executing.set(task.id, task);

            this.emit('task:started', { taskId: task.id, task });

            // Execute based on type
            let result;
            if (task.type === 'worker') {
                result = await this.executeInWorker(task);
            } else {
                result = await this.executeInline(task);
            }

            // Task completed successfully
            task.status = 'completed';
            task.completedAt = Date.now();
            task.executionTime = task.completedAt - task.startedAt;
            task.result = result;
            task.progress = 100;

            this.executing.delete(task.id);
            this.completed.set(task.id, task);

            this.emit('task:completed', { taskId: task.id, task, result });

        } catch (error) {
            // Task failed
            task.retryCount++;

            if (task.retryCount < task.retries) {
                // Retry task
                task.status = 'retrying';
                this.emit('task:retrying', { taskId: task.id, attempt: task.retryCount });
                
                this.executing.delete(task.id);
                this.queue.unshift(task); // Add to front of queue
                this.sortQueue();
            } else {
                // Max retries reached
                task.status = 'failed';
                task.completedAt = Date.now();
                task.executionTime = task.completedAt - task.startedAt;
                task.error = error.message;

                this.executing.delete(task.id);
                this.failed.set(task.id, task);

                this.emit('task:failed', { taskId: task.id, task, error: error.message });
            }
        }
    }

    /**
     * Execute task inline
     */
    async executeInline(task) {
        return new Promise((resolve, reject) => {
            const timeoutHandle = setTimeout(() => {
                reject(new Error('Task timeout'));
            }, task.timeout);

            try {
                // Simulate task execution based on type
                const executionPromise = this.executeTaskByType(task);

                executionPromise
                    .then(result => {
                        clearTimeout(timeoutHandle);
                        resolve(result);
                    })
                    .catch(error => {
                        clearTimeout(timeoutHandle);
                        reject(error);
                    });

            } catch (error) {
                clearTimeout(timeoutHandle);
                reject(error);
            }
        });
    }

    /**
     * Execute task by type
     */
    async executeTaskByType(task) {
        switch (task.type) {
            case 'api':
                return await this.executeAPITask(task);
            case 'compute':
                return await this.executeComputeTask(task);
            case 'io':
                return await this.executeIOTask(task);
            case 'transform':
                return await this.executeTransformTask(task);
            case 'aggregate':
                return await this.executeAggregateTask(task);
            default:
                return await this.executeGenericTask(task);
        }
    }

    /**
     * Execute API task
     */
    async executeAPITask(task) {
        // Simulate API call
        await this.delay(1000);
        this.updateProgress(task.id, 50);
        await this.delay(1000);
        this.updateProgress(task.id, 100);

        return {
            type: 'api',
            endpoint: task.data.endpoint,
            response: { success: true, data: 'API response' }
        };
    }

    /**
     * Execute compute task
     */
    async executeComputeTask(task) {
        // Simulate computation
        const steps = 10;
        for (let i = 0; i < steps; i++) {
            await this.delay(200);
            this.updateProgress(task.id, ((i + 1) / steps) * 100);
        }

        return {
            type: 'compute',
            input: task.data.input,
            output: task.data.input * 2,
            computation: 'multiply by 2'
        };
    }

    /**
     * Execute IO task
     */
    async executeIOTask(task) {
        // Simulate I/O operation
        await this.delay(500);
        this.updateProgress(task.id, 30);
        await this.delay(500);
        this.updateProgress(task.id, 60);
        await this.delay(500);
        this.updateProgress(task.id, 100);

        return {
            type: 'io',
            operation: task.data.operation,
            success: true
        };
    }

    /**
     * Execute transform task
     */
    async executeTransformTask(task) {
        // Simulate data transformation
        await this.delay(800);
        this.updateProgress(task.id, 50);
        await this.delay(800);
        this.updateProgress(task.id, 100);

        return {
            type: 'transform',
            input: task.data.input,
            output: JSON.stringify(task.data.input),
            transformation: 'JSON stringify'
        };
    }

    /**
     * Execute aggregate task
     */
    async executeAggregateTask(task) {
        // Simulate aggregation
        const items = task.data.items || [];
        const total = items.length;

        for (let i = 0; i < total; i++) {
            await this.delay(100);
            this.updateProgress(task.id, ((i + 1) / total) * 100);
        }

        return {
            type: 'aggregate',
            count: total,
            aggregated: items.reduce((sum, item) => sum + (item.value || 0), 0)
        };
    }

    /**
     * Execute generic task
     */
    async executeGenericTask(task) {
        await this.delay(1500);
        this.updateProgress(task.id, 100);

        return {
            type: 'generic',
            task: task.name,
            completed: true
        };
    }

    /**
     * Execute task in worker thread
     */
    async executeInWorker(task) {
        return new Promise((resolve, reject) => {
            const worker = new Worker(`
                const { parentPort } = require('worker_threads');
                
                parentPort.on('message', async (task) => {
                    try {
                        // Simulate work
                        await new Promise(r => setTimeout(r, 2000));
                        
                        parentPort.postMessage({
                            success: true,
                            result: { task: task.name, completed: true }
                        });
                    } catch (error) {
                        parentPort.postMessage({
                            success: false,
                            error: error.message
                        });
                    }
                });
            `, { eval: true });

            const timeoutHandle = setTimeout(() => {
                worker.terminate();
                reject(new Error('Worker timeout'));
            }, task.timeout);

            worker.on('message', (message) => {
                clearTimeout(timeoutHandle);
                worker.terminate();
                
                if (message.success) {
                    resolve(message.result);
                } else {
                    reject(new Error(message.error));
                }
            });

            worker.on('error', (error) => {
                clearTimeout(timeoutHandle);
                worker.terminate();
                reject(error);
            });

            worker.postMessage(task);
            this.workers.set(task.id, worker);
        });
    }

    /**
     * Update task progress
     */
    updateProgress(taskId, progress) {
        const task = this.executing.get(taskId);
        if (task) {
            task.progress = Math.min(progress, 100);
            this.emit('task:progress', { taskId, progress: task.progress });
        }
    }

    /**
     * Cancel task
     */
    async cancelTask(taskId) {
        // Check if task is in queue
        const queueIndex = this.queue.findIndex(t => t.id === taskId);
        if (queueIndex !== -1) {
            const task = this.queue.splice(queueIndex, 1)[0];
            task.status = 'cancelled';
            this.failed.set(taskId, task);
            this.emit('task:cancelled', { taskId });
            return { success: true, taskId };
        }

        // Check if task is executing
        const task = this.executing.get(taskId);
        if (task) {
            task.status = 'cancelled';
            
            // Terminate worker if exists
            const worker = this.workers.get(taskId);
            if (worker) {
                worker.terminate();
                this.workers.delete(taskId);
            }

            this.executing.delete(taskId);
            this.failed.set(taskId, task);
            this.emit('task:cancelled', { taskId });
            return { success: true, taskId };
        }

        throw new Error(`Task ${taskId} not found`);
    }

    /**
     * Get task status
     */
    getTaskStatus(taskId) {
        // Check queue
        const queued = this.queue.find(t => t.id === taskId);
        if (queued) return queued;

        // Check executing
        const executing = this.executing.get(taskId);
        if (executing) return executing;

        // Check completed
        const completed = this.completed.get(taskId);
        if (completed) return completed;

        // Check failed
        const failed = this.failed.get(taskId);
        if (failed) return failed;

        return null;
    }

    /**
     * Get queue status
     */
    getQueueStatus() {
        return {
            queued: this.queue.length,
            executing: this.executing.size,
            completed: this.completed.size,
            failed: this.failed.size,
            total: this.queue.length + this.executing.size + this.completed.size + this.failed.size
        };
    }

    /**
     * Get all tasks
     */
    getAllTasks(filter = {}) {
        const tasks = [
            ...this.queue,
            ...Array.from(this.executing.values()),
            ...Array.from(this.completed.values()),
            ...Array.from(this.failed.values())
        ];

        if (filter.status) {
            return tasks.filter(t => t.status === filter.status);
        }

        if (filter.type) {
            return tasks.filter(t => t.type === filter.type);
        }

        return tasks;
    }

    /**
     * Clear completed tasks
     */
    clearCompleted() {
        const count = this.completed.size;
        this.completed.clear();
        this.emit('tasks:cleared', { count });
        return { success: true, cleared: count };
    }

    /**
     * Clear failed tasks
     */
    clearFailed() {
        const count = this.failed.size;
        this.failed.clear();
        this.emit('tasks:cleared', { count });
        return { success: true, cleared: count };
    }

    /**
     * Sort queue by priority
     */
    sortQueue() {
        this.queue.sort((a, b) => {
            // Higher priority first
            if (a.priority !== b.priority) {
                return b.priority - a.priority;
            }
            // Earlier created first
            return a.createdAt - b.createdAt;
        });
    }

    /**
     * Get statistics
     */
    getStats() {
        const allTasks = this.getAllTasks();
        const completedTasks = Array.from(this.completed.values());
        
        const avgExecutionTime = completedTasks.length > 0
            ? completedTasks.reduce((sum, t) => sum + t.executionTime, 0) / completedTasks.length
            : 0;

        return {
            queue: {
                queued: this.queue.length,
                executing: this.executing.size,
                completed: this.completed.size,
                failed: this.failed.size,
                total: allTasks.length
            },
            performance: {
                averageExecutionTime: avgExecutionTime,
                successRate: allTasks.length > 0
                    ? (this.completed.size / allTasks.length) * 100
                    : 0,
                failureRate: allTasks.length > 0
                    ? (this.failed.size / allTasks.length) * 100
                    : 0
            },
            system: {
                maxConcurrent: this.maxConcurrent,
                maxWorkers: this.maxWorkers,
                activeWorkers: this.workers.size,
                isProcessing: this.isProcessing
            }
        };
    }

    /**
     * Generate task ID
     */
    generateTaskId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = TaskExecutionEngine;
