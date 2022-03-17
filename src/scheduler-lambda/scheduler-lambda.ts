/* eslint-disable import/prefer-default-export */
import type {
  APIGatewayEvent,
  APIGatewayProxyCallback,
  Context,
} from "aws-lambda";
import { formatISO, fromUnixTime } from "date-fns";
import bodySchema from "./bodySchema";
import createScheduled from "./createScheduled";

async function handler(
  event: APIGatewayEvent,
  context: Context,
  callback: APIGatewayProxyCallback
) {
  try {
    if (event.httpMethod === "POST") {
      const body = event?.body ? JSON.parse(event?.body) : {};

      const { id, timestamp }: { id: string; timestamp: number } =
        await bodySchema.validateAsync(body);

      const eventDate = fromUnixTime(timestamp);
      const isoDate = formatISO(eventDate);

      await createScheduled({
        id,
        timestamp,
      });

      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          scheduled: isoDate,
        }),
      });
    }

    return callback(null, {
      statusCode: 404,
      body: JSON.stringify({
        message: "Not found",
      }),
    });
  } catch (err) {
    return callback(err as Error);
  }
}

export { handler };
