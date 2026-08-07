const crypto = require("crypto");

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SEARCH_ANALYTICS_ENDPOINT = "https://searchconsole.googleapis.com/webmasters/v3/sites";
const WEBMASTERS_READONLY_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

function base64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function parseCredentials(env = process.env) {
  if (env.GSC_SERVICE_ACCOUNT_JSON) {
    const parsed = JSON.parse(env.GSC_SERVICE_ACCOUNT_JSON);
    return {
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key,
    };
  }

  return {
    clientEmail: env.GSC_SERVICE_ACCOUNT_EMAIL,
    privateKey: env.GSC_PRIVATE_KEY,
  };
}

function normalizePrivateKey(value) {
  return String(value || "").replace(/\\n/g, "\n");
}

function createJwtAssertion({ clientEmail, privateKey }, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (!clientEmail || !privateKey) {
    throw new Error("Google Search Console service account credentials are not configured.");
  }

  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: clientEmail,
    scope: WEBMASTERS_READONLY_SCOPE,
    aud: TOKEN_URL,
    exp: nowSeconds + 3600,
    iat: nowSeconds,
  };
  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(claim))}`;
  const signature = crypto
    .createSign("RSA-SHA256")
    .update(unsigned)
    .sign(normalizePrivateKey(privateKey));

  return `${unsigned}.${base64Url(signature)}`;
}

async function getAccessToken(credentials, fetchImpl = globalThis.fetch) {
  if (!fetchImpl) throw new Error("fetch is required to request a Google access token.");
  const assertion = createJwtAssertion(credentials);
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });
  const response = await fetchImpl(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Google token request failed: ${response.status} ${data.error || data.error_description || ""}`.trim());
  }
  if (!data.access_token) {
    throw new Error("Google token response did not include an access token.");
  }
  return data.access_token;
}

async function querySearchAnalytics({ siteUrl, accessToken, startDate, endDate, dimensions = ["date", "page", "query"], rowLimit = 25000 }, fetchImpl = globalThis.fetch) {
  if (!siteUrl) throw new Error("GSC site URL is required.");
  if (!accessToken) throw new Error("Google access token is required.");
  if (!startDate || !endDate) throw new Error("Search Analytics startDate and endDate are required.");
  const endpoint = `${SEARCH_ANALYTICS_ENDPOINT}/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions,
      rowLimit,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Search Analytics query failed: ${response.status} ${data.error && data.error.message ? data.error.message : ""}`.trim());
  }
  return data.rows || [];
}

function clientFromEnv(env = process.env, fetchImpl = globalThis.fetch) {
  const credentials = parseCredentials(env);
  const siteUrl = env.GSC_SITE_URL || "https://www.rofo.com/";
  return {
    siteUrl,
    async queryWindow({ startDate, endDate, dimensions, rowLimit }) {
      const accessToken = await getAccessToken(credentials, fetchImpl);
      return querySearchAnalytics({ siteUrl, accessToken, startDate, endDate, dimensions, rowLimit }, fetchImpl);
    },
  };
}

module.exports = {
  TOKEN_URL,
  WEBMASTERS_READONLY_SCOPE,
  parseCredentials,
  createJwtAssertion,
  getAccessToken,
  querySearchAnalytics,
  clientFromEnv,
};
