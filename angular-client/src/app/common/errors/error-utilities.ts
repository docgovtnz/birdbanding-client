export const enum ErrorType {
  NONE,
  CLIENT,
  SERVER,
}

export const SERVER_ERROR: SubmissionError = {
  hasError: true,
  errorType: ErrorType.SERVER,
};

export const CLIENT_ERROR: SubmissionError = {
  hasError: true,
  errorType: ErrorType.CLIENT,
};

export const NO_ERROR: SubmissionError = {
  errorType: ErrorType.NONE,
  hasError: false,
};

export interface SubmissionError {
  hasError: boolean;
  errorType: ErrorType;
}

export interface ErrorDetail {
  name: string;
  statusCode: number;
  errorCode: number;
  details: {
    type: string;
    message: string;
    data: {
      path: string;
      value: string;
      schema: string;
    };
  };
}

export interface ApiError {
  message: string;
  property: string;
}
export interface FullApiError extends ApiError {
  code: number;
  type: string;
  severity: string;
  message: string;
  keyword: string;
  property: string;
  value: string;
}

export const isServerError = (errorCode: number): boolean => {
  return errorCode > 500 || errorCode === 0;
};

export const isBadRequest = (errorCode: number): boolean => {
  return errorCode === 400;
};
