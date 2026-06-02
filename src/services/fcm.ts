import admin from 'firebase-admin';
import { config } from '../config/config';

const firebaseInitialized = () => {
  if (admin.apps.length > 0) return;

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.firebase.projectId,
      clientEmail: config.firebase.clientEmail,
      privateKey: config.firebase.privateKey?.replace(/\\n/g, '\n')
    } as admin.ServiceAccount)
  });
};

export const sendPushToTokens = async (
  tokens: string[],
  payload: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }
) => {
  firebaseInitialized();

  if (!tokens.length) {
    return {
      successCount: 0,
      failureCount: 0,
      failedTokens: [] as string[]
    };
  }

  const message: admin.messaging.MulticastMessage = {
    tokens,
    notification: {
      title: payload.title,
      body: payload.body
    },
    data: payload.data ?? {}
  };

  const response = await admin.messaging().sendEachForMulticast(message);

  const failedTokens = response.responses
    .map((r, idx) => (!r.success ? tokens[idx] : null))
    .filter((t): t is string => Boolean(t));

  return {
    successCount: response.successCount,
    failureCount: response.failureCount,
    failedTokens
  };
};