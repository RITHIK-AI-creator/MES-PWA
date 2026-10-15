const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const https = require('https');

module.exports = function (app) {
  // =======================================================================
  // CONFIGURATION: Dynamic Environment Variables
  // These variables define the external URLs and tenant parameters dynamically.
  // =======================================================================
  const API_URL     = process.env.REACT_APP_API_URL     || 'https://atscmmes.usa.athenatec.com';
  const AUTH_URL    = process.env.REACT_APP_AUTH_URL    || 'https://atscmmes.usa.athenatec.com:9091';
  const TENANT_NAME = process.env.REACT_APP_TENANT_NAME || 'CriticalManufacturing';
  const CLIENT_ID   = process.env.REACT_APP_CLIENT_ID   || 'MES';
  const STRATEGY_ID = process.env.REACT_APP_AUTH_STRATEGY || 'ActiveDirectory';

  // Construct the redirect URL that the IDP needs to return to
  const encodedTarget = Buffer.from(`${API_URL}/`).toString('base64');
  const REDIRECT_URI  = `${API_URL}/iis/authentication/success?redirect_uri=${encodedTarget}`;

  // =======================================================================
  // AUTHENTICATION ENGINE: Server-Side Login Bypass
  // Performs the 6-step cookie-based redirect flow completely inside Node.js
  // to bypass Chrome's Cross-Site and SameSite cookie security restrictions.
  // =======================================================================
  app.post('/local-login', require('express').json(), async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    try {
      // Create an Axios instance that manually tracks cookies and ignores self-signed certs
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
          // Remove old cookie with the same name, then push the new one
          cookieJar = cookieJar.filter(existing => !existing.startsWith(`${cookieName}=`));
          cookieJar.push(cookieStr);
        });
      };

      // Step 0: Inject the "skip device" cookie required by the IDP
      const skipDeviceValue = encodeURIComponent(JSON.stringify([username.toUpperCase()]));
      cookieJar.push(`currentDevicesSkipWebAuthnRegistrationFlow=${skipDeviceValue}`);

      const baseAuthParams = { 
        username, 
        clientId: CLIENT_ID, 
        redirect_uri: REDIRECT_URI, 
        response_type: 'code' 
      };

      // Step 1: Initialize Login Session
      let resp = await wrapper.get(`${AUTH_URL}/tenant/${TENANT_NAME}/login`, {
        params: baseAuthParams,
        headers: { Cookie: getCookieHeader() }
      });
      updateCookies(resp.headers['set-cookie']);

      // Step 2: Select Auth Strategy
      resp = await wrapper.get(`${AUTH_URL}/tenant/${TENANT_NAME}/strategy/local/${STRATEGY_ID}/login`, {
        params: { ...baseAuthParams, strategyId: '' },
        headers: { Cookie: getCookieHeader() }
      });
      updateCookies(resp.headers['set-cookie']);

      // Scrape the full name from the HTML returned by Step 2
      let extractedFullName = '';
      if (resp.data && typeof resp.data === 'string') {
        const match = resp.data.match(/<h3>Welcome\s+(.*?)!<\/h3>/);
        if (match && match[1]) {
          extractedFullName = match[1].trim();
          console.log("Scraped full name from Auth Portal:", extractedFullName);
        }
      }

      // Step 3: POST Password Submission
      const params = new URLSearchParams();
      params.append('username', username.toUpperCase());
      params.append('password', password);
      params.append('client_id', CLIENT_ID);
      params.append('redirect_uri', REDIRECT_URI);
      params.append('response_type', 'code');
      params.append('strategyId', STRATEGY_ID);

      const postUrl = `${AUTH_URL}/tenant/${TENANT_NAME}/strategy/local/${STRATEGY_ID}/login?` + 
        `username=${encodeURIComponent(username)}&clientId=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&strategyId=`;

      resp = await wrapper.post(postUrl, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: getCookieHeader() }
      });
      updateCookies(resp.headers['set-cookie']);

      // Step 4: Follow all 302 Redirects manually until we get the access_token
      let safetyCounter = 0;
      while (resp.status === 302 && safetyCounter < 10) {
        let location = resp.headers.location;
        // Resolve relative paths back to absolute URLs
        if (!location.startsWith('http')) {
          location = location.startsWith('/iis') || location.startsWith('/api') 
            ? `${API_URL}${location}`
            : `${AUTH_URL}${location}`;
        }
        
        resp = await wrapper.get(location, { headers: { Cookie: getCookieHeader() } });
        updateCookies(resp.headers['set-cookie']);
        safetyCounter++;
      }

      // Step 5: Extract the final access_token and return it to the React UI
      const accessTokenStr = cookieJar.find(c => c.startsWith('access_token='));
      if (!accessTokenStr) {
        return res.status(500).json({ error: "Login flow finished but no access_token was found.", cookies: cookieJar });
      }

      const token = accessTokenStr.split('=')[1];
      res.json({ success: true, token: token, fullName: extractedFullName });
      
    } catch (err) {
      console.error("Node Backend Login Failed:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // =======================================================================
  // STANDARD API PROXIES
  // Routes frontend calls starting with /api or /auth-api to the backend
  // =======================================================================
  app.use('/auth-api', createProxyMiddleware({ target: AUTH_URL, changeOrigin: true, secure: false, pathRewrite: { '^/auth-api': '' } }));
  app.use('/iis',      createProxyMiddleware({ target: API_URL + '/iis',  changeOrigin: true, secure: false }));
  app.use('/api',      createProxyMiddleware({ target: API_URL + '/api',  changeOrigin: true, secure: false }));
  app.use('/tenant',   createProxyMiddleware({ target: AUTH_URL + '/tenant', changeOrigin: true, secure: false }));
};
