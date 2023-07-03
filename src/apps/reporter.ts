/* eslint-disable no-console */
import axios from '../utils/axios';

import { Server, Reporter, Swagger, NODE_ENV } from '../environments';

const margin =
  '=========================================================\n=========================================================\n=========================================================';

export const sendErrorLog = async (message: string) => {
  return await axios({
    url: Reporter.ERROR_URL,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Reporter.BEARER_TOKEN}`
    },
    data: {
      group_id: Reporter.GROUP_ID,
      message
    }
  }).then((result) => result.data);
};

interface ITrace {
  from: string;
  message: string;
}
export const StartLogging = () => {
  if (!Server.isLocal) {
    sendErrorLog(`${margin}\n\nServer is Running on ${NODE_ENV}!\n\n${margin}`);
  }
  process.on('uncaughtException', ({ from, message }: ITrace) => {
    console.error({ from, message });
    try {
      if (!Server.isLocal)
        sendErrorLog(
          `APP_NAME: ${Swagger.APP_NAME}\nENV: ${NODE_ENV}\nFROM: ${from}\nERROR: ${message}`
        );
    } catch (error_send) {
      console.info({ error_send });
    }
  });
  console.log(`✅ Logger is Ready...`);
};
