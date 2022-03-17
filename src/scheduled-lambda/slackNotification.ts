import fetch from "node-fetch";
import { fromUnixTime, format } from "date-fns";

async function slackNotification({
  id,
  timestamp,
}: {
  id: string;
  timestamp: number;
}) {
  const date = fromUnixTime(timestamp);
  const formatedDate = format(date, "HH:mm dd-MM-yyyy ");

  const response = await fetch(process.env.SLACK_ENDPOINT ?? "", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: `:lemon: Buffer ${id} programmé pour le ${formatedDate} envoyé`,
    }),
  });
  return response.json();
}

export default slackNotification;
