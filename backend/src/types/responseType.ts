export type ErrorResponse =
    | {
        success: false;
        errorMessage: string;
    }
    | {
        success: false;
        errorsMessages: string[];
    };

export type SuccessResponse<K extends string, T> = {
    success: true;
} & {
    [P in K]: T;
};

export type Response<K extends string = string, T = any> =
    | ErrorResponse
    | SuccessResponse<K, T>;
