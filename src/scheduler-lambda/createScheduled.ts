import {
  DynamoDB,
  PutItemCommand,
  PutItemCommandInput,
} from "@aws-sdk/client-dynamodb";
import eventSchema from "./eventSchema";

type Options = {
  id: string;
  timestamp: number;
};

async function createScheduled(options: Options) {
  const { id, timestamp }: Options = await eventSchema.validateAsync(options);

  const client = new DynamoDB({ region: process.env.AWS_REGION });
  const params: PutItemCommandInput = {
    TableName: process.env.SCHEDULED_TABLE,
    Item: {
      id: { S: id },
      timestamp: { N: timestamp.toString() },
    },
  };
  const command = new PutItemCommand(params);
  return client.send(command);
}

export default createScheduled;
