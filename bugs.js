/* -------------------------
   Bug templates (web, api, business logic)
   ------------------------- */
const templates = {
  "Web": {
    "Recon": [
      "Find staging or development sites (exposed environments)",
      "Search JS files for API keys, endpoints, or secrets",
      "Directory brute-force hidden admin or UI paths",
      "Check robots.txt and sitemap for sensitive URLs",
      "Identify hidden subdomains or internal panels"
    ],
    "Injection": [
      "SQL Injection — authentication bypass or data leak",
      "Command Injection or RCE via input fields or file upload",
      "Server-Side Template Injection (SSTI)",
      "LDAP, XPath, or NoSQL Injection in filters or search boxes",
      "Insecure deserialization in file uploads or serialized data"
    ],
    "AuthAndSession": [
      "Weak session invalidation (reuse tokens after logout)",
      "JWT / SAML signature bypass or replay attacks",
      "Broken or bypassable MFA flow",
      "Password reset abuse (multiple or reusable links)",
      "Session fixation or predictable session IDs"
    ],
    "AccessControl": [
      "IDOR — access or modify another user’s data",
      "Broken Access Control — elevate role or privileges",
      "Mass assignment or parameter pollution via hidden fields",
      "Lack of server-side enforcement for restricted actions"
    ],
    "SensitiveData": [
      "Exposed backups, config, or internal files (/backup, /old, /.git)",
      "Leaked credentials or tokens in JS, .env, or source maps",
      "Exposed S3 buckets or cloud storage with public read",
      "Verbose error messages revealing stack traces or DB details"
    ],
    "MisconfigAndUI": [
      "Security headers missing (CSP, X-Frame-Options, etc.)",
      "CORS misconfiguration allowing unauthorized origin access",
      "Cache-control misconfig exposing private responses",
      "Clickjacking or mixed-content vulnerabilities"
    ]
  },

  "API": {
    "Discovery": [
      "Enumerate API endpoints via JS, certificates, or DNS history",
      "Discover undocumented endpoints or admin APIs",
      "Access exposed Swagger/OpenAPI documentation"
    ],
    "AuthAndSession": [
      "Sensitive endpoints exposed without authentication",
      "JWT validation weak or missing signature verification",
      "Token reuse after logout (no invalidation on server side)",
      "Missing rate limit or brute-force protection for auth endpoints"
    ],
    "AccessControl": [
      "IDOR via request body or path parameter (read/modify other user data)",
      "Privilege escalation by calling admin endpoints with user tokens",
      "Ownership checks missing in PUT/DELETE or PATCH APIs"
    ],
    "RateLimitingAndDoS": [
      "No rate limit on sensitive actions (login, OTP, password reset)",
      "Resource exhaustion via huge payloads or nested JSON",
      "Email or SMS flooding using public API endpoints"
    ],
    "InjectionAndProcessing": [
      "SQL or NoSQL injection through API parameters",
      "Command injection via import or conversion endpoints",
      "XML or template injection (XXE/SSTI) in parsing APIs"
    ],
    "SSRFAndServerCalls": [
      "SSRF via file upload or URL fetch features",
      "SSRF via JSON parameters referencing internal URLs"
    ],
    "DataExposure": [
      "Sensitive PII or tokens returned in JSON or error responses",
      "Unfiltered data exposure in list or debug endpoints",
      "Internal config, secrets, or debug info exposed via API"
    ],
    "Misconfiguration": [
      "Improper CORS allowing all origins with credentials",
      "Inconsistent auth checks between UI and API (UI blocks, API allows)",
      "Detailed stack traces or internal error codes exposed"
    ]
  },

  "BusinessLogic": {
    "CoreFlaws": [
      "Bypass payment validation — complete purchase without paying",
      "Tamper payment callback or webhook to mark order as paid",
      "Trust client-side price or discount (modify in request)",
      "Manipulate cart or total before checkout to reduce payment",
      "Issue refunds without verifying payment source or auth",
      "Abuse referral or bonus systems (multi-account farming)",
      "Access paid or premium content without valid purchase",
      "Reuse coupons or gift-cards beyond allowed usage",
      "Bypass geo or currency restrictions to exploit pricing"
    ],
    "AuthorizationAndFileAccess": [
      "403 Forbidden bypass via header, case, or method tampering",
      "Unauthorized file access through predictable file IDs or paths",
      "Access another user's private files (IDOR for documents)",
      "Admin-only endpoints accessible via direct URL call",
      "Access control only checked on client, not server",
      "Upload endpoints exposing other users’ files",
      "Bypass 403 by hitting internal service endpoints",
      "Access backups or logs in public directories"
    ],
    "WorkflowFlaws": [
      "Skip intermediate approval steps (manual review bypass)",
      "Replay requests to trigger double refund or duplicate order",
      "Exploit race condition during checkout or payment",
      "Reuse expired links or reset tokens",
      "Inconsistent multi-step workflow leaving exploitable states",
      "Force approval through replaying admin callback",
      "Combine multiple small flaws for high-impact outcome"
    ],
    "AbuseScenarios": [
      "Signup bonus abuse using disposable emails or fake accounts",
      "Redeem same reward multiple times by changing IDs",
      "Exploit ranking or loyalty systems for unlimited points",
      "Automate small actions to exceed rate limits undetected",
      "Cancel-after-benefit bugs (get reward, then refund)",
      "Bypass time or quantity limits by editing request body"
    ],
    "DataAndStateIntegrity": [
      "Change transaction or order state directly (e.g., mark completed)",
      "Force negative balance or credit overflow",
      "Exploit inconsistent API responses (client trusts false data)",
      "Tamper webhook events or external callback verification"
    ],
    "EdgeCasesAndMisconfig": [
      "Cross-tenant data access (multi-tenant flaw)",
      "Default shared resources accessible by all users",
      "Feature flags exposing admin or beta-only flows",
      "Obscured endpoints performing sensitive actions",
      "Business rules bypassed by unexpected input sequence"
    ]
  }
};
