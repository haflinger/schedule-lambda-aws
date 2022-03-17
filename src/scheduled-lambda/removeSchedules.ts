import {
  DynamoDB,
  BatchWriteItemCommand,
  BatchWriteItemCommandInput,
} from "@aws-sdk/client-dynamodb";

async function removeSchedules(ids: string[]) {
  const client = new DynamoDB({ region: process.env.AWS_REGION });

  const params: BatchWriteItemCommandInput = {
    RequestItems: {
      [process.env.SCHEDULED_TABLE ?? ""]: ids.map((id) => ({
        DeleteRequest: {
          Key: {
            id: { S: id },
          },
        },
      })),
    },
  };
  const command = new BatchWriteItemCommand(params);

  const output = await client.send(command);

  return output.UnprocessedItems;
}

export default removeSchedules;
