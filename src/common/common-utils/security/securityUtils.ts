

import { SECURITY_TIMEOUTS } from "@/common/common-constants/BoundaryConstants";

export const generateCSRFToken = (): string => {

  const array = new Uint8Array(32);

  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {

    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
};

class CSRFTokenManager {

  private static readonly TOKEN_KEY = "csrf_token";

  private static readonly TOKEN_EXPIRY_KEY = "csrf_token_expiry";

  private static readonly TOKEN_LIFETIME = SECURITY_TIMEOUTS.CSRF_TOKEN_LIFETIME_MS;

  static getToken(): string {
    try {
      const token = sessionStorage.getItem(this.TOKEN_KEY);
      const expiry = sessionStorage.getItem(this.TOKEN_EXPIRY_KEY);

      if (!token || !expiry || Date.now() > Number.parseInt(expiry, 10)) {
        return this.refreshToken();
      }

      return token;
    } catch {

      return generateCSRFToken();
    }
  }

  static refreshToken(): string {
    const token = generateCSRFToken();

    const expiry = Date.now() + this.TOKEN_LIFETIME;

    try {
      sessionStorage.setItem(this.TOKEN_KEY, token);
      sessionStorage.setItem(this.TOKEN_EXPIRY_KEY, expiry.toString());
    } catch {

    }

    return token;
  }

  static validateToken(token: string): boolean {
    const storedToken = this.getToken();

    return token === storedToken && token.length === 64;
  }

  static clearToken(): void {
    try {
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    } catch {

    }
  }
}

export { CSRFTokenManager };

export const getSecureHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    "X-CSRF-Token": CSRFTokenManager.getToken(),
  };

  if (!__DEV__) {
    headers["Strict-Transport-Security"] =
      "max-age=31536000; includeSubDomains";
    headers["X-Content-Type-Options"] = "nosniff";
    headers["X-Frame-Options"] = "DENY";
    headers["X-XSS-Protection"] = "1; mode=block";
    headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
  }

  return headers;
};

export const secureFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {

  const secureOptions: RequestInit = {
    ...options,
    headers: {
      ...getSecureHeaders(),
      ...options.headers,
    },
    credentials: "same-origin",
    mode: "cors",
    cache: "no-cache",
  };

  if (options.body && typeof options.body === "string") {
    try {

      const bodyObject = JSON.parse(options.body);

      bodyObject._csrfToken = CSRFTokenManager.getToken();

      secureOptions.body = JSON.stringify(bodyObject);
    } catch {

    }
  }

  const response = await fetch(url, secureOptions);

  if (!__DEV__ && !response.headers.get("X-Content-Type-Options")) {
    SecurityLogger.logEvent({
      type: "system_error",
      details: "Response missing security headers",
    });
  }

  return response;
};

export const getCSPHeader = (): string => {
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ];

  return cspDirectives.join("; ");
};

export const safeStringCompare = (a: string, b: string): boolean => {

  if (a.length !== b.length) {
    return false;
  }

  let result = 0;

  const aArray = [...a];
  const bArray = [...b];

  for (let i = 0; i < aArray.length; i++) {
    const charA = aArray[i];
    const charB = bArray[i];
    if (!charA || !charB) {
      result |= 1;
      continue;
    }

    const codePointA = charA.codePointAt(0) ?? 0;
    const codePointB = charB.codePointAt(0) ?? 0;

    result |= codePointA ^ codePointB;
  }

  return result === 0;
};

export const sanitizeIP = (ip: string): string => {
  if (!ip || typeof ip !== "string") {
    return "0.0.0.0";
  }

  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ip)) {

    const parts = ip.split(".");
    const validParts = parts.map((part) => {

      const num = Number.parseInt(part, 10);

      return num >= 0 && num <= 255 ? part : "0";
    });
    return validParts.join(".");
  }

  return "0.0.0.0";
};

class RateLimiter {

  private static readonly buckets = new Map<
    string,
    { tokens: number; lastRefill: number }
  >();

  private static readonly BUCKET_SIZE = 10;

  private static readonly REFILL_RATE = 1;

  static isAllowed(identifier: string): boolean {
    const now = Date.now();

    const bucket = this.buckets.get(identifier) || {
      tokens: this.BUCKET_SIZE,
      lastRefill: now,
    };

    const timePassed = (now - bucket.lastRefill) / 1000;

    bucket.tokens = Math.min(
      this.BUCKET_SIZE,
      bucket.tokens + timePassed * this.REFILL_RATE
    );
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      this.buckets.set(identifier, bucket);
      return true;
    }

    this.buckets.set(identifier, bucket);
    return false;
  }

  static reset(identifier: string): void {
    this.buckets.delete(identifier);
  }

  static clearOldBuckets(): void {
    const now = Date.now();

    for (const [id, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefill > SECURITY_TIMEOUTS.RATE_LIMIT_BUCKET_MAX_AGE_MS) {
        this.buckets.delete(id);
      }
    }
  }
}

export { RateLimiter };

export interface SecurityEvent {

  type:
    | "csrf_violation"
    | "xss_attempt"
    | "rate_limit_exceeded"
    | "invalid_input"
    | "unauthorized_access"
    | "user_logout"
    | "encryption_error"
    | "encryption_warning"
    | "system_event"
    | "system_error";
  userId?: string;
  ip?: string;
  userAgent?: string;
  details?: string;
  timestamp: Date;
}

class SecurityLogger {

  private static events: SecurityEvent[] = [];

  private static readonly MAX_EVENTS = 1000;

  static logEvent(event: Omit<SecurityEvent, "timestamp">): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
    };

    this.events.push(fullEvent);

    if (this.events.length > this.MAX_EVENTS) {
      this.events.shift();
    }

    if (
      ["csrf_violation", "xss_attempt", "unauthorized_access"].includes(
        event.type
      )
    ) {

    }
  }

  static getEvents(type?: SecurityEvent["type"]): SecurityEvent[] {
    if (type) {

      return this.events.filter((event) => event.type === type);
    }

    return [...this.events];
  }

  static clearEvents(): void {
    this.events = [];
  }
}

export { SecurityLogger };

export const securityMiddleware = {

  validateCSRF: (token: string): boolean => {
    const isValid = CSRFTokenManager.validateToken(token);
    if (!isValid) {
      SecurityLogger.logEvent({
        type: "csrf_violation",
        details: "Invalid CSRF token provided",
      });
    }
    return isValid;
  },

  checkRateLimit: (identifier: string): boolean => {
    const isAllowed = RateLimiter.isAllowed(identifier);
    if (!isAllowed) {
      SecurityLogger.logEvent({
        type: "rate_limit_exceeded",
        details: `Rate limit exceeded for: ${identifier}`,
      });
    }
    return isAllowed;
  },

  validateInput: (input: unknown): boolean => {
    if (typeof input === "string") {
      const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      ];

      for (const pattern of xssPatterns) {
        if (pattern.test(input)) {
          SecurityLogger.logEvent({
            type: "xss_attempt",

            details: `XSS pattern detected: ${input.substring(0, 100)}`,
          });
          return false;
        }
      }
    }
    return true;
  },
};
