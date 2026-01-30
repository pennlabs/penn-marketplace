import { NextResponse } from "next/server";

// All error messages
export const ErrorMessages = {
  MISSING_CLIENT_ID: "Missing client ID",
  MISSING_CLIENT_CREDENTIALS: "Missing client credentials",
  SERVER_CONFIGURATION: "Server configuration error",
  INTERNAL_SERVER: "Internal server error",
  NO_AUTHORIZATION_CODE: "No authorization code",
  TOKEN_EXCHANGE_FAILED: "Token exchange failed",
  AUTHENTICATION_FAILED: "Authentication failed",
  NO_ACCESS_TOKEN: "No valid access token available",
  API_REQUEST_FAILED: "API request failed",
} as const;

// custom error class with status code
export class APIError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "APIError";
  }
}

// helper to create NextResponse error
function createErrorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// All error responses
export const ErrorResponses = {
  missingClientId: () => createErrorResponse(ErrorMessages.MISSING_CLIENT_ID, 500),

  missingClientCredentials: () =>
    createErrorResponse(ErrorMessages.MISSING_CLIENT_CREDENTIALS, 500),

  serverConfiguration: () => createErrorResponse(ErrorMessages.SERVER_CONFIGURATION, 500),

  internalServer: () => createErrorResponse(ErrorMessages.INTERNAL_SERVER, 500),

  noAuthorizationCode: () => createErrorResponse(ErrorMessages.NO_AUTHORIZATION_CODE, 401),

  tokenExchangeFailed: () => createErrorResponse(ErrorMessages.TOKEN_EXCHANGE_FAILED, 401),

  authenticationFailed: () => createErrorResponse(ErrorMessages.AUTHENTICATION_FAILED, 401),
} as const;
