# BreachFix Frontend - Netflix-Style Media Platform

A modern, responsive React frontend for the BreachFix V3 backend API, featuring a Netflix-style interface for movies, TV shows, and Bible content.

## 🚀 Features

- **Netflix-Style UI/UX**: Modern, responsive design with smooth animations
- **Media Streaming**: Watch movies and TV shows with a custom video player
- **Bible Module**: Read and search Bible content with multiple translations
- **User Authentication**: Secure login/signup with JWT tokens
- **Content Management**: Browse, search, and filter media content
- **User Profiles**: Manage favorites, watch history, and account settings
- **Admin Panel**: Comprehensive admin dashboard for content and user management
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

## 🛠️ Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **React Query** for data fetching and caching
- **Zustand** for state management
- **Axios** for API communication

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd breachfix-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:7001/api/v3
   VITE_INTERNAL_API_KEY=your-internal-api-key-here
   VITE_APP_NAME=BreachFix
   VITE_APP_VERSION=1.0.0
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Header, etc.)
│   └── media/          # Media-related components
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── utils/              # Utility functions and API configuration
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## 🎨 Design System

The application uses a Netflix-inspired design system with:

- **Color Palette**: Netflix red (#e50914), dark grays, and white
- **Typography**: Clean, modern fonts with proper hierarchy
- **Animations**: Smooth transitions and hover effects
- **Responsive Grid**: Adaptive layouts for all screen sizes

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 API Integration

The frontend integrates with the BreachFix V3 backend API, supporting:

- **Authentication**: JWT-based auth with refresh tokens
- **Media Management**: Movies, TV shows, and episodes
- **Bible Content**: Multiple translations and search
- **User Management**: Profiles, favorites, and watch history
- **Admin Functions**: Content moderation and user management

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## 🔒 Security Features

- JWT token management with automatic refresh
- Secure API communication with API keys
- Protected routes for authenticated users
- Admin-only access controls

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting provider

3. **Set environment variables** in your production environment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Open an issue on GitHub
- Contact the development team

## 🔄 Updates

Stay updated with the latest features and improvements by regularly pulling from the main branch.

---

**Built with ❤️ for the BreachFix platform**
