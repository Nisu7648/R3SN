/**
 * R3SN Observability System
 * Metrics collection, logging, tracing, and alerting
 */

const EventEmitter = require('events');

class ObservabilitySystem extends EventEmitter {
    constructor() {
        super();
        this.metrics = new Map();
        this.logs = [];
        this.traces = new Map();
        this.alerts = [];
        this.thresholds = new Map();
        this.maxLogs = 10000;
        this.maxTraces = 1000;
        this.startTime = Date.now();
    }

    /**
     * Record metric
     */
    recordMetric(name, value, labels = {}) {
        const timestamp = Date.now();
        const key = this.generateMetricKey(name, labels);

        if (!this.metrics.has(key)) {
            this.metrics.set(key, {
                name,
                labels,
                type: 'gauge',
                values: [],
                stats: {
                    count: 0,
                    sum: 0,
                    min: Infinity,
                    max: -Infinity,
                    avg: 0
                }
            });
        }

        const metric = this.metrics.get(key);
        metric.values.push({ value, timestamp });
        
        // Update stats
        metric.stats.count++;
        metric.stats.sum += value;
        metric.stats.min = Math.min(metric.stats.min, value);
        metric.stats.max = Math.max(metric.stats.max, value);
        metric.stats.avg = metric.stats.sum / metric.stats.count;

        // Keep only last 1000 values
        if (metric.values.length > 1000) {
            metric.values.shift();
        }

        // Check thresholds
        this.checkThreshold(name, value, labels);

        this.emit('metric:recorded', { name, value, labels, timestamp });

        return { success: true, name, value };
    }

    /**
     * Increment counter
     */
    incrementCounter(name, labels = {}, increment = 1) {
        const key = this.generateMetricKey(name, labels);

        if (!this.metrics.has(key)) {
            this.metrics.set(key, {
                name,
                labels,
                type: 'counter',
                value: 0,
                lastUpdated: Date.now()
            });
        }

        const metric = this.metrics.get(key);
        metric.value += increment;
        metric.lastUpdated = Date.now();

        this.emit('counter:incremented', { name, value: metric.value, labels });

        return { success: true, name, value: metric.value };
    }

    /**
     * Record histogram
     */
    recordHistogram(name, value, labels = {}) {
        const key = this.generateMetricKey(name, labels);

        if (!this.metrics.has(key)) {
            this.metrics.set(key, {
                name,
                labels,
                type: 'histogram',
                buckets: this.createBuckets(),
                count: 0,
                sum: 0
            });
        }

        const metric = this.metrics.get(key);
        metric.count++;
        metric.sum += value;

        // Add to appropriate bucket
        for (const bucket of metric.buckets) {
            if (value <= bucket.le) {
                bucket.count++;
            }
        }

        this.emit('histogram:recorded', { name, value, labels });

        return { success: true, name, value };
    }

    /**
     * Log message
     */
    log(level, message, metadata = {}) {
        const logEntry = {
            level,
            message,
            metadata,
            timestamp: Date.now(),
            id: this.generateLogId()
        };

        this.logs.push(logEntry);

        // Keep only last N logs
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        this.emit('log:created', logEntry);

        // Console output
        const levelColors = {
            debug: '\x1b[36m',
            info: '\x1b[32m',
            warn: '\x1b[33m',
            error: '\x1b[31m',
            fatal: '\x1b[35m'
        };

        const color = levelColors[level] || '\x1b[0m';
        const reset = '\x1b[0m';
        console.log(`${color}[${level.toUpperCase()}]${reset} ${message}`, metadata);

        return logEntry;
    }

    /**
     * Start trace
     */
    startTrace(name, metadata = {}) {
        const traceId = this.generateTraceId();

        const trace = {
            id: traceId,
            name,
            metadata,
            startTime: Date.now(),
            endTime: null,
            duration: null,
            spans: [],
            status: 'active'
        };

        this.traces.set(traceId, trace);

        this.emit('trace:started', { traceId, name });

        return traceId;
    }

    /**
     * Add span to trace
     */
    addSpan(traceId, spanName, metadata = {}) {
        const trace = this.traces.get(traceId);
        if (!trace) {
            throw new Error(`Trace ${traceId} not found`);
        }

        const span = {
            name: spanName,
            metadata,
            startTime: Date.now(),
            endTime: null,
            duration: null
        };

        trace.spans.push(span);

        this.emit('span:added', { traceId, spanName });

        return span;
    }

    /**
     * End span
     */
    endSpan(traceId, spanName) {
        const trace = this.traces.get(traceId);
        if (!trace) {
            throw new Error(`Trace ${traceId} not found`);
        }

        const span = trace.spans.find(s => s.name === spanName && !s.endTime);
        if (span) {
            span.endTime = Date.now();
            span.duration = span.endTime - span.startTime;

            this.emit('span:ended', { traceId, spanName, duration: span.duration });
        }

        return span;
    }

    /**
     * End trace
     */
    endTrace(traceId, status = 'success') {
        const trace = this.traces.get(traceId);
        if (!trace) {
            throw new Error(`Trace ${traceId} not found`);
        }

        trace.endTime = Date.now();
        trace.duration = trace.endTime - trace.startTime;
        trace.status = status;

        this.emit('trace:ended', { traceId, duration: trace.duration, status });

        // Keep only last N traces
        if (this.traces.size > this.maxTraces) {
            const oldestKey = this.traces.keys().next().value;
            this.traces.delete(oldestKey);
        }

        return trace;
    }

    /**
     * Create alert
     */
    createAlert(name, condition, action) {
        const alert = {
            id: this.generateAlertId(),
            name,
            condition,
            action,
            enabled: true,
            triggered: 0,
            lastTriggered: null,
            createdAt: Date.now()
        };

        this.alerts.push(alert);

        this.emit('alert:created', { alertId: alert.id, name });

        return alert;
    }

    /**
     * Set threshold
     */
    setThreshold(metricName, threshold, comparison = 'gt') {
        this.thresholds.set(metricName, {
            threshold,
            comparison,
            alerts: []
        });

        return { success: true, metricName, threshold, comparison };
    }

    /**
     * Check threshold
     */
    checkThreshold(metricName, value, labels) {
        const thresholdConfig = this.thresholds.get(metricName);
        if (!thresholdConfig) return;

        let triggered = false;

        switch (thresholdConfig.comparison) {
            case 'gt':
                triggered = value > thresholdConfig.threshold;
                break;
            case 'lt':
                triggered = value < thresholdConfig.threshold;
                break;
            case 'eq':
                triggered = value === thresholdConfig.threshold;
                break;
            case 'gte':
                triggered = value >= thresholdConfig.threshold;
                break;
            case 'lte':
                triggered = value <= thresholdConfig.threshold;
                break;
        }

        if (triggered) {
            this.triggerAlert(metricName, value, thresholdConfig.threshold, labels);
        }
    }

    /**
     * Trigger alert
     */
    triggerAlert(metricName, value, threshold, labels) {
        const alert = {
            id: this.generateAlertId(),
            metric: metricName,
            value,
            threshold,
            labels,
            timestamp: Date.now(),
            severity: this.calculateSeverity(value, threshold)
        };

        this.alerts.push(alert);

        this.emit('alert:triggered', alert);

        this.log('warn', `Alert triggered: ${metricName}`, alert);

        return alert;
    }

    /**
     * Calculate severity
     */
    calculateSeverity(value, threshold) {
        const ratio = Math.abs(value - threshold) / threshold;

        if (ratio > 0.5) return 'critical';
        if (ratio > 0.3) return 'high';
        if (ratio > 0.1) return 'medium';
        return 'low';
    }

    /**
     * Get metrics
     */
    getMetrics(name = null, labels = {}) {
        if (name) {
            const key = this.generateMetricKey(name, labels);
            return this.metrics.get(key);
        }

        return Array.from(this.metrics.values());
    }

    /**
     * Get logs
     */
    getLogs(filter = {}) {
        let logs = [...this.logs];

        if (filter.level) {
            logs = logs.filter(log => log.level === filter.level);
        }

        if (filter.since) {
            logs = logs.filter(log => log.timestamp >= filter.since);
        }

        if (filter.limit) {
            logs = logs.slice(-filter.limit);
        }

        return logs;
    }

    /**
     * Get traces
     */
    getTraces(filter = {}) {
        let traces = Array.from(this.traces.values());

        if (filter.status) {
            traces = traces.filter(trace => trace.status === filter.status);
        }

        if (filter.name) {
            traces = traces.filter(trace => trace.name === filter.name);
        }

        return traces;
    }

    /**
     * Get alerts
     */
    getAlerts(filter = {}) {
        let alerts = [...this.alerts];

        if (filter.severity) {
            alerts = alerts.filter(alert => alert.severity === filter.severity);
        }

        if (filter.metric) {
            alerts = alerts.filter(alert => alert.metric === filter.metric);
        }

        if (filter.limit) {
            alerts = alerts.slice(-filter.limit);
        }

        return alerts;
    }

    /**
     * Get system health
     */
    getSystemHealth() {
        const uptime = Date.now() - this.startTime;
        const recentAlerts = this.alerts.filter(a => 
            Date.now() - a.timestamp < 3600000 // Last hour
        );

        const criticalAlerts = recentAlerts.filter(a => a.severity === 'critical').length;
        const highAlerts = recentAlerts.filter(a => a.severity === 'high').length;

        let status = 'healthy';
        if (criticalAlerts > 0) {
            status = 'critical';
        } else if (highAlerts > 3) {
            status = 'degraded';
        } else if (recentAlerts.length > 10) {
            status = 'warning';
        }

        return {
            status,
            uptime,
            metrics: this.metrics.size,
            logs: this.logs.length,
            traces: this.traces.size,
            alerts: {
                total: this.alerts.length,
                recent: recentAlerts.length,
                critical: criticalAlerts,
                high: highAlerts
            }
        };
    }

    /**
     * Export Prometheus metrics
     */
    exportPrometheus() {
        let output = '';

        for (const metric of this.metrics.values()) {
            if (metric.type === 'counter') {
                output += `# TYPE ${metric.name} counter\n`;
                output += `${metric.name}${this.formatLabels(metric.labels)} ${metric.value}\n`;
            } else if (metric.type === 'gauge') {
                output += `# TYPE ${metric.name} gauge\n`;
                const latest = metric.values[metric.values.length - 1];
                if (latest) {
                    output += `${metric.name}${this.formatLabels(metric.labels)} ${latest.value}\n`;
                }
            } else if (metric.type === 'histogram') {
                output += `# TYPE ${metric.name} histogram\n`;
                for (const bucket of metric.buckets) {
                    output += `${metric.name}_bucket{le="${bucket.le}"} ${bucket.count}\n`;
                }
                output += `${metric.name}_count ${metric.count}\n`;
                output += `${metric.name}_sum ${metric.sum}\n`;
            }
        }

        return output;
    }

    /**
     * Format labels for Prometheus
     */
    formatLabels(labels) {
        if (Object.keys(labels).length === 0) return '';
        
        const pairs = Object.entries(labels).map(([k, v]) => `${k}="${v}"`);
        return `{${pairs.join(',')}}`;
    }

    /**
     * Create histogram buckets
     */
    createBuckets() {
        const buckets = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
        return buckets.map(le => ({ le, count: 0 }));
    }

    /**
     * Generate metric key
     */
    generateMetricKey(name, labels) {
        const labelStr = Object.entries(labels)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}:${v}`)
            .join(',');
        return `${name}${labelStr ? `{${labelStr}}` : ''}`;
    }

    /**
     * Generate IDs
     */
    generateLogId() {
        return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateTraceId() {
        return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateAlertId() {
        return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

module.exports = ObservabilitySystem;
