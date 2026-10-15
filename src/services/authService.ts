import axios from 'axios';

export const authService = {
  /**
   * Complete automated background login flow via Node.js Backend.
   */
  async login(username: string, passwordEncoded: string) {
    try {
      // Get the login URL from the config, fallback to /local-login for local development
      const loginUrl = (typeof window !== "undefined" && (window as any).APP_CONFIG?.LOCAL_LOGIN_URL) 
        ? (window as any).APP_CONFIG.LOCAL_LOGIN_URL 
        : '/local-login';

      const response = await axios.post(loginUrl, {
        username: username,
        password: passwordEncoded
      });

      if (response.data && response.data.success) {
        const token = response.data.token;
        const fullName = response.data.fullName;
        
        // Now that Node.js extracted the real token, we manually save it to the browser cookies!
        // We do NOT use Secure or HttpOnly here because we need it to work on localhost!
        document.cookie = `access_token=${token}; path=/`;
        console.log("Token successfully acquired via Node.js Backend!");
        return { success: true, fullName };
      } else {
        throw new Error("Backend login failed.");
      }
    } catch (error: any) {
      console.error('Node.js Login flow failed:', error.response?.data || error);
      throw error;
    }
  }
};
