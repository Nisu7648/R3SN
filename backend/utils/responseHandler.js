class ResponseHandler {
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  static created(res, data, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  static updated(res, data, message = 'Resource updated successfully') {
    return this.success(res, data, message, 200);
  }

  static deleted(res, message = 'Resource deleted successfully') {
    return res.status(200).json({
      success: true,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit),
        hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
        hasPrev: pagination.page > 1,
      },
      timestamp: new Date().toISOString(),
    });
  }

  static workflow(res, execution, message = 'Workflow executed successfully') {
    return res.status(200).json({
      success: true,
      message,
      execution: {
        id: execution.id,
        status: execution.status,
        startTime: execution.startTime,
        endTime: execution.endTime,
        duration: execution.duration,
        result: execution.result,
        errors: execution.errors,
      },
      timestamp: new Date().toISOString(),
    });
  }

  static ml(res, insights, message = 'ML insights generated successfully') {
    return res.status(200).json({
      success: true,
      message,
      insights,
      timestamp: new Date().toISOString(),
    });
  }

  static health(res, status) {
    const statusCode = status.healthy ? 200 : 503;
    return res.status(statusCode).json({
      success: status.healthy,
      status: status.healthy ? 'healthy' : 'unhealthy',
      checks: status.checks,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = ResponseHandler;
