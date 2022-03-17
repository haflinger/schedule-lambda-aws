/* eslint-disable import/prefer-default-export */

import getSchedules from "./getSchedules";
import removeSchedules from "./removeSchedules";
import slackNotification from "./slackNotification";

async function handler() {
  const schedules = await getSchedules();

  if (!schedules) {
    throw new Error("Schedules is not defined");
  }

  const shedulesObject = schedules?.reduce((acc, { id, timestamp }) => {
    if (id.S && timestamp.N) {
      return {
        ...acc,
        [id.S]: { timestamp: Number.parseInt(timestamp.N, 10) },
      };
    }
    return acc;
  }, {} as Record<string, { timestamp: number }>);

  if (Object.keys(shedulesObject).length <= 0) {
    return true;
  }

  await Promise.allSettled(
    Object.keys(shedulesObject).map(async (key) => {
      slackNotification({
        id: key,
        timestamp: shedulesObject[key].timestamp,
      });
    })
  );

  return removeSchedules(Object.keys(shedulesObject));
}

export { handler };
