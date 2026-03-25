## 1. Executive Summary

### 1.1 Project Vision
**DocQ** (Document Intelligence & Audit Queue) is a next-generation AI-as-a-Service (AIaaS) orchestration platform engineered to revolutionize how enterprises handle high-volume document auditing and data extraction. By bridging the gap between raw unstructured archival data and actionable business intelligence, DocQ empowers compliance teams, legal professionals, and auditors to scale their operations with unprecedented speed and precision.

### 1.2 The Problem Statement
In traditional enterprise environments, document auditing is a labor-intensive, manual process prone to human fatigue, inconsistent result interpretation, and significant delays. Large-scale datasets (PDFs, Word documents, text files) often remain siloed, making it difficult to extract cross-document trends or interrogate historical records efficiently.

### 1.3 The Solution
DocQ introduces a sophisticated **Workflow & Inference Pipeline** that automates the ingestion, analysis, and interrogation of complex documents. 
*   **Massive Parallelism**: Utilizing a high-concurrency backend to process multiple sources through the **DocQ Intelligence Engine** (Brn-Llama) engine simultaneously.
*   **Automated Intelligence Cycles**: A robust scheduling subsystem ensuring that audit cycles are executed periodically without manual intervention.
*   **Conversational Interrogation**: An LLM-driven chat interface allowing users to query their "Knowledge Base" (the processed results) using natural language, governed by a strict context-aware persona.

### 1.4 Primary Objectives
*   **Efficiency**: Reduce document review time by up to 90% via automated AI extraction.
*   **Consistency**: Standardize audit findings through a centralized intelligence engine.
*   **Auditability**: Maintain a perfect trail of every analysis pulse with detailed logs and persistent PDF reports.
*   **Interactivity**: Move beyond static reports to a dynamic, "living" documentation baseline that can be queried in real-time.

---

## 2. Technical Infrastructure

### 2.1 Backend Architecture (Django 5.0 Ecosystem)
The DocQ backend is architected as a robust, service-oriented monolithic API designed for high-availability document processing.
*   **Django 5.0 Core**: Utilizes the latest stable Django framework for its secure-by-default ORM, middleware, and administrative capabilities.
*   **Django Rest Framework (DRF)**: Standardizes the API layer with robust serializers and class-based views for predictable resource management.
*   **Identity Management**: Implements `djangorestframework-simplejwt` for stateless, token-based authentication (Access: 1 day, Refresh: 7 days).
*   **Asynchronous Concurrency**: 
    *   Leverages `concurrent.futures.ThreadPoolExecutor` with a pool of **3 parallel workers** per execution to process multiple files simultaneously through the inference engine.
    *   This ensures that a job with 10 documents completes in a fraction of the time required for sequential processing.
*   **Automated Scheduling Engine**:
    *   Powered by `apscheduler` (BackgroundScheduler).
    *   Runs as a persistent background thread within the Django process.
    *   Heartbeat frequency: **60 seconds**.
    *   Configuration handles misfire grace periods (60s) and task coalescing to prevent resource exhaustion during system lag.

### 2.2 Frontend Architecture (React 19 & Vite)
A high-performance, responsive Single Page Application (SPA) prioritizing user experience and real-time telemetry display.
*   **Modern Framework**: Built on **React 19 (TypeScript)** to leverage concurrent rendering and strict type safety.
*   **Build Pipeline**: Utilizes **Vite** for ultra-fast HMR (Hot Module Replacement) during development and optimized tree-shaken bundles for production.
*   **Styling & Design System**:
    *   **Tailwind CSS**: A utility-first CSS framework used for rapid custom UI development.
    *   **Rich Aesthetics**: Implements glassmorphism, backdrop blurs, and premium dark/light themes tailored for executive viewing.
*   **State & Connectivity**:
    *   **Axios Interceptors**: Global interceptors attach JWT Bearer tokens to all outbound requests and handle 401 Unauthorized errors gracefully.
    *   **React Context**: Manages global authentication states and active user sessions.
*   **Interactive Components**: Integrated with **Lucide-React** for high-quality iconography and **Sonner** for toast notifications.

### 2.3 AI & Intelligence Layer (DocQ Intelligence Engine Integration)
The core intelligence of DocQ is decoupled from the main application to ensure scalability and model agility.
*   **Inference Gateway**: Interacts with the **Brn-Llama** engine via a secure SSL-encrypted REST API (`https://brn-llama.bourntec.com/api/process`).
*   **Protocols**:
    *   Uses a standardized payload including `agent_id` and `platform_id` ("DSuite") for tracking and billing.
    *   Timeout handling is set to **120 seconds** to accommodate high-complexity document inference.
*   **Context Management**: Dynamically builds prompt context by aggregating historical `ExecutionResult` data into a structured system-persona prompt.

### 2.4 Data Persistence & Reporting
*   **Relational Database**: A structured SQLite schema (expandable to PostgreSQL via env vars) managing relationships between users, jobs, files, and chat logs.
*   **PDF Synthesis Engine**:
    *   Utilizes `xhtml2pdf` (PISA) to generate professional-grade audit reports post-execution.
    *   **Markdown Rendering**: Includes a custom parser to convert AI-generated markdown into PISA-compatible HTML tags (bolding, italics, line breaks).
    *   **Report Variants**: Supports "Executive", "Detailed", and "Source" report types with distinct styling and data density.
*   **Media Management**: Securely stores uploaded source files and generated PDFs in hierarchical directories within the `media/` root.

---

## 3. Detailed Functional Modules

### 3.1 Identity & Access Management (Accounts)
Provides a secure gateway for users to manage their operational environment.
*   **Self-Service Registration**: Captures user `email`, `name`, and `password`. Validates email uniqueness before record commit.
*   **JWT Handshake**:
    *   **Login**: Authenticates credentials and returns a pair of tokens (Access & Refresh).
    *   **User Context (`/me/`)**: A dedicated endpoint allowing the frontend to retrieve the authenticated user's profile and permission levels on app initialization.
*   **Role-Based Access**: All view-level logic is wrapped in `IsAuthenticated` permissions, ensuring users can only interact with data (Jobs, Executions, Chats) that they personally own.

### 3.2 Job Lifecycle Management (Jobs)
Jobs serve as the persistent "containers" for auditing tasks and source documents.
*   **Workflow Configuration**: Users create jobs with a name and a list of files (`FileField`). 
*   **Dashboard Telemetry (`/stats/`)**: Aggregates user-wide data including:
    *   **Total Active Jobs**: Non-archived workflows.
    *   **Resource Usage**: Calculates a percentage-based usage metric against a system-defined cap (Default: 500 executions).
    *   **Next Scheduled Pulse**: Dynamically identifies the earliest upcoming execution across all active schedules.
    *   **Live Activity Feed**: A merged stream of the newest 6 events (New Job creations or Execution completions).
*   **Job Intelligence Detail**: Provides a granular view of a specific job:
    *   **Audit Analytics**: Success/Failure ratios and Trigger distribution (Manual vs. Scheduled).
    *   **History Manifest**: Retains the last 10 execution logs and status summaries for quick review.

### 3.3 AI Execution Engine (Execution)
The core processing logic that transforms raw documents into structured intelligence.
*   **Execution Triggering**: Supports two primary entry points:
    1.  **Manual Pulse**: Direct user-initiated run via the Job Detail page.
    2.  **Automated Pulse**: System-initiated run via the `APScheduler` worker.
*   **Finite State Machine (FSM)**:
    *   `PENDING`: Cycle initialized.
    *   `RUNNING`: Parallel ingestion of documents via `DocQ Intelligence Engine`.
    *   `SUCCESS`: All documents processed and PDF report synthesized.
    *   `FAILED/BLOCKED`: Error encountered (e.g., zero files, API timeout, or engine mismatch).
*   **Detailed Audit Trail**: Every execution maintains a dedicated `ExecutionLog` set, providing a timestamped step-by-step breakdown (e.g., "Dispatching API request", "Audit complete for file.pdf").

### 3.4 Automated Intelligence (Scheduler)
A proactive automation layer that removes the need for manual oversight in recurring audits.
*   **Job-Specific Schedules**: Allows users to set a `run_time` (Local Time) for each job.
*   **Worker Heartbeat**:
    *   A persistent background thread polls every **60 seconds** to check for pending daily tasks.
    *   Updates `last_run` and `next_run` (Current + 24hrs) timestamps upon successful trigger.
*   **Safe Execution**: Utilizes a 60-second debounce mechanism to ensure a schedule is only triggered once per minute window, even if the scheduler process restarts.

### 3.5 DocQ Inference Interface (Chat)
An interactive AI interface for deep querying of processed results.
*   **Self-Contained Sessions**: Each chat is a `ChatSession` linked to a job, allowing for separate threads of inquiry (e.g., "Q1 Trend Analysis" vs "Compliance Check").
*   **Context Scoping (KB Building)**:
    1.  **Global Inference**: Automatically builds a Knowledge Base from the *latest successful* execution findings.
    2.  **Focused Inference**: Allows the user to select a *specific* historical execution pulse to query that exact point-in-time data.
*   **Thread Persistence**: Full message history (User queries vs. AI responses) is stored and retrievable, maintaining continuity across logic sessions.

### 3.6 Automated Reporting
DocQ provides three distinct reporting tracks tailored to different stakeholder needs, synthesized immediately following an intelligence cycle.

#### 3.6.1 Executive Summary Variant
*   **Target Audience**: C-Suite, Department Heads, and Lead Auditors.
*   **Data Density**: High-level synthesis focusing on aggregated trends and critical anomalies.
*   **Core Content**:
    *   Unified "Key Takeaways" across all processed documents.
    *   Strategic risk assessment based on inferred document patterns.
    *   Simplified layout with minimal technical metadata.

#### 3.6.2 Detailed Audit Variant
*   **Target Audience**: Compliance Officers, Legal Teams, and Operational Auditors.
*   **Data Density**: Comprehensive, per-file intelligence breakdown.
*   **Core Content**:
    *   The complete AI response for every individual file in the job's context.
    *   Structured findings including specific data points extracted (dates, amounts, clauses).
    *   A step-by-step manifest of the audit logic applied to each source.

#### 3.6.3 Source Tracking Variant (Citations & Provenance)
*   **Target Audience**: Verification Teams and Forensic Accountants.
*   **Data Density**: Evidence-focused layout prioritizing traceability.
*   **Core Content**:
    *   Isolation of the "Verified Sources" or "Citations" section from the AI output.
    *   Direct mapping of AI claims to specific document origins.
    *   Highlighting of internal references to ensure findings can be manually cross-checked against raw source text.

---

## 4. Logical Data Schema

### 4.1 Schema Core Principles
The DocQ persistence layer is built on a relational integrity model designed for high-concurrency document processing. All models (except the core User model) inherit from an abstract `BaseModel` providing `created_at` and `updated_at` telemetry.

### 4.2 Entity Data Dictionary

#### 4.2.1 Identity Management (User)
*   `email` (EmailField, Unique, PK): Primary identifier for JWT-based auth.
*   `name` (CharField): User's profile name.
*   `is_active`, `is_staff` (BooleanField): Permission and lifecycle flags.
*   `last_login` (DateTimeField, Null): Standard auth tracking.

#### 4.2.2 Workflow Management (Job / JobFile)
*   **Job**:
    *   `name` (CharField): User-defined title for the business process.
    *   `user` (FK -> User): Ownership link.
    *   `is_archived` (BooleanField): Visibility flag for UX streamlining.
*   **JobFile**:
    *   `job` (FK -> Job, RelatedName: `files`): Many-to-one relationship.
    *   `file` (FileField): Physical path to object storage (`media/jobs/`).
    *   `file_name` (CharField): Original filename metadata.

#### 4.2.3 Processing Engine (Execution / Results / Logs)
*   **Execution**:
    *   `job` (FK -> Job, RelatedName: `executions`): Context mapping.
    *   `status` (Enum: PENDING, RUNNING, SUCCESS, FAILED, BLOCKED): Processing FSM state.
    *   `model_used` (CharField): Model identifier (e.g., "DocQ Intelligence Engine").
    *   `trigger_type` (Enum: MANUAL, SCHEDULED): Audit source.
    *   `report_file` (FileField, Null): Path to generated PDF synthesis.
    *   `started_at`, `completed_at` (DateTimeField): Duration metrics.
*   **ExecutionResult**:
    *   `execution` (FK -> Execution, RelatedName: `results`): Results container.
    *   `job_file` (FK -> JobFile): Originator link for specific finding.
    *   `prompt` (TextField): Raw text extracted from source.
    *   `response` (TextField): AI inference synthesized finding.
*   **ExecutionLog**:
    *   `execution` (FK -> Execution, RelatedName: `logs`): Telemetry stream.
    *   `message` (TextField): Human-readable event description.
    *   `level` (Enum: INFO, ERROR, SUCCESS): Severity/status context.

#### 4.2.4 Automation Logic (JobSchedule)
*   `job` (OneToOne -> Job, RelatedName: `schedule`): Unique scheduling constraint per workflow.
*   `run_time` (TimeField): Targeted local clock time for daily pulse.
*   `is_active` (BooleanField): Master switch for the background worker.
*   `last_run`, `next_run` (DateTimeField, Null): Historical and predictive tracking for the `APScheduler`.

#### 4.2.5 Intelligence Interface (ChatSession / Message)
*   **ChatSession**:
    *   `job` (FK -> Job): Root context.
    *   `execution` (FK -> Execution, Null): Optional specific pulse focus.
    *   `title` (CharField, Null): Descriptive thread title.
*   **ChatMessage**:
    *   `session` (FK -> ChatSession, RelatedName: `messages`): Container thread.
    *   `role` (Enum: USER, AI): Actor identity.
    *   `content` (TextField): Conversation payload.

---

## 5. UI/UX Workflow Specification

### 5.1 The Executive Dashboard
Designed for rapid assessment of the global document intelligence environment.
*   **High-Density Metrics Grid**: Displays four critical KPIs:
    1.  **Active Pipeline**: Count of non-archived jobs.
    2.  **Reliability**: System-wide success percentage.
    3.  **Next Pulse**: Local time of the earliest incoming scheduled run.
    4.  **Sys Alerts**: Count of failed executions requiring user intervention.
*   **Workspace Navigator**: A filterable list of all jobs with a dedicated "Archive" tab to hidden inactive workflows.
*   **Telemetry Stream (Sidebar)**: A real-time activity feed showing progress of ongoing and recently completed intelligence cycles.
*   **Search Engine**: A unified search bar allowing users to filter jobs by name or content using global query logic.

### 5.2 The Workflow Ingestion Engine (Create Job)
*   **Step 1: Configuration**: User names the job unit (e.g., "Annual Report Audit").
*   **Step 2: Payload Attachment**: Drag-and-drop or file-picker interface for simultaneous multi-file uploads (PDF/DOCX/TXT).
*   **Step 3: Protocol Initiation**: Upon submission, files are streamed to the backend using `multipart/form-data`, initializing the Job record and triggering the first extraction cycle if requested.

### 5.3 Audit Telemetry & Detail View (Job Detail)
The technical drill-down for a specific workflow's performance and history.
*   **Stats Strip**: Granular analytics for the job, including Total Runs, Success Rate (%), and Manual vs. Scheduled triggers.
*   **Live Execution Logs**: A collapsible vertical timeline showing real-time `ExecutionLog` data using a **10-second polling heartbeat**. Logs are color-coded (Success = Emerald, Error = Rose, Info = Blue).
*   **Audit Historical Fragments**: A manifest of all past runs with direct links to "View Report" or "AI Interaction" per execution.
*   **Remote Operations Card**: Centralized controls for:
    *   **Inference Gateway**: Quick jump to the AI Chat page.
    *   **Automation Settings**: Setup and modification of the 24-hour audit schedule.

### 5.4 Immersive Inference Canvas (Chat Interface)
A sophisticated, glassmorphic UI for natural language document interrogation.
*   **Historical Fragments (Sidebar)**: Navigation through persistent chat sessions, allowing users to return to past inquiries.
*   **Inference Scoping Tool**: A modal interface allowing the user to select the "Data Context":
    *   `Global Baseline`: Latest successful results.
    *   `Specific Fragment`: Results from a particular point-in-time execution.
*   **Immersive Feed**: Message bubbles reflecting the **DocQ Intelligence Engine** persona, including timestamped metadata and "Intelligence Verified" watermarks.
*   **Protocol Bypass**: If a user asks a question before an execution has run, the AI provides a "Trigger Immediate" button within the message bubble to initiate the workflow directly from the chat.

---

## 6. Environment & Deployment Readiness

### 6.1 Configuration Management
DocQ utilizes a strictly decoupled configuration model to ensure seamless movement across Local, Staging, and Production environments.
*   **Environment Files (`.env`)**:
    *   **Backend**: Manages `SECRET_KEY`, `DEBUG` (Boolean), `ALLOWED_HOSTS` (Comma-separated list), and `CORS_ALLOWED_ORIGINS`.
    *   **Frontend**: Manages `VITE_API_URL` to point to the correct inference gateway service.
*   **Dynamic Security Logic**: The system automatically switches between `CORS_ALLOW_ALL_ORIGINS` (when `DEBUG=True`) and a strict `CORS_ALLOWED_ORIGINS` whitelist (when `DEBUG=False`) to ensure production reliability without hindering local development.
*   **Decoupled Secrets**: All sensitive identifiers (e.g., `agent_id`) are moved to environment variables to prevent accidental credential leakage in the source repository.

### 6.2 Production Build Process
*   **Frontend Artifacts**:
    *   Execution of `npm run build` triggers a production-optimized build using the Vite bundler.
    *   Outputs a static `dist/` directory containing minified JavaScript, CSS assets, and indexable HTML.
    *   Vite environment variables are injected at build-time.
*   **Backend Static/Media Preparation**:
    *   **Collect Static**: `python manage.py collectstatic` is required to aggregate admin and app-specific assets into the `STATIC_ROOT`.
    *   **Media Persistence**: The `media/` folder must be persistent across deployments to retain uploaded audit documents and generated PDF reports.

### 6.3 Security & Performance Hardening
*   **CORS Policy Transitions**:
    *   **Development**: `CORS_ALLOW_ALL_ORIGINS = True` for maximum flexibility.
    *   **Production**: Restricting to specific authorized domains via `CORS_ALLOWED_ORIGINS` is required.
*   **Inference Concurrency**: The `max_workers=3` parameter in the `ThreadPoolExecutor` can be scaled up or down based on the server's CPU capability and memory overhead.
*   **Database Management**: 
    *   While the system currently uses SQLite for its small footprint, it is fully compatible with enterprise-grade engines like **PostgreSQL** or **MySQL** via the `DATABASE_URL` environment variable.
    *   **Migrations**: Database schema updates are managed via `django-admin migrate` but are excluded from Git to prevent merge conflicts in collaborative environments.

### 6.4 Deployment Checklist
1.  **Environment Sync**: Verify `.env` files are correctly mapped on the host machine.
2.  **Schema Sync**: Run `python manage.py migrate` to ensure binary compatibility.
3.  **Build Synthesis**: Execute `npm run build` and move the `dist/` contents to the web server's static root.
4.  **Worker Activation**: Ensure the Python process is kept alive (e.g., via Gunicorn or Supervisord) to maintain the **APScheduler** heartbeat.
5.  **SSL Termination**: Ensure all communication (Frontend-to-Backend and Backend-to-Inference) is handled over HTTPS/TLS 1.2+ protocols.
