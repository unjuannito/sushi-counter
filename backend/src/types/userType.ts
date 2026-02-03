export type User = {
  id: string;
  code: string;
  name: string;
  email?: string;
  password?: string;
  google_id?: string;
  google_email?: string;
  reset_token?: string;
  reset_token_expiry?: string;
  token_version?: number;
  refresh_token?: string;
};
