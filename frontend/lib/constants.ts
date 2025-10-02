export const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "REPLACE WITH PROD BASE URL"
    : "http://localhost:3000";

export const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "REPLACE WITH PROD API URL"
    : "http://localhost:8000";

export const PLATFORM_URL = process.env.PLATFORM_URL;
export const CLIENT_ID = process.env.CLIENT_ID;
export const CLIENT_SECRET = process.env.CLIENT_SECRET;

export const OIDC_REDIRECT_URI = `${BASE_URL}/callback`; // TODO: needs to be /api/callback not /callback
export const OIDC_AUTHORIZATION_ENDPOINT = `${PLATFORM_URL}/accounts/authorize/`;
export const OIDC_TOKEN_ENDPOINT = `${PLATFORM_URL}/accounts/token/`;

export const COOKIE_OPTIONS: {
  httpOnly: boolean;
  secure: boolean;
} = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};
