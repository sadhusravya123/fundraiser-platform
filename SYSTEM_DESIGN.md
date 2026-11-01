# System Design Document: KindWave Fundraiser Platform (MERN Stack)

---

## 1. Executive Summary & Objective

**KindWave** is a high-trust, responsive, full-stack crowdfunding and charitable donation web application. The platform connects campaign organizers seeking financial assistance for causes (such as Medical, Education, Environment, Animal Welfare, Community, and Emergency relief) with compassionate donors globally.

This document details the complete end-to-end **System Architecture**, encompassing high-level distributed components, database schema and entity-relationship models, low-level component designs, concurrency and atomic transaction patterns, security policies, and performance scalability strategies.

---

## 2. Requirements Engineering

### 2.1 Functional Requirements (FR)
1. **User Management & RBAC**:
   - Registration, login, and secure session management via signed JWTs and salted password hashing (`bcryptjs`).
   - Role-Based Access Control distinguishing standard Users (Organizers & Donors) and Platform Administrators.
2. **Campaign Lifecycle Management**:
   - Campaign creation with target goals, future deadlines, categorized causes, and rich media assets.
   - Live card preview before publication.
   - Campaign editing and deletion restricted strictly to the author or authorized administrators.
   - Milestone updates posted to the campaign timeline.
3. **Donation Processing & Financial Ledger**:
   - Flexible contribution tiers (presets: $10, $25, $50, $100, $250, $500, or custom amounts).
   - Anonymous donor support.
   - Atomic update of campaign financial stats (`raisedAmount`, `donorCount`, `progressPercentage`).
   - Generation of cryptographic demo transaction receipts with unique tracking IDs.
4. **Discovery & Exploration**:
   - Search by keyword/text across titles and descriptions.
   - Multi-facet filtering by category and status (`active`, `completed`).
   - Multi-mode sorting (`newest`, `most-funded`, `deadline`, `goal-high`, `goal-low`).
5. **Dashboards & Administrative Governance**:
   - User Dashboard: Track personal contributions, active campaigns, and access receipts.
   - Admin Console: Platform metrics (total funds, total users, total donations), moderation controls (activate, reject, approve, delete campaigns), and audit logs.

### 2.2 Non-Functional Requirements (NFR)
- **Data Integrity & Consistency**: Financial figures (`raisedAmount`, `donorCount`) must remain strictly consistent, preventing lost updates during concurrent donation spikes.
- **Latency & Performance**: Read endpoints (explore, campaign details) must respond within $<150\text{ ms}$ under standard loads.
- **Availability**: High availability ($99.9\%$), architected for stateless application scaling.
- **Security**: Zero plaintext password storage, protection against unauthorized state modification, strict role verification at the API layer.
- **Auditability**: Every donation must generate an immutable transaction record tied to donor identifiers and campaign references.

---

## 3. High-Level Architecture (HLD)

KindWave is structured following a **3-Tier Modular Client-Server Architecture**:

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer (Presentation)"]
        UI["React 18 SPA (Vite)"]
        Router["React Router v6"]
        State["Auth & Toast Context"]
        AxiosClient["Axios HTTP Interceptor"]
        UI --> Router
        Router --> State
        State --> AxiosClient
    end

    subgraph GatewayLayer ["Network / Gateway"]
        ReverseProxy["Reverse Proxy / Vite Proxy (Port 5173 -> 5000)"]
        CORS["CORS & Origin Filtering"]
        AxiosClient -->|"HTTP / REST API (JSON + Bearer JWT)"| ReverseProxy
        ReverseProxy --> CORS
    end

    subgraph AppLayer ["Application Tier (Node.js & Express.js)"]
        AuthMiddleware["JWT Auth & RBAC Middleware"]
        RouterModule["Express Router Pipeline"]
        CORS --> AuthMiddleware
        AuthMiddleware --> RouterModule

        subgraph Modules ["Controllers & Business Logic"]
            AuthCtrl["Auth Controller"]
            CampCtrl["Campaign Controller"]
            DonCtrl["Donation Controller"]
            DashCtrl["Dashboard Controller"]
        end

        RouterModule --> AuthCtrl
        RouterModule --> CampCtrl
        RouterModule --> DonCtrl
        RouterModule --> DashCtrl
    end

    subgraph DataLayer ["Data Tier (Database)"]
        Mongoose["Mongoose ODM Engine"]
        MongoDB[(MongoDB Server - Port 27017)]
        AuthCtrl --> Mongoose
        CampCtrl --> Mongoose
        DonCtrl --> Mongoose
        DashCtrl --> Mongoose
        Mongoose -->|"BSON / Wire Protocol"| MongoDB
    end
```

---

## 4. Low-Level Component Design (LLD)

### 4.1 Client Layer Architecture
- **State Management**:
  - `AuthContext`: Maintains reactive user credentials, authentication status, and role privileges; synchronizes with `localStorage` for session persistence across page refreshes.
  - `ToastContext`: Global message queue rendering animated toast notifications.
- **API Communication & Interceptor Pipeline**:
  - Centralized Axios instance (`api.js`).
  - Request Interceptor: Automatically inspects `localStorage` and injects `Authorization: Bearer <token>` into outgoing requests.
  - Response Interceptor: Catches HTTP 401 Unauthorized responses, clears stale sessions, and routes users to `/login`.
- **Route Guards**:
  - `ProtectedRoute`: Blocks unauthenticated users from creating campaigns or accessing the dashboard.
  - `AdminRoute`: Validates both session presence and `user.role === 'admin'`.

### 4.2 Server Pipeline Architecture
```mermaid
sequenceDiagram
    autonumber
    actor Client as User / Browser
    participant Router as Express Router
    participant MW as Auth Middleware
    participant Ctrl as Donation Controller
    participant DB as MongoDB (Mongoose)

    Client->>Router: POST /api/donations (Payload + Bearer Token)
    Router->>MW: optionalAuth / verifyToken
    MW-->>Router: Attach req.user (if valid)
    Router->>Ctrl: createDonation(req, res)
    Ctrl->>DB: Campaign.findById(campaignId)
    DB-->>Ctrl: Campaign Document
    Ctrl->>Ctrl: Validate Amount & Generate Transaction ID
    Ctrl->>DB: Donation.create({ ...donationData })
    DB-->>Ctrl: Saved Donation Document
    Ctrl->>DB: Campaign.findByIdAndUpdate($inc: { raisedAmount, donorCount })
    DB-->>Ctrl: Updated Campaign Document
    Ctrl-->>Client: HTTP 201 Created (Donation & Updated Stats)
```

---

## 5. Database Schema & Data Models

The system uses three core Mongoose collections: `users`, `campaigns`, and `donations`.

```mermaid
erDiagram
    USER ||--o{ CAMPAIGN : "organizes / creates"
    USER ||--o{ DONATION : "contributes"
    CAMPAIGN ||--o{ DONATION : "receives"

    USER {
        ObjectId _id PK
        string name
        string email UK
        string passwordHash
        string role "user | admin"
        string avatar
        date createdAt
        date updatedAt
    }

    CAMPAIGN {
        ObjectId _id PK
        string title
        string shortDescription
        string description
        string category "Medical | Education | Environment | ..."
        string image
        number goalAmount
        number raisedAmount
        number donorCount
        date deadline
        ObjectId organizer FK
        string status "active | completed | pending | rejected"
        boolean featured
        array updates "Sub-documents"
        date createdAt
        date updatedAt
    }

    DONATION {
        ObjectId _id PK
        ObjectId campaign FK
        ObjectId donor FK "nullable"
        string donorName
        string donorEmail
        number amount
        string message
        boolean isAnonymous
        string paymentStatus "completed | pending | demo"
        string transactionId UK
        string paymentMethod
        date createdAt
        date updatedAt
    }
```

### 5.1 Data Modeling Strategies & Trade-Offs

#### Normalization vs. Denormalization (Financial Stats)
- **Design Decision**: Instead of running a costly MongoDB aggregation (`$sum: "$amount"`) across thousands of donation documents every time a user views a campaign card or browse page, the `Campaign` schema denormalizes two integer counters:
  - `raisedAmount`: Current accumulated total.
  - `donorCount`: Total successful contributors.
- **Integrity Guarantee**: Handled via MongoDB atomic update operators (`$inc`). Every successful donation transaction updates both the child record and the parent counters simultaneously in the controller.
- **Virtual Property**:
  ```javascript
  campaignSchema.virtual('progressPercentage').get(function () {
    if (!this.goalAmount || this.goalAmount <= 0) return 0;
    return Math.round((this.raisedAmount / this.goalAmount) * 100);
  });
  ```

---

## 6. Concurrency & Transaction Management

### 6.1 The Lost Update Problem
In crowdfunding platforms, popular campaigns often experience rapid concurrent donations. If two users donate \$100 and \$50 simultaneously:

$$\text{Initial: } \$1,000$$

- **Naive Read-Modify-Write**:
  - Request A reads `raisedAmount = 1000`, calculates $1000 + 100 = 1100$.
  - Request B reads `raisedAmount = 1000`, calculates $1000 + 50 = 1050$.
  - Request A writes `1100`.
  - Request B overwrites with `1050` (*\$100 donation lost!*).

- **KindWave Implementation (Atomic Update)**:
  ```javascript
  await Campaign.findByIdAndUpdate(campaign._id, {
    $inc: { raisedAmount: numAmount, donorCount: 1 }
  });
  ```
  MongoDB processes `$inc` operations atomically at the document level via internal lock-free atomics, ensuring that even under heavy concurrent loads:
  $$\text{Final: } \$1,000 + \$100 + \$50 = \$1,150$$

---

## 7. Security & Authorization Architecture

```mermaid
flowchart LR
    subgraph Client ["Client Request"]
        Token["Authorization: Bearer <JWT>"]
    end

    subgraph MiddlewareLayer ["Express Security Pipeline"]
        Verify["verifyToken Middleware"]
        CheckRole["requireAdmin Middleware"]
    end

    subgraph Resources ["Protected Controller"]
        UserAction["User Action (Create Campaign / Donate)"]
        AdminAction["Admin Moderation (Status Update / Audit)"]
    end

    Token --> Verify
    Verify -->|"Valid Token"| UserAction
    Verify -->|"Token + role === 'admin'"| CheckRole
    CheckRole -->|"Admin Confirmed"| AdminAction
    Verify -->|"Invalid / Missing"| Err401["HTTP 401 Unauthorized"]
    CheckRole -->|"Non-Admin Role"| Err403["HTTP 403 Forbidden"]
```

1. **Password Encryption**: `bcryptjs` with auto-generated salt rounds ($10$ rounds) prevents rainbow-table lookups.
2. **Stateless JWT**:
   - Payload: `{ id: user._id, email: user.email, role: user.role }`.
   - Signed with `JWT_SECRET` using HMAC SHA-256 with 7-day expiration.
3. **Defense-in-Depth for Administrative Routes**:
   - Frontend route hiding via `<AdminRoute>` prevents unauthorized UI rendering.
   - Server-side middleware (`requireAdmin`) validates that `req.user.role === 'admin'` before executing controller operations. Modifying client `localStorage` does not grant backend admin access.

---

## 8. Scalability & Performance Strategy

### 8.1 Read/Write Traffic Profiling
- **Read-Heavy Ratio ($\approx 95:5$)**: The vast majority of traffic is users discovering, searching, and reading campaign updates, while writes occur during donations or campaign creation.

```mermaid
flowchart TD
    subgraph Edge ["Edge / CDN"]
        CDN["Cloudflare / CloudFront CDN (Static Assets & Campaign Photos)"]
    end

    subgraph LoadBalancer ["Traffic Distribution"]
        LB["Nginx / Application Load Balancer"]
    end

    subgraph AppCluster ["Stateless Node.js Instances"]
        Node1["Node.js Server 1"]
        Node2["Node.js Server 2"]
        NodeN["Node.js Server N"]
    end

    subgraph CacheCluster ["Caching Layer"]
        Redis[("Redis In-Memory Cache (Hot Campaigns & Counters)")]
    end

    subgraph DBCluster ["MongoDB Replica Set"]
        Primary[("MongoDB Primary (Writes & Strong Reads)")]
        Sec1[("Secondary 1 (Read Traffic)")]
        Sec2[("Secondary 2 (Read Traffic)")]
    end

    CDN --> LB
    LB --> Node1
    LB --> Node2
    LB --> NodeN

    Node1 --> Redis
    Node2 --> Redis

    Node1 --> Primary
    Node2 --> Primary
    NodeN --> Primary

    Primary -.->|"Oplog Sync"| Sec1
    Primary -.->|"Oplog Sync"| Sec2

    Node1 -->|"Read Queries"| Sec1
    Node2 -->|"Read Queries"| Sec2
```

### 8.2 Production Optimization Checklist
1. **Database Indexing**:
   - `Campaign`: Compound index `{ category: 1, status: 1, createdAt: -1 }`.
   - `Campaign`: Text index on `{ title: "text", shortDescription: "text", description: "text" }` for search acceleration.
   - `Donation`: Index on `{ campaign: 1, createdAt: -1 }` for instant retrieval of campaign supporter feeds.
   - `User`: Unique index on `{ email: 1 }`.
2. **Horizontal Scaling**: Since Express servers do not hold in-memory session states (all state resides in signed JWTs and MongoDB), instances can scale horizontally behind an Nginx or AWS ALB round-robin balancer.
3. **Database Caching**: Integrating a Redis layer for `GET /api/campaigns` and homepage metrics avoids hitting MongoDB for high-frequency queries.

---

## 9. Failure Modes & Reliability

| Failure Scenario | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **MongoDB Outage** | Write failures, 500 API responses | MongoDB Replica Sets with automatic primary failover ($\le 10\text{ s}$). Connection retry logic in `config/db.js`. |
| **Simulated Payment Gateway Latency** | Hanging request, UI freezing | Backend timeout limits with structured client-side loading indicators and feedback messages. |
| **Token Expiration / Tampering** | API rejection | Client-side Axios interceptor intercepts 401, clears invalid tokens from storage, and redirects gracefully to login. |
| **Malicious XSS / Payload Injection** | Script execution | Mongoose typed schema sanitization, automated HTML entity encoding in React Virtual DOM, and strict Express JSON parsers. |

---

## 10. Future Production Roadmap

1. **Live Payment Gateway**: Drop-in integration of Stripe Payment Intents or Razorpay Order APIs with cryptographic Webhook signature verification (`stripe-signature`).
2. **Object Storage**: Migration from image URLs to direct cloud storage (AWS S3 or Cloudinary) via signed multipart form uploads.
3. **Automated Receipts & Emails**: Integration with SendGrid or AWS SES for real-time PDF donation receipt delivery to donor inboxes.
