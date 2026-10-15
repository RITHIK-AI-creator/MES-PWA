const express = require('express');
const axios = require('axios');
const https = require('https');
const cors = require('cors');

const app = express();
app.use(cors()); // Allow cross-origin requests from the React app
app.use(express.json());

// Configuration dynamically loaded from public/config.js
const fs = require('fs');
const path = require('path');

let CONFIG = {};
try {
  // Read config.js from the folder where the .exe is running
  const configPath = fs.existsSync(path.join(process.cwd(), 'public', 'config.js')) 
    ? path.join(process.cwd(), 'public', 'config.js')
    : path.join(process.cwd(), 'config.js');
    
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  // Create a mock window object to capture the config
  const mockWindow = {};
  const evaluateConfig = new Function('window', configContent);
  evaluateConfig(mockWindow);
  
  CONFIG = mockWindow.APP_CONFIG || {};
  console.log("Successfully loaded configuration from config.js");
} catch (err) {
  console.error("Failed to load config.js, falling back to defaults.", err.message);
}

const API_URL     = CONFIG.API_URL;
const AUTH_URL    = CONFIG.AUTH_SERVER;
const TENANT_NAME = CONFIG.TENANT;
const CLIENT_ID   = CONFIG.CLIENT_ID;
const STRATEGY_ID = CONFIG.STRATEGY_ID;
const IIS_SUCCESS = CONFIG.IIS_SUCCESS;

const TENANT_LOGIN_PATH = CONFIG.TENANT_LOGIN_PATH;
const STRATEGY_LOGIN_PATH = CONFIG.STRATEGY_LOGIN_PATH;
const STRATEGY_LOGIN_QUERY_PARAMS = CONFIG.STRATEGY_LOGIN_QUERY_PARAMS;

const getTenantLoginUrl = () => `${AUTH_URL}${TENANT_LOGIN_PATH.replace('{TENANT_NAME}', TENANT_NAME)}`;
const getStrategyLoginUrl = () => `${AUTH_URL}${STRATEGY_LOGIN_PATH.replace('{TENANT_NAME}', TENANT_NAME).replace('{STRATEGY_ID}', STRATEGY_ID)}`;

const encodedTarget = Buffer.from(`${API_URL}/`).toString('base64');
const REDIRECT_URI  = `${API_URL}${IIS_SUCCESS}?redirect_uri=${encodedTarget}`;

app.post('/local-login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  try {
    const wrapper = axios.create({
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400,
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });

    let cookieJar = [];
    const getCookieHeader = () => cookieJar.join('; ');
    
    const updateCookies = (setCookieHeaders) => {
      if (!setCookieHeaders) return;
      setCookieHeaders.forEach(c => {
        const cookieStr = c.split(';')[0];
        const cookieName = cookieStr.split('=')[0];
        cookieJar = cookieJar.filter(existing => !existing.startsWith(`${cookieName}=`));
        cookieJar.push(cookieStr);
      });
    };

    const skipDeviceValue = encodeURIComponent(JSON.stringify([username.toUpperCase()]));
    cookieJar.push(`currentDevicesSkipWebAuthnRegistrationFlow=${skipDeviceValue}`);

    const baseAuthParams = { 
      username, 
      clientId: CLIENT_ID, 
      redirect_uri: REDIRECT_URI, 
      response_type: 'code' 
    };

    let resp = await wrapper.get(getTenantLoginUrl(), {
      params: baseAuthParams,
      headers: { Cookie: getCookieHeader() }
    });
    updateCookies(resp.headers['set-cookie']);

    resp = await wrapper.get(getStrategyLoginUrl(), {
      params: { ...baseAuthParams, strategyId: '' },
      headers: { Cookie: getCookieHeader() }
    });
    updateCookies(resp.headers['set-cookie']);

    let extractedFullName = '';
    if (resp.data && typeof resp.data === 'string') {
      const match = resp.data.match(/<h3>Welcome\s+(.*?)!<\/h3>/);
      if (match && match[1]) {
        extractedFullName = match[1].trim();
      }
    }

    const params = new URLSearchParams();
    params.append('username', username.toUpperCase());
    params.append('password', password);
    params.append('client_id', CLIENT_ID);
    params.append('redirect_uri', REDIRECT_URI);
    params.append('response_type', 'code');
    params.append('strategyId', STRATEGY_ID);

    const queryParams = STRATEGY_LOGIN_QUERY_PARAMS
      .replace('{USERNAME}', encodeURIComponent(username))
      .replace('{CLIENT_ID}', CLIENT_ID)
      .replace('{REDIRECT_URI}', encodeURIComponent(REDIRECT_URI));

    const postUrl = `${getStrategyLoginUrl()}${queryParams}`;

    resp = await wrapper.post(postUrl, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: getCookieHeader() }
    });
    updateCookies(resp.headers['set-cookie']);

    let safetyCounter = 0;
    while (resp.status === 302 && safetyCounter < 10) {
      let location = resp.headers.location;
      if (!location.startsWith('http')) {
        location = location.startsWith('/iis') || location.startsWith('/api') 
          ? `${API_URL}${location}`
          : `${AUTH_URL}${location}`;
      }
      resp = await wrapper.get(location, { headers: { Cookie: getCookieHeader() } });
      updateCookies(resp.headers['set-cookie']);
      safetyCounter++;
    }

    const accessTokenStr = cookieJar.find(c => c.startsWith('access_token='));
    if (!accessTokenStr) {
      return res.status(500).json({ error: "Login flow finished but no access_token was found.", cookies: cookieJar });
    }

    const token = accessTokenStr.split('=')[1];
    res.json({ success: true, token: token, fullName: extractedFullName });
    
  } catch (err) {
    console.error("Node Backend Login Failed:", err.message);
    const errorDetails = err.config ? `Error on URL: ${err.config.url}` : '';
    res.status(500).json({ error: err.message, details: errorDetails });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Standalone Authentication Proxy Server running on port ${PORT}`);
});
