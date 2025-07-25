# 🚀 Stackie HR Community

South Africa's premier HR community platform with AI-powered assistance, professional networking, and comprehensive resources.

## ✨ Features

### 🤖 **Stackie AI Assistant**
- Advanced AI-powered HR expert for South African labour law
- Real-time assistance with BCEA, LRA, EEA compliance
- CCMA procedures and dispute resolution guidance
- Professional HR strategy and policy development

### 👥 **Professional Community**
- Connect with HR professionals across South Africa
- Share insights, ask questions, and collaborate
- Industry-specific discussions and knowledge sharing
- Expert-moderated content and discussions

### 🎧 **Media Hub**
- Professional podcasts on HR topics
- Educational videos and webinars
- Real audio/video playback with expo-av
- Bookmarking and progress tracking

### 🛒 **HR Marketplace**
- Connect with verified HR service providers
- Browse specialists by expertise and location
- Direct messaging and project collaboration
- Subscription-based visibility for providers

### 💚 **Wellness Hub**
- Mental health resources and support
- Crisis intervention and professional contacts
- Mood tracking and wellness analytics
- Breathing exercises and mindfulness tools

### 📊 **Analytics Dashboard**
- Comprehensive platform usage insights
- Community engagement metrics
- Personal productivity tracking
- Wellness and mood analytics

## 🛠 **Technology Stack**

- **Framework**: React Native with Expo
- **Navigation**: Expo Router v5
- **Backend**: Supabase (Database, Auth, Storage)
- **AI**: OpenAI GPT-4 integration
- **Media**: Expo AV for audio/video playback
- **Styling**: Custom StyleSheet with dark theme
- **Icons**: Lucide React Native
- **Animations**: React Native Reanimated

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+ 
- Expo CLI
- iOS Simulator / Android Emulator
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/stackie-hr-community.git
   cd stackie-hr-community
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_APP_NAME=Stackie HR Community
   EXPO_PUBLIC_EAS_PROJECT_ID=your_eas_project_id
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the migration files in `/supabase/migrations`
   - Configure authentication settings
   - Set up storage buckets for media files

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 📱 **Building for Production**

### Development Build
```bash
eas build --profile development --platform all
```

### Production Build
```bash
eas build --profile production --platform all
```

### Submit to App Stores
```bash
eas submit --profile production --platform all
```

## 🏗 **Project Structure**

```
├── app/                    # App screens and navigation
│   ├── (tabs)/            # Tab-based screens
│   ├── auth/              # Authentication screens
│   └── _layout.tsx        # Root layout with error boundary
├── assets/                # Static assets (images, fonts)
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # External service integrations
├── supabase/              # Database migrations and functions
├── utils/                 # Utility functions and constants
└── types/                 # TypeScript type definitions
```

## 🔧 **Configuration**

### Environment Variables
- `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `EXPO_PUBLIC_APP_NAME` - App display name
- `EXPO_PUBLIC_EAS_PROJECT_ID` - EAS project identifier

### Feature Flags
Configure features in `utils/constants.ts`:
```typescript
export const FEATURES = {
  AI_CHAT: true,
  MEDIA_PLAYBACK: true,
  MARKETPLACE: true,
  WELLNESS_HUB: true,
  ANALYTICS: true,
  PUSH_NOTIFICATIONS: true,
  OFFLINE_MODE: false,
  BETA_FEATURES: false,
} as const;
```

## 🔒 **Security**

- **Authentication**: Supabase Auth with email/password
- **Authorization**: Row Level Security (RLS) policies
- **Data Protection**: POPIA compliance for South African users
- **Input Validation**: Comprehensive sanitization and validation
- **Rate Limiting**: API call throttling and abuse prevention

## 📊 **Analytics & Monitoring**

- **User Analytics**: Track engagement and feature usage
- **Performance Monitoring**: Monitor app performance and errors
- **Error Tracking**: Comprehensive error boundary and logging
- **A/B Testing**: Feature flag system for gradual rollouts

## 🧪 **Testing**

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run type checking
npm run type-check
```

## 📈 **Performance Optimization**

- **Code Splitting**: Lazy loading of screens and components
- **Image Optimization**: Automatic image compression and caching
- **Bundle Analysis**: Regular bundle size monitoring
- **Memory Management**: Proper cleanup and memory leak prevention

## 🌍 **Localization**

Currently supports:
- English (South African)
- Afrikaans (planned)
- Zulu (planned)

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **Email**: support@stackie.co.za
- **Documentation**: [docs.stackie.co.za](https://docs.stackie.co.za)
- **Community**: Join our Slack workspace

🙏 Acknowledgments

- South African HR community for feedback and insights
- Expo team for the excellent development platform
- Supabase for backend infrastructure
- OpenAI for AI capabilities

---

Made with ❤️ for the South African HR community**