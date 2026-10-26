# Production & Enterprise Credentials

> [!IMPORTANT]
> **CONFIDENTIAL — SYSTEM ADMINISTRATOR & PRODUCTION TEST ACCESS ONLY**  
> These credentials are for system administration, operational management, and authorized developer access.  
> As instructed, these credentials are **NEVER** displayed or exposed on the public SaaS web application or client interfaces.

---

## 1. System Administrator Account (Full Enterprise Access)

| Attribute | Value |
| :--- | :--- |
| **Email** | `admin@chatify.ai` |
| **Password** | `AdminSecure2026!` |
| **Role** | `admin` (Super Administrator) |
| **Primary Workspace** | `Chatify Enterprise HQ` (`ws-admin-hq`) |
| **Slug** | `chatify-enterprise` |
| **Capabilities** | Full administrative controls, multi-workspace switching, global analytics, security audit controls, and billing management |

---

## 2. Default Standard User Account (7-Day Trial / Starter)

| Attribute | Value |
| :--- | :--- |
| **Email** | `user@chatify.ai` |
| **Password** | `UserPass2026!` |
| **Role** | `user` (Practice / Business Owner) |
| **Primary Workspace** | `Nova Marketing Agency` (`ws-nova-agency`) |
| **Slug** | `nova-agency` |
| **Capabilities** | Dedicated business dashboard, chatbot studio, live chat inbox, lead management, and ROI tracking |

---

## 3. Dynamic Registered Accounts (Self-Service Signup)

When any client or practice signs up via `/signup`:
1. **Dual Verification**: Individual verification codes are required for **both** the user's **Email** and **Phone Number**.
2. **Dynamic Multi-Dashboard**: A brand-new isolated workspace (`Workspace`) is generated in real-time matching the user's entered practice name and custom URL slug (e.g., `/chat/smith-orthodontics?brand=Smith%20Orthodontics`).
3. **Workspace Isolation**: The user's dashboard only loads their own custom business metrics, chatbot, and leads. They can also create additional branch workspaces dynamically via the sidebar workspace switcher.

---

## 4. Verification & Testing

- **Login Page URL**: `/login` (No test buttons or demo credentials shown on the public UI)
- **Signup Page URL**: `/signup` (Individual dual verification active)
- **Dashboard URL**: `/dashboard` (Dynamically hydated with the logged-in user's workspace)
