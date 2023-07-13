/* eslint-disable no-console */
import axios from '../utils/axios';

import { Reporter, NODE_ENV } from '../environments';

const sendLog = async (url: string, message: string) => {
  return await axios({
    url,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Reporter.BEARER_TOKEN}`,
    },
    data: {
      group_id: Reporter.GROUP_ID,
      message,
    },
  }).then((result) => result.data);
};

const margin_one = '=========================================================';
const margin = `${margin_one}\n${margin_one}\n${margin_one}`;

export const StartLogging = () => {
  if (NODE_ENV != 'local') {
    sendLog(
      Reporter.GIT_URL,
      `${margin}\n\nServer is Running on ${NODE_ENV}!\n${margin}`
    );
  }
};

interface ITrace {
  from: string;
  error: Error;
}
export const sendErrorLog = async ({ from, error }: ITrace) => {
  console.log({ error });
  const message = `ENV: ${NODE_ENV}\nFROM: ${from}\n${error.stack}`;
  return sendLog(Reporter.ERROR_URL, message);
};

export const sendBusinessLog = async (message: string) => {
  return sendLog(Reporter.BUSINESS_URL, message);
};
