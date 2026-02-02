# Micro-Biz Dash

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

A retro-style platformer game built with React, TypeScript, and Capacitor. Available on web and iOS.

## 🎮 About

Micro-Biz Dash is a retro platformer game featuring:
- 5 challenging levels themed around building a business
- Guest mode - play Level 1 free before signing up
- Retro Game Boy-style controls (keyboard + touch)
- Victory celebration animations
- Score tracking and public leaderboards
- Save/load game state
- User authentication with Supabase

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- For iOS development: macOS, Xcode, and Apple Developer Account

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd micro-biz-dash_-2026-edition
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create `.env.local` file
   - Add your Supabase credentials (see [Backend Setup](#backend-setup))

4. Run the development server:
   ```bash
   npm run dev
   ```

## 📚 Documentation

### Setup Guides

- **[Backend Setup](docs/setup/BACKEND_SETUP.md)** - Setting up Supabase backend
- **[iOS Setup](docs/setup/IOS_SETUP.md)** - Setting up iOS app with Capacitor
- **[Environments](docs/setup/ENVIRONMENTS.md)** - Development vs Production setup
- **[Production Setup](docs/setup/PRODUCTION_SETUP.md)** - Production deployment guide
- **[MCP Configuration](docs/setup/MCP_CONFIGURATION.md)** - Model Context Protocol setup

### App Store

- **[Submission Guide](docs/app-store/SUBMISSION_GUIDE.md)** - Complete guide for App Store submission

### Reference

- **[Developer Account Info](docs/reference/DEVELOPER_ACCOUNT_INFO.md)** - Apple Developer account details
- **[Signing Explanation](docs/reference/SIGNING_EXPLANATION.md)** - Code signing configuration
- **[Web & Mobile Backend](docs/reference/WEB_AND_MOBILE_BACKEND.md)** - Backend architecture
- **[Testing on Physical Device](docs/reference/TEST_ON_PHYSICAL_DEVICE.md)** - Device testing guide
- **[Xcode First Build](docs/reference/XCODE_FIRST_BUILD_CHECKLIST.md)** - First build checklist

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Mobile:** Capacitor (iOS)
- **Backend:** Supabase (PostgreSQL, Auth, Real-time)
- **Styling:** CSS (retro pixel art style)
- **Audio:** Web Audio API

## 📱 Platform Support

- ✅ **Web** - Runs in modern browsers
- ✅ **iOS** - Native iOS app via Capacitor

## 🎯 Current Status

**Last Updated:** February 2, 2026

- ✅ **Web App** - Fully functional with guest mode
- ✅ **iOS App** - Built and tested
- ✅ **App Store** - Submitted for review
- ✅ **Backend** - Supabase integration complete
- ✅ **Authentication** - User sign up/login working (fixed Jan 29)
- ✅ **Guest Mode** - Play Level 1 before signup (added Jan 30)
- ✅ **Mobile Controls** - Touch controls optimized (fixed Jan 30)
- ✅ **Game State** - Save/load functionality
- ✅ **Statistics** - Leaderboard and stats tracking

See [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md) for detailed status.

## 📁 Project Structure

```
micro-biz-dash_-2026-edition/
├── src/                    # Source code
│   ├── components/        # React components
│   ├── services/          # Backend services
│   ├── lib/               # Utilities and configs
│   └── types/             # TypeScript types
├── ios/                    # iOS native project
├── database/              # Database schema
├── docs/                  # Documentation
│   ├── setup/             # Setup guides
│   ├── app-store/         # App Store guides
│   ├── reference/         # Reference docs
│   └── archive/           # Archived docs
└── public/                # Static assets
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production

# iOS
npm run ios:sync         # Build and sync to iOS
npm run ios:open         # Open in Xcode
npm run ios:run          # Build, sync, and open
npm run ios:pods         # Reinstall CocoaPods
```

## 🔐 Environment Variables

Create a `.env.local` file with:

```env
VITE_SUPABASE_URL=https://[your-project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[your-publishable-key]
```

See [Backend Setup](docs/setup/BACKEND_SETUP.md) for detailed instructions.

## 📝 License

[Add your license here]

## 🤝 Contributing

[Add contribution guidelines if applicable]

## 📧 Support

- **Website:** https://www.microbizdash.com
- **Support URL:** https://www.microbizdash.com

---

**Built with ❤️ using React, TypeScript, and Capacitor**
