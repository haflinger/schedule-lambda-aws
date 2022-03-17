import {
  DynamoDB,
  ScanCommand,
  ScanCommandInput,
} from "@aws-sdk/client-dynamodb";

async function getSchedules() {
  const currentTimestamp = Date.now() / 1000;

  const client = new DynamoDB({ region: process.env.AWS_REGION });
  const params: ScanCommandInput = {
    TableName: process.env.SCHEDULED_TABLE,
    FilterExpression: "#timestamp <= :currentTimestamp",
    ExpressionAttributeNames: {
      "#timestamp": "timestamp",
    },
    ExpressionAttributeValues: {
      ":currentTimestamp": {
        N: currentTimestamp.toString(),
      },
    },
  };
  const command = new ScanCommand(params);

  const output = await client.send(command);

  return output.Items;
}

export default getSchedules;
