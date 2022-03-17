/* eslint-disable import/prefer-default-export */
import { Stack, StackProps, CfnOutput, Duration } from "aws-cdk-lib";
import path from "path";
import { Construct } from "constructs";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as events from "aws-cdk-lib/aws-events";
import * as eventsTargets from "aws-cdk-lib/aws-events-targets";

const srcRoot = path.resolve(__dirname, "..", "src");
const tsConfigPath = path.resolve(__dirname, "..", "tsconfig.json");
const defaultBundlingOptions: NodejsFunctionProps["bundling"] = {
  tsconfig: tsConfigPath,
};

export class AwsScheduleEventStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const scheduledTable = new dynamodb.Table(this, "ScheduledTable", {
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      tableClass: dynamodb.TableClass.STANDARD,
    });

    const schedulerLambda = new NodejsFunction(this, "SchedulerLambda", {
      entry: path.join(srcRoot, "scheduler-lambda", "index.ts"),
      bundling: defaultBundlingOptions,
      environment: {
        SCHEDULED_TABLE: scheduledTable.tableName,
        SLACK_ENDPOINT: process.env.SLACK_ENDPOINT ?? "",
      },
    });

    scheduledTable.grantWriteData(schedulerLambda);

    const scheduledLambda = new NodejsFunction(this, "SheduledLambda", {
      entry: path.join(srcRoot, "scheduled-lambda", "index.ts"),
      bundling: defaultBundlingOptions,
      environment: {
        SCHEDULED_TABLE: scheduledTable.tableName,
      },
    });

    scheduledTable.grantReadWriteData(scheduledLambda);

    const scheduleTarget = new eventsTargets.LambdaFunction(scheduledLambda);

    const scheduleRule = new events.Rule(this, "ScheduleRule", {
      schedule: events.Schedule.rate(Duration.minutes(1)),
      targets: [scheduleTarget],
    });

    const api = new RestApi(this, "PsynergyApi", {
      defaultCorsPreflightOptions: {
        allowOrigins: ["*"],
        allowMethods: ["POST"],
        allowCredentials: true,
      },
    });

    const tasks = api.root.addResource("tasks");
    tasks.addMethod(
      "POST",
      new LambdaIntegration(schedulerLambda, { proxy: true })
    );

    const output = new CfnOutput(this, "apiEndpoint", { value: api.url });
  }
}
