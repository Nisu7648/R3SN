const AWS = require('aws-sdk');

class AWSFreeTierIntegration {
  constructor(accessKeyId, secretAccessKey, region = 'us-east-1') {
    AWS.config.update({ accessKeyId, secretAccessKey, region });
    this.ec2 = new AWS.EC2();
    this.s3 = new AWS.S3();
    this.lambda = new AWS.Lambda();
    this.dynamodb = new AWS.DynamoDB();
    this.rds = new AWS.RDS();
    this.ses = new AWS.SES();
    this.sns = new AWS.SNS();
    this.sqs = new AWS.SQS();
    this.cloudwatch = new AWS.CloudWatch();
    this.costExplorer = new AWS.CostExplorer();
  }

  async wrapPromise(promise) {
    try {
      const data = await promise.promise();
      return { success: true, data };
    } catch (error) {
      throw new Error(`AWS API error: ${error.message}`);
    }
  }

  // EC2 Instances (FREE: 750 hours/month t2.micro for 12 months)
  async listInstances() { return this.wrapPromise(this.ec2.describeInstances()); }
  async runInstance(imageId, instanceType = 't2.micro', keyName, securityGroupIds) {
    return this.wrapPromise(this.ec2.runInstances({ ImageId: imageId, InstanceType: instanceType, MinCount: 1, MaxCount: 1, KeyName: keyName, SecurityGroupIds: securityGroupIds }));
  }
  async startInstance(instanceId) { return this.wrapPromise(this.ec2.startInstances({ InstanceIds: [instanceId] })); }
  async stopInstance(instanceId) { return this.wrapPromise(this.ec2.stopInstances({ InstanceIds: [instanceId] })); }
  async rebootInstance(instanceId) { return this.wrapPromise(this.ec2.rebootInstances({ InstanceIds: [instanceId] })); }
  async terminateInstance(instanceId) { return this.wrapPromise(this.ec2.terminateInstances({ InstanceIds: [instanceId] })); }

  // EBS Volumes (FREE: 30GB for 12 months)
  async listVolumes() { return this.wrapPromise(this.ec2.describeVolumes()); }
  async createVolume(availabilityZone, size = 30) {
    return this.wrapPromise(this.ec2.createVolume({ AvailabilityZone: availabilityZone, Size: size }));
  }
  async attachVolume(volumeId, instanceId, device) {
    return this.wrapPromise(this.ec2.attachVolume({ VolumeId: volumeId, InstanceId: instanceId, Device: device }));
  }
  async detachVolume(volumeId) { return this.wrapPromise(this.ec2.detachVolume({ VolumeId: volumeId })); }
  async deleteVolume(volumeId) { return this.wrapPromise(this.ec2.deleteVolume({ VolumeId: volumeId })); }

  // S3 Storage (FREE: 5GB for 12 months)
  async listBuckets() { return this.wrapPromise(this.s3.listBuckets()); }
  async createBucket(bucket) { return this.wrapPromise(this.s3.createBucket({ Bucket: bucket })); }
  async uploadObject(bucket, key, body) { return this.wrapPromise(this.s3.putObject({ Bucket: bucket, Key: key, Body: body })); }
  async downloadObject(bucket, key) { return this.wrapPromise(this.s3.getObject({ Bucket: bucket, Key: key })); }
  async deleteObject(bucket, key) { return this.wrapPromise(this.s3.deleteObject({ Bucket: bucket, Key: key })); }

  // Lambda (ALWAYS FREE: 1M requests/month)
  async listFunctions() { return this.wrapPromise(this.lambda.listFunctions()); }
  async createFunction(functionName, runtime, role, handler, code) {
    return this.wrapPromise(this.lambda.createFunction({ FunctionName: functionName, Runtime: runtime, Role: role, Handler: handler, Code: code }));
  }
  async invokeFunction(functionName, payload) {
    return this.wrapPromise(this.lambda.invoke({ FunctionName: functionName, Payload: JSON.stringify(payload) }));
  }
  async updateFunction(functionName, zipFile) {
    return this.wrapPromise(this.lambda.updateFunctionCode({ FunctionName: functionName, ZipFile: zipFile }));
  }
  async deleteFunction(functionName) { return this.wrapPromise(this.lambda.deleteFunction({ FunctionName: functionName })); }

  // DynamoDB (ALWAYS FREE: 25GB storage)
  async listTables() { return this.wrapPromise(this.dynamodb.listTables()); }
  async createTable(tableName, keySchema, attributeDefinitions) {
    return this.wrapPromise(this.dynamodb.createTable({ TableName: tableName, KeySchema: keySchema, AttributeDefinitions: attributeDefinitions, BillingMode: 'PAY_PER_REQUEST' }));
  }
  async putItem(tableName, item) { return this.wrapPromise(this.dynamodb.putItem({ TableName: tableName, Item: item })); }
  async getItem(tableName, key) { return this.wrapPromise(this.dynamodb.getItem({ TableName: tableName, Key: key })); }
  async query(tableName, keyConditionExpression, expressionAttributeValues) {
    return this.wrapPromise(this.dynamodb.query({ TableName: tableName, KeyConditionExpression: keyConditionExpression, ExpressionAttributeValues: expressionAttributeValues }));
  }
  async scan(tableName) { return this.wrapPromise(this.dynamodb.scan({ TableName: tableName })); }
  async deleteItem(tableName, key) { return this.wrapPromise(this.dynamodb.deleteItem({ TableName: tableName, Key: key })); }

  // RDS (FREE: 750 hours/month db.t2.micro for 12 months)
  async listDbInstances() { return this.wrapPromise(this.rds.describeDBInstances()); }
  async createDbInstance(dbInstanceIdentifier, dbInstanceClass = 'db.t2.micro', engine, masterUsername, masterUserPassword) {
    return this.wrapPromise(this.rds.createDBInstance({ DBInstanceIdentifier: dbInstanceIdentifier, DBInstanceClass: dbInstanceClass, Engine: engine, MasterUsername: masterUsername, MasterUserPassword: masterUserPassword, AllocatedStorage: 20 }));
  }
  async startDbInstance(dbInstanceIdentifier) { return this.wrapPromise(this.rds.startDBInstance({ DBInstanceIdentifier: dbInstanceIdentifier })); }
  async stopDbInstance(dbInstanceIdentifier) { return this.wrapPromise(this.rds.stopDBInstance({ DBInstanceIdentifier: dbInstanceIdentifier })); }

  // SES (ALWAYS FREE: 62,000 emails/month)
  async sendEmail(source, destination, subject, body) {
    return this.wrapPromise(this.ses.sendEmail({ Source: source, Destination: { ToAddresses: [destination] }, Message: { Subject: { Data: subject }, Body: { Text: { Data: body } } } }));
  }

  // SNS (ALWAYS FREE: 1M requests)
  async publishMessage(topicArn, message) {
    return this.wrapPromise(this.sns.publish({ TopicArn: topicArn, Message: message }));
  }

  // SQS (ALWAYS FREE: 1M requests)
  async sendSqsMessage(queueUrl, messageBody) {
    return this.wrapPromise(this.sqs.sendMessage({ QueueUrl: queueUrl, MessageBody: messageBody }));
  }
  async receiveSqsMessage(queueUrl) {
    return this.wrapPromise(this.sqs.receiveMessage({ QueueUrl: queueUrl, MaxNumberOfMessages: 10 }));
  }

  // CloudWatch (ALWAYS FREE)
  async putMetric(namespace, metricName, value) {
    return this.wrapPromise(this.cloudwatch.putMetricData({ Namespace: namespace, MetricData: [{ MetricName: metricName, Value: value }] }));
  }
  async getMetricStats(namespace, metricName, startTime, endTime, period, statistics) {
    return this.wrapPromise(this.cloudwatch.getMetricStatistics({ Namespace: namespace, MetricName: metricName, StartTime: startTime, EndTime: endTime, Period: period, Statistics: statistics }));
  }

  // Cost & Usage
  async getCost(startDate, endDate) {
    return this.wrapPromise(this.costExplorer.getCostAndUsage({ TimePeriod: { Start: startDate, End: endDate }, Granularity: 'MONTHLY', Metrics: ['UnblendedCost'] }));
  }
  async getFreeTierUsage() {
    return this.wrapPromise(this.costExplorer.getCostAndUsage({ TimePeriod: { Start: new Date().toISOString().split('T')[0], End: new Date().toISOString().split('T')[0] }, Granularity: 'MONTHLY', Metrics: ['UsageQuantity'], Filter: { Tags: { Key: 'aws:createdBy', Values: ['FreeTier'] } } }));
  }

  // Regions
  async listRegions() { return this.wrapPromise(this.ec2.describeRegions()); }
}

module.exports = AWSFreeTierIntegration;
