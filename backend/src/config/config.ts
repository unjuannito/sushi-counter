import './loadEnv';

export const config = {
  port: Number(process.env.PORT) || 3000,
  accountDeletionDays: Number(process.env.ACCOUNT_DELETION_DAYS) || 30,
};
