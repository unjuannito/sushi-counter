import 'dotenv/config';

export const config = {
  port: process.env.PORT || 50541,
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "sushi_counter",
  },
  accountDeletionDays: Number(process.env.ACCOUNT_DELETION_DAYS) || 30,
};
