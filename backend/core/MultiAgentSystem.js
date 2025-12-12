/**
 * R3SN Multi-Agent System
 * Autonomous agent spawning, coordination, and collective intelligence
 */

const EventEmitter = require('events');
const { Worker } = require('worker_threads');

class MultiAgentSystem extends EventEmitter {
    constructor() {
        super();
        this.agents = new Map();
        this.tasks = new Map();
        this.communications = [];
        this.sharedMemory = new Map();
        this.coordinationRules = new Map();
        this.maxAgents = 100;
    }

    /**
     * Spawn new agent
     */
    async spawnAgent(config) {
        const agentId = this.generateAgentId();

        try {
            const agent = {
                id: agentId,
                name: config.name || `Agent-${agentId}`,
                type: config.type || 'general',
                role: config.role || 'worker',
                capabilities: config.capabilities || [],
                status: 'idle',
                memory: new Map(),
                tasks: [],
                createdAt: Date.now(),
                lastActive: Date.now(),
                performance: {
                    tasksCompleted: 0,
                    tasksFailed: 0,
                    averageTime: 0,
                    successRate: 0
                }
            };

            // Check agent limit
            if (this.agents.size >= this.maxAgents) {
                throw new Error(`Maximum agent limit (${this.maxAgents}) reached`);
            }

            this.agents.set(agentId, agent);

            this.emit('agent:spawned', { agentId, agent });

            return {
                success: true,
                agentId,
                agent
            };

        } catch (error) {
            this.emit('agent:spawn:error', { error: error.message });
            throw error;
        }
    }

    /**
     * Spawn multiple agents
     */
    async spawnAgents(count, config) {
        const agents = [];

        for (let i = 0; i < count; i++) {
            const agent = await this.spawnAgent({
                ...config,
                name: `${config.name || 'Agent'}-${i + 1}`
            });
            agents.push(agent);
        }

        return {
            success: true,
            count: agents.length,
            agents
        };
    }

    /**
     * Assign task to agent
     */
    async assignTask(agentId, task) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }

        const taskId = this.generateTaskId();

        const taskData = {
            id: taskId,
            agentId,
            description: task.description,
            type: task.type || 'general',
            priority: task.priority || 5,
            data: task.data || {},
            status: 'assigned',
            assignedAt: Date.now(),
            startedAt: null,
            completedAt: null,
            result: null,
            error: null
        };

        agent.tasks.push(taskId);
        this.tasks.set(taskId, taskData);

        this.emit('task:assigned', { agentId, taskId, task: taskData });

        // Auto-execute if agent is idle
        if (agent.status === 'idle') {
            await this.executeTask(taskId);
        }

        return {
            success: true,
            taskId,
            task: taskData
        };
    }

    /**
     * Execute task
     */
    async executeTask(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) {
            throw new Error(`Task ${taskId} not found`);
        }

        const agent = this.agents.get(task.agentId);
        if (!agent) {
            throw new Error(`Agent ${task.agentId} not found`);
        }

        try {
            // Update status
            task.status = 'executing';
            task.startedAt = Date.now();
            agent.status = 'busy';
            agent.lastActive = Date.now();

            this.emit('task:started', { taskId, agentId: agent.id });

            // Execute based on task type
            let result;
            switch (task.type) {
                case 'search':
                    result = await this.executeSearchTask(task, agent);
                    break;
                case 'analyze':
                    result = await this.executeAnalyzeTask(task, agent);
                    break;
                case 'transform':
                    result = await this.executeTransformTask(task, agent);
                    break;
                case 'communicate':
                    result = await this.executeCommunicateTask(task, agent);
                    break;
                case 'coordinate':
                    result = await this.executeCoordinateTask(task, agent);
                    break;
                default:
                    result = await this.executeGenericTask(task, agent);
            }

            // Update task
            task.status = 'completed';
            task.completedAt = Date.now();
            task.result = result;

            // Update agent
            agent.status = 'idle';
            agent.performance.tasksCompleted++;
            agent.performance.averageTime = this.calculateAverageTime(agent);
            agent.performance.successRate = this.calculateSuccessRate(agent);

            this.emit('task:completed', { taskId, agentId: agent.id, result });

            return {
                success: true,
                taskId,
                result
            };

        } catch (error) {
            task.status = 'failed';
            task.error = error.message;
            task.completedAt = Date.now();
            agent.status = 'idle';
            agent.performance.tasksFailed++;

            this.emit('task:failed', { taskId, agentId: agent.id, error: error.message });

            throw error;
        }
    }

    /**
     * Execute search task
     */
    async executeSearchTask(task, agent) {
        // Simulate search
        await this.delay(1000);
        return {
            type: 'search',
            query: task.data.query,
            results: [
                { title: 'Result 1', url: 'https://example.com/1' },
                { title: 'Result 2', url: 'https://example.com/2' }
            ]
        };
    }

    /**
     * Execute analyze task
     */
    async executeAnalyzeTask(task, agent) {
        // Simulate analysis
        await this.delay(1500);
        return {
            type: 'analysis',
            data: task.data,
            insights: ['Insight 1', 'Insight 2'],
            confidence: 0.85
        };
    }

    /**
     * Execute transform task
     */
    async executeTransformTask(task, agent) {
        // Simulate transformation
        await this.delay(800);
        return {
            type: 'transform',
            input: task.data.input,
            output: task.data.input.toUpperCase(),
            transformations: ['uppercase']
        };
    }

    /**
     * Execute communicate task
     */
    async executeCommunicateTask(task, agent) {
        const targetAgentId = task.data.targetAgent;
        const message = task.data.message;

        await this.sendMessage(agent.id, targetAgentId, message);

        return {
            type: 'communication',
            from: agent.id,
            to: targetAgentId,
            message,
            sent: true
        };
    }

    /**
     * Execute coordinate task
     */
    async executeCoordinateTask(task, agent) {
        const targetAgents = task.data.agents || [];
        const coordination = task.data.coordination;

        const results = await Promise.all(
            targetAgents.map(agentId => this.coordinateAgent(agentId, coordination))
        );

        return {
            type: 'coordination',
            coordinator: agent.id,
            agents: targetAgents,
            results
        };
    }

    /**
     * Execute generic task
     */
    async executeGenericTask(task, agent) {
        await this.delay(1000);
        return {
            type: 'generic',
            task: task.description,
            completed: true
        };
    }

    /**
     * Send message between agents
     */
    async sendMessage(fromAgentId, toAgentId, message) {
        const fromAgent = this.agents.get(fromAgentId);
        const toAgent = this.agents.get(toAgentId);

        if (!fromAgent || !toAgent) {
            throw new Error('Agent not found');
        }

        const communication = {
            id: this.generateCommunicationId(),
            from: fromAgentId,
            to: toAgentId,
            message,
            timestamp: Date.now(),
            read: false
        };

        this.communications.push(communication);

        // Store in recipient's memory
        if (!toAgent.memory.has('messages')) {
            toAgent.memory.set('messages', []);
        }
        toAgent.memory.get('messages').push(communication);

        this.emit('agent:message', communication);

        return communication;
    }

    /**
     * Broadcast message to all agents
     */
    async broadcastMessage(fromAgentId, message) {
        const results = [];

        for (const [agentId, agent] of this.agents) {
            if (agentId !== fromAgentId) {
                const result = await this.sendMessage(fromAgentId, agentId, message);
                results.push(result);
            }
        }

        return results;
    }

    /**
     * Coordinate agent
     */
    async coordinateAgent(agentId, coordination) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }

        // Apply coordination rules
        if (coordination.action === 'pause') {
            agent.status = 'paused';
        } else if (coordination.action === 'resume') {
            agent.status = 'idle';
        } else if (coordination.action === 'priority') {
            // Adjust task priorities
            agent.tasks.forEach(taskId => {
                const task = this.tasks.get(taskId);
                if (task) {
                    task.priority = coordination.priority;
                }
            });
        }

        return {
            agentId,
            coordination,
            applied: true
        };
    }

    /**
     * Share memory between agents
     */
    async shareMemory(key, value, agentIds = null) {
        this.sharedMemory.set(key, {
            value,
            timestamp: Date.now(),
            sharedWith: agentIds || 'all'
        });

        // Notify agents
        const targets = agentIds || Array.from(this.agents.keys());
        targets.forEach(agentId => {
            const agent = this.agents.get(agentId);
            if (agent) {
                agent.memory.set(`shared:${key}`, value);
            }
        });

        this.emit('memory:shared', { key, agentIds: targets });

        return {
            success: true,
            key,
            sharedWith: targets.length
        };
    }

    /**
     * Get shared memory
     */
    getSharedMemory(key) {
        return this.sharedMemory.get(key);
    }

    /**
     * Collective decision making
     */
    async collectiveDecision(question, options) {
        const votes = new Map();
        options.forEach(option => votes.set(option, 0));

        // Each agent votes
        for (const [agentId, agent] of this.agents) {
            const vote = await this.agentVote(agent, question, options);
            votes.set(vote, votes.get(vote) + 1);
        }

        // Find winner
        let winner = null;
        let maxVotes = 0;
        for (const [option, count] of votes) {
            if (count > maxVotes) {
                maxVotes = count;
                winner = option;
            }
        }

        return {
            question,
            options,
            votes: Object.fromEntries(votes),
            winner,
            totalVotes: this.agents.size
        };
    }

    /**
     * Agent voting
     */
    async agentVote(agent, question, options) {
        // Simple random voting (in production, use agent's intelligence)
        return options[Math.floor(Math.random() * options.length)];
    }

    /**
     * Distribute task across multiple agents
     */
    async distributeTask(task, agentCount) {
        // Get available agents
        const availableAgents = Array.from(this.agents.values())
            .filter(agent => agent.status === 'idle')
            .slice(0, agentCount);

        if (availableAgents.length === 0) {
            throw new Error('No available agents');
        }

        // Split task
        const subtasks = this.splitTask(task, availableAgents.length);

        // Assign to agents
        const assignments = await Promise.all(
            subtasks.map((subtask, index) => 
                this.assignTask(availableAgents[index].id, subtask)
            )
        );

        return {
            success: true,
            taskId: task.id,
            subtasks: assignments.length,
            agents: availableAgents.map(a => a.id)
        };
    }

    /**
     * Split task into subtasks
     */
    splitTask(task, count) {
        const subtasks = [];
        
        for (let i = 0; i < count; i++) {
            subtasks.push({
                description: `${task.description} - Part ${i + 1}/${count}`,
                type: task.type,
                priority: task.priority,
                data: {
                    ...task.data,
                    part: i + 1,
                    total: count
                }
            });
        }

        return subtasks;
    }

    /**
     * Aggregate results from multiple agents
     */
    async aggregateResults(taskIds) {
        const results = [];

        for (const taskId of taskIds) {
            const task = this.tasks.get(taskId);
            if (task && task.status === 'completed') {
                results.push(task.result);
            }
        }

        return {
            count: results.length,
            results,
            aggregated: this.mergeResults(results)
        };
    }

    /**
     * Merge results
     */
    mergeResults(results) {
        // Simple merge (in production, use intelligent merging)
        return {
            merged: true,
            count: results.length,
            data: results
        };
    }

    /**
     * Terminate agent
     */
    async terminateAgent(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }

        // Cancel pending tasks
        agent.tasks.forEach(taskId => {
            const task = this.tasks.get(taskId);
            if (task && task.status !== 'completed') {
                task.status = 'cancelled';
            }
        });

        this.agents.delete(agentId);

        this.emit('agent:terminated', { agentId });

        return {
            success: true,
            agentId
        };
    }

    /**
     * Get agent info
     */
    getAgent(agentId) {
        return this.agents.get(agentId);
    }

    /**
     * List all agents
     */
    listAgents(filter = {}) {
        let agents = Array.from(this.agents.values());

        if (filter.status) {
            agents = agents.filter(a => a.status === filter.status);
        }

        if (filter.type) {
            agents = agents.filter(a => a.type === filter.type);
        }

        return agents;
    }

    /**
     * Get system stats
     */
    getStats() {
        const agents = Array.from(this.agents.values());
        
        return {
            totalAgents: agents.length,
            activeAgents: agents.filter(a => a.status === 'busy').length,
            idleAgents: agents.filter(a => a.status === 'idle').length,
            totalTasks: this.tasks.size,
            completedTasks: Array.from(this.tasks.values()).filter(t => t.status === 'completed').length,
            failedTasks: Array.from(this.tasks.values()).filter(t => t.status === 'failed').length,
            communications: this.communications.length,
            sharedMemory: this.sharedMemory.size
        };
    }

    /**
     * Calculate average task time
     */
    calculateAverageTime(agent) {
        const completedTasks = agent.tasks
            .map(taskId => this.tasks.get(taskId))
            .filter(task => task && task.status === 'completed');

        if (completedTasks.length === 0) return 0;

        const totalTime = completedTasks.reduce((sum, task) => {
            return sum + (task.completedAt - task.startedAt);
        }, 0);

        return totalTime / completedTasks.length;
    }

    /**
     * Calculate success rate
     */
    calculateSuccessRate(agent) {
        const total = agent.performance.tasksCompleted + agent.performance.tasksFailed;
        if (total === 0) return 0;
        return (agent.performance.tasksCompleted / total) * 100;
    }

    /**
     * Generate agent ID
     */
    generateAgentId() {
        return `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate task ID
     */
    generateTaskId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate communication ID
     */
    generateCommunicationId() {
        return `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = MultiAgentSystem;
