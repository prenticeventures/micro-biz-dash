# Documentation Index

**Last Updated:** February 2, 2026

## Quick Links

**Start Here:**
- [PROJECT_STATUS.md](PROJECT_STATUS.md) - Current state of the project
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Deploy to production

---

## Directory Structure

```
docs/
├── PROJECT_STATUS.md          ← Start here! Current project state
├── DEPLOYMENT_CHECKLIST.md    ← Production deployment guide
├── TROUBLESHOOTING_AUTH.md    ← Fix authentication issues
├── CUSTOM_EMAIL_SETUP.md      ← Set up branded emails (optional)
├── MCP_SETUP_GUIDE.md         ← Claude/Cursor MCP configuration
├── BACKGROUND_REFACTOR_PLAN.md← Future visual improvements
│
├── setup/                     ← Setup guides
│   ├── BACKEND_SETUP.md       - Supabase backend setup
│   ├── IOS_SETUP.md           - iOS app setup with Capacitor
│   ├── ENVIRONMENTS.md        - Dev vs Prod environments
│   ├── MCP_CONFIGURATION.md   - MCP detailed config
│   └── PRODUCTION_SETUP.md    - Production environment setup
│
├── app-store/                 ← App Store submission
│   └── SUBMISSION_GUIDE.md    - Complete submission guide
│
├── reference/                 ← Technical reference
│   ├── DEVELOPER_ACCOUNT_INFO.md
│   ├── SIGNING_EXPLANATION.md
│   ├── WEB_AND_MOBILE_BACKEND.md
│   ├── TEST_ON_PHYSICAL_DEVICE.md
│   └── XCODE_FIRST_BUILD_CHECKLIST.md
│
└── archive/                   ← Historical docs (outdated)
    └── (old status files, planning docs)
```

---

## By Task

### Setting Up the Project
1. [Backend Setup](setup/BACKEND_SETUP.md) - Supabase database
2. [Environments](setup/ENVIRONMENTS.md) - Dev vs Prod
3. [MCP Setup](MCP_SETUP_GUIDE.md) - For Claude/Cursor integration

### Building for iOS
1. [iOS Setup](setup/IOS_SETUP.md) - Capacitor configuration
2. [Test on Device](reference/TEST_ON_PHYSICAL_DEVICE.md) - Physical device testing
3. [Xcode Checklist](reference/XCODE_FIRST_BUILD_CHECKLIST.md) - First build

### Deploying to Production
1. [Project Status](PROJECT_STATUS.md) - Verify everything is ready
2. [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) - Step-by-step deploy

### Submitting to App Store
1. [Developer Account Info](reference/DEVELOPER_ACCOUNT_INFO.md) - Account details
2. [Submission Guide](app-store/SUBMISSION_GUIDE.md) - Full submission process

### Troubleshooting
- [Authentication Issues](TROUBLESHOOTING_AUTH.md) - Fix auth problems
- [Custom Email](CUSTOM_EMAIL_SETUP.md) - Email deliverability issues

---

## Documentation Standards

- Keep docs current - update after significant changes
- Archive outdated info rather than deleting
- Use clear headings and checklists
- Include troubleshooting sections
