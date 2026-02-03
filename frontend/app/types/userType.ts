export type User = {
    id: string;
    code: string;
    name: string;
    email?: string;
    google_id?: string;
    google_email?: string;
    isGoogleLinked?: boolean;
    googleEmail?: string;
    hasPassword?: boolean;
};
