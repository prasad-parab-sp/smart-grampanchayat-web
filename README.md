# Smart Grampanchayat Web Application

A modern, mobile-first web application for Grampanchayat (Village Council) administration and citizen services.

## 🏛️ About

This application provides a digital platform for Grampanchayat operations, enabling:
- **Admin Login**: Secure access for Grampanchayat administrators
- **Citizen Services**: Easy access to government services and certificates
- **Mobile-First Design**: Optimized for smartphones and tablets
- **Bilingual Support**: Interface in Marathi and English

## 🚀 Features

### Authentication
- Admin login with password
- Citizen login with mobile number
- Secure session management

### Services (Planned)
- 📄 Certificate Services (Birth, Death, Marriage, Income, Caste, Domicile)
- 🏘️ Property Registration and Management
- 💰 Tax Payment System
- 💡 Electricity Connection Services
- 💧 Water Connection Services
- 🚮 Waste Management Complaints

### Design Features
- 🎨 Modern, clean UI with government-appropriate colors
- 📱 Mobile-responsive design (max-width: 480px)
- 🎯 Emoji-based icon system for better UX
- 🌍 Marathi language support with Devanagari fonts
- ♿ Accessibility-friendly design

## 🛠️ Technology Stack

- **Framework**: Angular 18+ (Standalone Components)
- **Language**: TypeScript
- **Styling**: SCSS with custom variables
- **Icons**: Centralized emoji system
- **Fonts**: Noto Sans Devanagari for Marathi text
- **Architecture**: Component-based with shared modules

## 📁 Project Structure

```
src/
├── app/
│   ├── login/                 # Login component
│   ├── shared/
│   │   ├── components/        # Reusable components
│   │   │   ├── hero-banner/
│   │   │   ├── contact-banner/
│   │   │   └── footer-brand/
│   │   ├── constants/         # App constants
│   │   │   └── icons.ts       # Centralized icon system
│   │   ├── services/          # Shared services
│   │   └── styles/            # Global styles and variables
│   └── app.component.ts       # Root component
└── main.ts                    # Application bootstrap
```

## 🎨 Icon System

The application uses a centralized emoji-based icon system:

```typescript
import { ICONS } from './shared';

// Usage in components
readonly icons = ICONS;

// In templates
{{ icons.LOGIN }} // 🏛️
{{ icons.SUCCESS }} // ✅
{{ icons.CERTIFICATE }} // 📄
```

### Icon Categories
- **Authentication**: LOGIN, USER, ADMIN, CITIZEN
- **Services**: CERTIFICATE, PROPERTY, TAX_PAYMENT, ELECTRICITY, WATER
- **Status**: SUCCESS, ERROR, PENDING, IN_PROGRESS
- **Actions**: EDIT, DELETE, SAVE, SEARCH
- **Navigation**: HOME, DASHBOARD, SETTINGS, CONTACT

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Angular CLI

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd smart-grampanchayat-web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
ng serve
```

4. Open your browser and navigate to `http://localhost:4200`

### Build for Production

```bash
ng build --configuration production
```

## 🔐 Default Login Credentials

### Admin Access
- Password: `SMART@123` or `admin`

### Citizen Access
- Any 10-digit mobile number (e.g., `9876543210`)

## 🎯 Current Status

### ✅ Completed Features
- Login component with admin/citizen authentication
- Responsive mobile-first design
- Centralized icon system
- Shared component architecture
- Hero banner, contact banner, and footer components
- Toast notification system

### 🚧 In Development
- Dashboard components
- Service modules
- Certificate generation system
- Payment integration
- User management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is developed for Grampanchayat Adali, Taluka Dodamarg, District Sindhudurg.

## 👥 Development Team

**Developed by**: Amey Infotech  
**Year**: 2025

## 📞 Support

For support and queries, contact the Grampanchayat helpline.

---

**Note**: This application is designed specifically for Indian Grampanchayat operations and follows government digital service guidelines.