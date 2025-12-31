/* -------------------------
   Bug templates (web, api, business logic)
   ------------------------- */

const templates = {
  "Javascript": {
    "Recon": [
      { text: "Find staging or development sites (exposed environments)", severity: "Low" },
      { text: "Search JS files for API keys, endpoints, or secrets", severity: "Medium" },
      { text: "Directory brute-force hidden admin or UI paths", severity: "Medium" },
      { text: "Check robots.txt and sitemap for sensitive URLs", severity: "Low" },
      { text: "Identify hidden subdomains or internal panels", severity: "Medium" }
    ],
    "Injection": [
      { text: "SQL Injection — authentication bypass or data leak", severity: "Critical" },
      { text: "Command Injection or RCE via input fields or file upload", severity: "Critical" },
      { text: "Server-Side Template Injection (SSTI)", severity: "High" },
      { text: "LDAP, XPath, or NoSQL Injection in filters or search boxes", severity: "High" },
      { text: "Insecure deserialization in file uploads or serialized data", severity: "High" }
    ],
    "AuthAndSession": [
      { text: "Weak session invalidation (reuse tokens after logout)", severity: "Medium" },
      { text: "JWT / SAML signature bypass or replay attacks", severity: "High" },
      { text: "Broken or bypassable MFA flow", severity: "High" },
      { text: "Password reset abuse (multiple or reusable links)", severity: "Medium" },
      { text: "Session fixation or predictable session IDs", severity: "High" }
    ],
    "AccessControl": [
      { text: "IDOR — access or modify another user’s data", severity: "High" },
      { text: "Broken Access Control — elevate role or privileges", severity: "Critical" },
      { text: "Mass assignment or parameter pollution via hidden fields", severity: "High" },
      { text: "Lack of server-side enforcement for restricted actions", severity: "High" }
    ],
    "SensitiveData": [
      { text: "Exposed backups, config, or internal files (/backup, /old, /.git)", severity: "Medium" },
      { text: "Leaked credentials or tokens in JS, .env, or source maps", severity: "High" },
      { text: "Exposed S3 buckets or cloud storage with public read", severity: "Critical" },
      { text: "Verbose error messages revealing stack traces or DB details", severity: "Low" }
    ],
    "MisconfigAndUI": [
      { text: "Security headers missing (CSP, X-Frame-Options, etc.)", severity: "Low" },
      { text: "CORS misconfiguration allowing unauthorized origin access", severity: "Medium" },
      { text: "Cache-control misconfig exposing private responses", severity: "Medium" },
      { text: "Clickjacking or mixed-content vulnerabilities", severity: "Low" }
    ]
  },

  "API": {
    "Discovery": [
      { text: "Enumerate API endpoints via JS, certificates, or DNS history", severity: "Low" },
      { text: "Discover undocumented endpoints or admin APIs", severity: "Medium" },
      { text: "Access exposed Swagger/OpenAPI documentation", severity: "Low" }
    ],
    "AuthAndSession": [
      { text: "Sensitive endpoints exposed without authentication", severity: "High" },
      { text: "JWT validation weak or missing signature verification", severity: "High" },
      { text: "Token reuse after logout (no invalidation on server side)", severity: "Medium" },
      { text: "Missing rate limit or brute-force protection for auth endpoints", severity: "Medium" }
    ],
    "AccessControl": [
      { text: "IDOR via request body or path parameter (read/modify other user data)", severity: "High" },
      { text: "Privilege escalation by calling admin endpoints with user tokens", severity: "Critical" },
      { text: "Ownership checks missing in PUT/DELETE or PATCH APIs", severity: "High" }
    ],
    "RateLimitingAndDoS": [
      { text: "No rate limit on sensitive actions (login, OTP, password reset)", severity: "Medium" },
      { text: "Resource exhaustion via huge payloads or nested JSON", severity: "High" },
      { text: "Email or SMS flooding using public API endpoints", severity: "Medium" }
    ],
    "InjectionAndProcessing": [
      { text: "SQL or NoSQL injection through API parameters", severity: "Critical" },
      { text: "Command injection via import or conversion endpoints", severity: "Critical" },
      { text: "XML or template injection (XXE/SSTI) in parsing APIs", severity: "High" }
    ],
    "SSRFAndServerCalls": [
      { text: "SSRF via file upload or URL fetch features", severity: "High" },
      { text: "SSRF via JSON parameters referencing internal URLs", severity: "High" }
    ],
    "DataExposure": [
      { text: "Sensitive PII or tokens returned in JSON or error responses", severity: "High" },
      { text: "Unfiltered data exposure in list or debug endpoints", severity: "Medium" },
      { text: "Internal config, secrets, or debug info exposed via API", severity: "Critical" }
    ],
    "Misconfiguration": [
      { text: "Improper CORS allowing all origins with credentials", severity: "High" },
      { text: "Inconsistent auth checks between UI and API (UI blocks, API allows)", severity: "Medium" },
      { text: "Detailed stack traces or internal error codes exposed", severity: "Low" }
    ]
  },

  "BusinessLogic": {
    "CoreFlaws": [
      { text: "Bypass payment validation — complete purchase without paying", severity: "Critical" },
      { text: "Tamper payment callback or webhook to mark order as paid", severity: "Critical" },
      { text: "Trust client-side price or discount (modify in request)", severity: "High" },
      { text: "Manipulate cart or total before checkout to reduce payment", severity: "High" },
      { text: "Issue refunds without verifying payment source or auth", severity: "High" },
      { text: "Abuse referral or bonus systems (multi-account farming)", severity: "Medium" },
      { text: "Access paid or premium content without valid purchase", severity: "High" },
      { text: "Reuse coupons or gift-cards beyond allowed usage", severity: "Medium" },
      { text: "Bypass geo or currency restrictions to exploit pricing", severity: "Medium" }
    ],
    "AuthorizationAndFileAccess": [
      { text: "403 Forbidden bypass via header, case, or method tampering", severity: "Medium" },
      { text: "Unauthorized file access through predictable file IDs or paths", severity: "High" },
      { text: "Access another user's private files (IDOR for documents)", severity: "High" },
      { text: "Admin-only endpoints accessible via direct URL call", severity: "Critical" },
      { text: "Access control only checked on client, not server", severity: "Critical" },
      { text: "Upload endpoints exposing other users’ files", severity: "High" },
      { text: "Bypass 403 by hitting internal service endpoints", severity: "Medium" },
      { text: "Access backups or logs in public directories", severity: "Low" }
    ],
    "WorkflowFlaws": [
      { text: "Skip intermediate approval steps (manual review bypass)", severity: "High" },
      { text: "Replay requests to trigger double refund or duplicate order", severity: "High" },
      { text: "Exploit race condition during checkout or payment", severity: "High" },
      { text: "Reuse expired links or reset tokens", severity: "Medium" },
      { text: "Inconsistent multi-step workflow leaving exploitable states", severity: "Medium" },
      { text: "Force approval through replaying admin callback", severity: "High" },
      { text: "Combine multiple small flaws for high-impact outcome", severity: "Critical" }
    ],
    "AbuseScenarios": [
      { text: "Signup bonus abuse using disposable emails or fake accounts", severity: "Low" },
      { text: "Redeem same reward multiple times by changing IDs", severity: "Medium" },
      { text: "Exploit ranking or loyalty systems for unlimited points", severity: "High" },
      { text: "Automate small actions to exceed rate limits undetected", severity: "Medium" },
      { text: "Cancel-after-benefit bugs (get reward, then refund)", severity: "High" },
      { text: "Bypass time or quantity limits by editing request body", severity: "High" }
    ],
    "DataAndStateIntegrity": [
      { text: "Change transaction or order state directly (e.g., mark completed)", severity: "Critical" },
      { text: "Force negative balance or credit overflow", severity: "Critical" },
      { text: "Exploit inconsistent API responses (client trusts false data)", severity: "Medium" },
      { text: "Tamper webhook events or external callback verification", severity: "High" }
    ],
    "EdgeCasesAndMisconfig": [
      { text: "Cross-tenant data access (multi-tenant flaw)", severity: "Critical" },
      { text: "Default shared resources accessible by all users", severity: "High" },
      { text: "Feature flags exposing admin or beta-only flows", severity: "Medium" },
      { text: "Obscured endpoints performing sensitive actions", severity: "Medium" },
      { text: "Business rules bypassed by unexpected input sequence", severity: "High" }
    ]
  }
};
