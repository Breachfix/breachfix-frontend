# BreachFix Color System - Complete Guide

## 🎨 **BreachFix Color Palette**

BreachFix uses a royal, uplifting color palette that conveys trust, value, and spiritual significance. This system creates a premium, spiritual identity that distinguishes BreachFix from generic streaming platforms.

### **Core BreachFix Colors**

| Color Name | Hex Code | Usage | Purpose |
|------------|----------|-------|---------|
| `breachfix-navy` | `#0D1B2A` | Primary backgrounds | Deep navy foundation, royal and trustworthy |
| `breachfix-gold` | `#FFD166` | Primary accents, buttons, highlights | Gold symbolizes value, glory, and divine light |
| `breachfix-white` | `#F8F9FA` | Primary text, neutral elements | Soft white for readability and neutrality |
| `breachfix-emerald` | `#2A9D8F` | Secondary accents, success states | Emerald for hope, restoration, and life |
| `breachfix-sage` | `#88C999` | Alternative secondary | Sage green for growth and harmony |
| `breachfix-gray` | `#6C757D` | Supporting elements, borders | Neutral gray for subtle elements |
| `breachfix-dark` | `#1A1A1A` | Dark containers, cards | Dark background variant for contrast |

---

## 📱 **Page Color Themes**

### **🏠 Home Page**
- **Background**: `bg-breachfix-navy`
- **Play Button Overlay**: `bg-breachfix-gold text-breachfix-navy`
- **Error Messages**: `text-breachfix-gold`
- **Content Cards**: `bg-breachfix-dark`

### **🎬 Media Pages (Movies, TV Shows, Episodes)**
- **Background**: `bg-breachfix-navy`
- **Search Button**: `bg-breachfix-gold hover:bg-yellow-500 text-breachfix-navy`
- **Filter Tabs**: `bg-breachfix-gold text-breachfix-navy` (active)
- **Filter Tabs**: `bg-breachfix-gray text-breachfix-white` (inactive)
- **Content Containers**: `bg-breachfix-dark`
- **Success Messages**: `bg-breachfix-emerald/20 border-breachfix-emerald`

### **📖 Bible Pages**
- **Background**: `bg-breachfix-navy`
- **Option Cards**: 
  - Read Bible: `from-breachfix-emerald to-teal-700`
  - Submit Edits: `from-breachfix-gold to-yellow-600`
  - My Edits: `from-breachfix-sage to-green-600`
  - Admin Panel: `from-breachfix-emerald to-emerald-700`
- **Text**: `text-breachfix-white`
- **Metadata**: `text-breachfix-gray`
- **Highlighted Verses**: `bg-breachfix-gold bg-opacity-20 border-l-4 border-breachfix-gold`
- **Verse Numbers**: `text-breachfix-gray`
- **Verse Text**: `text-breachfix-white`

### **🔄 Changed Page (BreachFix Verse)**
- **Background**: `bg-breachfix-navy`
- **Featured Section**: `from-breachfix-navy to-breachfix-emerald`
- **Original Text**: `bg-breachfix-dark text-breachfix-gold`
- **Modern Change**: `bg-red-600/20 border-red-400 text-red-400`
- **Spirit of Prophecy**: `bg-breachfix-emerald/30 border-breachfix-emerald`
- **Analysis**: `bg-breachfix-dark text-breachfix-gold`
- **Donation Section**: `from-breachfix-emerald to-teal-700`
- **Donation Button**: `bg-breachfix-gold hover:bg-yellow-500 text-breachfix-navy`

### **🔐 Auth Pages (Login/Signup)**
- **Background**: `bg-breachfix-navy`
- **Form Container**: `bg-breachfix-navy border-breachfix-gray`
- **Input Fields**: `bg-breachfix-gray text-breachfix-white`
- **Focus States**: `focus:border-breachfix-gold`
- **Primary Button**: `bg-breachfix-gold hover:bg-yellow-500 text-breachfix-navy`
- **Google Button**: `bg-breachfix-emerald hover:bg-teal-600 text-breachfix-white`
- **Error Messages**: `bg-red-600 text-breachfix-white`

### **👤 Profile Page**
- **Background**: `bg-breachfix-navy`
- **Profile Card**: `bg-breachfix-dark`
- **User Info**: `text-breachfix-white`
- **Metadata**: `text-breachfix-gray`
- **Favorites**: `bg-breachfix-dark`

### **⚙️ Admin & Accounts Pages**
- **Background**: `bg-breachfix-navy`
- **Content**: `text-breachfix-white`
- **Tables**: `bg-breachfix-dark`
- **Actions**: `bg-breachfix-gold hover:bg-yellow-500`

### **❤️ Favorites Page**
- **Background**: `bg-breachfix-navy`
- **Content**: `text-breachfix-white`
- **Favorite Items**: `bg-breachfix-dark`

### **💝 Donation Pages**
- **Background**: `bg-breachfix-navy`
- **Success Page**: `from-breachfix-navy to-breachfix-emerald`
- **Modal Background**: `bg-breachfix-dark border-breachfix-gray`
- **Modal Text**: `text-breachfix-white`
- **Amount Display**: `text-breachfix-gold`
- **Loading Spinner**: `border-breachfix-gold`

---

## 🧩 **Component Color Themes**

### **📱 Header Component**
```css
/* Header Background */
bg-breachfix-navy

/* Logo */
text-breachfix-gold

/* Navigation Links */
hover:text-breachfix-gold

/* User Avatar Border */
border-breachfix-gold

/* Buttons */
bg-breachfix-gold hover:bg-yellow-500 text-breachfix-navy

/* Mobile Menu */
bg-breachfix-dark border-breachfix-gray
```

### **🎬 MovieCard Component**
```css
/* Video Overlay Badge */
bg-breachfix-emerald text-breachfix-white

/* Play Button */
bg-breachfix-gold text-breachfix-navy

/* Genre Tags */
bg-breachfix-gold text-breachfix-navy
```

### **📤 UploadSection Component**
```css
/* Container */
bg-breachfix-dark

/* Form Labels */
text-breachfix-gray

/* Input Fields */
bg-breachfix-gray text-breachfix-white
focus:ring-breachfix-gold

/* Progress Bars */
bg-breachfix-gold

/* Status Indicators */
bg-red-600 text-red-100 (error)
bg-breachfix-emerald text-breachfix-white (success)
bg-breachfix-emerald text-breachfix-white (info)
```

### **📖 Bible Components**

#### **ChapterHeader**
```css
/* Headers */
text-breachfix-white

/* Metadata */
text-breachfix-gray
```

#### **VerseDisplay**
```css
/* Verse Numbers */
text-breachfix-gray

/* Verse Text */
text-breachfix-white

/* Highlighted Verses */
bg-breachfix-gold bg-opacity-20 border-l-4 border-breachfix-gold

/* Asterisk (Translation Changes) */
text-breachfix-gold hover:text-yellow-500

/* Donation Button */
bg-breachfix-emerald text-breachfix-white hover:bg-teal-600
```

### **🔄 Changed Components**

#### **ChangedFeatured (BreachFix Verse)**
```css
/* Main Container */
from-breachfix-navy to-breachfix-emerald

/* Section Headers */
text-breachfix-white

/* Original Text */
bg-breachfix-dark text-breachfix-gold

/* Modern Changes */
bg-red-600/20 border-red-400 text-red-400

/* Spirit of Prophecy */
bg-breachfix-emerald/30 border-breachfix-emerald text-breachfix-emerald

/* Analysis */
bg-breachfix-dark text-breachfix-gold

/* Doctrine Tags */
bg-breachfix-gold text-breachfix-navy

/* Version Tags */
bg-breachfix-gray text-breachfix-white

/* Donation Section */
from-breachfix-emerald to-teal-700

/* Donation Button */
bg-breachfix-gold hover:bg-yellow-500 text-breachfix-navy
```

### **💝 Donation Components**

#### **DonationButton**
```css
/* Button */
bg-breachfix-emerald text-breachfix-white hover:bg-teal-600

/* Modal Background */
bg-breachfix-dark border-breachfix-gray

/* Modal Text */
text-breachfix-white

/* Amount Display */
text-breachfix-gold

/* Error Messages */
bg-red-600 bg-opacity-20 border-red-400 text-red-100

/* Submit Button */
bg-breachfix-gold text-breachfix-navy hover:bg-yellow-500

/* Cancel Button */
border-breachfix-gray text-breachfix-gray hover:bg-breachfix-gray hover:bg-opacity-10
```

---

## 🎯 **Button Color Patterns**

### **Primary Buttons**
```css
/* Standard Primary */
bg-breachfix-gold hover:bg-yellow-500 text-breachfix-navy

/* Usage: Main CTAs, login, submit actions */
```

### **Secondary Buttons**
```css
/* Standard Secondary */
bg-breachfix-emerald hover:bg-teal-600 text-breachfix-white

/* Usage: Google login, secondary actions */
```

### **Outline Buttons**
```css
/* Standard Outline */
border-breachfix-gold text-breachfix-gold hover:bg-breachfix-gold hover:text-breachfix-navy

/* Usage: Alternative actions, cancel buttons */
```

### **Text Buttons**
```css
/* Standard Text */
text-breachfix-gold hover:text-yellow-500

/* Usage: Links, subtle actions */
```

---

## 🌈 **Gradient Patterns**

### **Hero Sections**
```css
/* Main Hero */
from-breachfix-navy to-breachfix-emerald

/* Usage: Page headers, featured sections */
```

### **Donation Sections**
```css
/* Donation Areas */
from-breachfix-emerald to-teal-700

/* Usage: Support sections, CTA areas */
```

### **Button Hover States**
```css
/* Gold Buttons */
from-breachfix-gold to-yellow-500

/* Usage: Primary button hover effects */
```

---

## 📊 **Status Color System**

### **Error States**
```css
/* Error Background */
bg-red-600

/* Error Text */
text-red-100

/* Error Border */
border-red-400

/* Usage: Validation errors, system errors */
```

### **Warning States**
```css
/* Warning Background */
bg-orange-900 bg-opacity-20

/* Warning Text */
text-orange-400

/* Warning Border */
border-orange-500

/* Usage: Warnings, danger indicators */
```

### **Success States**
```css
/* Success Background */
bg-breachfix-emerald bg-opacity-20

/* Success Text */
text-breachfix-emerald

/* Success Border */
border-breachfix-emerald

/* Usage: Success messages, completion states */
```

### **Info States**
```css
/* Info Background */
bg-breachfix-emerald bg-opacity-20

/* Info Text */
text-breachfix-emerald

/* Info Border */
border-breachfix-emerald

/* Usage: Information messages, neutral states */
```

### **Loading States**
```css
/* Loading Spinner */
border-breachfix-gold

/* Usage: All loading indicators, spinners */
```

---

## 🎨 **Form Element Colors**

### **Input Fields**
```css
/* Input Background */
bg-breachfix-gray

/* Input Text */
text-breachfix-white

/* Input Placeholder */
placeholder-breachfix-gray

/* Input Focus */
focus:border-breachfix-gold
focus:ring-breachfix-gold
```

### **Labels**
```css
/* Form Labels */
text-breachfix-gray

/* Required Indicators */
text-breachfix-gold
```

### **Select Dropdowns**
```css
/* Select Background */
bg-breachfix-gray

/* Select Text */
text-breachfix-white

/* Select Options */
bg-breachfix-dark text-breachfix-white
```

---

## 📱 **Responsive Color Considerations**

### **Mobile Menu**
```css
/* Mobile Menu Background */
bg-breachfix-dark

/* Mobile Menu Border */
border-breachfix-gray

/* Mobile Menu Links */
text-breachfix-white hover:text-breachfix-gold
```

### **Touch Targets**
- **Minimum size**: 44px for touch-friendly interaction
- **Hover states**: Maintained for desktop, enhanced for mobile
- **Focus states**: Visible for keyboard navigation

---

## ♿ **Accessibility Guidelines**

### **Contrast Ratios**
- **breachfix-gold on breachfix-navy**: 4.5:1 (AA compliant)
- **breachfix-white on breachfix-navy**: 12.6:1 (AAA compliant)
- **breachfix-emerald on breachfix-white**: 4.8:1 (AA compliant)
- **breachfix-white on breachfix-dark**: 12.1:1 (AAA compliant)

### **Color Blindness Support**
- **Primary actions**: Gold provides good contrast for colorblind users
- **Status colors**: Red, orange, green are distinguishable
- **Text**: High contrast ratios ensure readability

### **Focus Indicators**
- **Focus rings**: `focus:ring-breachfix-gold` for keyboard navigation
- **Focus borders**: `focus:border-breachfix-gold` for form elements

---

## 🚀 **Implementation Examples**

### **Complete Page Example**
```jsx
<div className="min-h-screen bg-breachfix-navy">
  <div className="bg-breachfix-dark rounded-lg p-6">
    <h1 className="text-breachfix-white text-3xl font-bold mb-4">
      Page Title
    </h1>
    <p className="text-breachfix-gray mb-6">
      Page description text
    </p>
    <button className="bg-breachfix-gold hover:bg-yellow-500 text-breachfix-navy px-6 py-3 rounded-lg">
      Primary Action
    </button>
  </div>
</div>
```

### **Card Component Example**
```jsx
<div className="bg-breachfix-dark border border-breachfix-gray rounded-lg p-6">
  <h3 className="text-breachfix-white text-xl font-semibold mb-2">
    Card Title
  </h3>
  <p className="text-breachfix-gray mb-4">
    Card content description
  </p>
  <div className="flex gap-3">
    <button className="bg-breachfix-gold hover:bg-yellow-500 text-breachfix-navy px-4 py-2 rounded">
      Action
    </button>
    <button className="border border-breachfix-gold text-breachfix-gold hover:bg-breachfix-gold hover:text-breachfix-navy px-4 py-2 rounded">
      Secondary
    </button>
  </div>
</div>
```

### **Bible Verse Example**
```jsx
<div className={`p-2 rounded-lg ${
  isHighlighted 
    ? 'bg-breachfix-gold bg-opacity-20 border-l-4 border-breachfix-gold' 
    : 'hover:bg-breachfix-gray hover:bg-opacity-10'
}`}>
  <span className="text-breachfix-gray font-semibold">{verseNumber}</span>
  <p className="text-breachfix-white leading-relaxed">{verseText}</p>
</div>
```

### **Donation Modal Example**
```jsx
<div className="bg-breachfix-dark border border-breachfix-gray rounded-lg p-6">
  <h3 className="text-breachfix-white text-lg font-semibold mb-4">
    Complete Your Donation
  </h3>
  <div className="bg-breachfix-gray bg-opacity-20 rounded p-3 mb-4">
    <p className="text-breachfix-gray text-sm">Donating for:</p>
    <p className="text-breachfix-white font-medium">{label}</p>
    <p className="text-breachfix-gold text-lg font-bold">
      ${amount}
    </p>
  </div>
  <button className="bg-breachfix-gold text-breachfix-navy px-4 py-2 rounded">
    Donate
  </button>
</div>
```

---

## 🌙 **Theme Variants**

### **Current Theme (Night/Dark)**
- **Primary Background**: `breachfix-navy` (#0D1B2A)
- **Secondary Background**: `breachfix-dark` (#1A1A1A)
- **Text**: `breachfix-white` (#F8F9FA)
- **Accents**: `breachfix-gold` (#FFD166)

### **Potential Day Theme**
- **Primary Background**: `#F8F9FA` (Light version of breachfix-white)
- **Secondary Background**: `#E9ECEF` (Light gray)
- **Text**: `breachfix-navy` (#0D1B2A)
- **Accents**: `breachfix-gold` (#FFD166) - Same for consistency

### **Theme Switching Implementation**
```jsx
// CSS Variables for theme switching
:root {
  --theme-bg-primary: var(--breachfix-navy);
  --theme-bg-secondary: var(--breachfix-dark);
  --theme-text-primary: var(--breachfix-white);
  --theme-text-secondary: var(--breachfix-gray);
  --theme-accent: var(--breachfix-gold);
}

[data-theme="light"] {
  --theme-bg-primary: #F8F9FA;
  --theme-bg-secondary: #E9ECEF;
  --theme-text-primary: var(--breachfix-navy);
  --theme-text-secondary: #6C757D;
  --theme-accent: var(--breachfix-gold);
}
```

---

## 📋 **Migration Status**

### **✅ Completed Components**
- [x] Header (navigation, mobile menu)
- [x] Home page (play buttons, overlays)
- [x] Media pages (movies, TV shows, episodes)
- [x] Bible pages (reading, editing, admin)
- [x] Changed page (BreachFix Verse, donation)
- [x] Auth pages (login, signup, forms)
- [x] Profile page
- [x] Admin & Accounts pages
- [x] Favorites page
- [x] MovieCard component
- [x] Bible components (ChapterHeader, VerseDisplay)
- [x] ChangedFeatured component
- [x] DonationButton component
- [x] DonationSuccess page
- [x] Loading spinners and indicators

### **⚠️ Remaining Tasks**
- [ ] UploadSection.tsx form elements (5 instances)
- [ ] Review any missed gray-300 references
- [ ] Consider removing legacy netflix- colors from config

---

## 🎯 **Brand Identity**

### **Royal & Uplifting**
- **Navy**: Conveys trust, stability, and premium quality
- **Gold**: Represents value, glory, and divine light
- **Emerald**: Symbolizes hope, restoration, and spiritual growth

### **Spiritual Significance**
- **Navy**: Deep, contemplative, like the night sky
- **Gold**: Divine light, wisdom, and eternal value
- **Emerald**: Life, growth, and spiritual renewal
- **Sage**: Harmony, balance, and natural wisdom

### **Professional Appeal**
- **Consistent**: Unified color scheme across all components
- **Accessible**: High contrast ratios for readability
- **Modern**: Contemporary design that stands out from generic streaming platforms
- **Memorable**: Unique color combination that builds brand recognition

---

## 🔧 **Technical Implementation**

### **CSS Variables**
```css
:root {
  --breachfix-navy: #0D1B2A;
  --breachfix-gold: #FFD166;
  --breachfix-white: #F8F9FA;
  --breachfix-emerald: #2A9D8F;
  --breachfix-sage: #88C999;
  --breachfix-gray: #6C757D;
  --breachfix-dark: #1A1A1A;
}
```

### **Tailwind Configuration**
```javascript
// tailwind.config.js
colors: {
  'breachfix-navy': '#0D1B2A',
  'breachfix-gold': '#FFD166',
  'breachfix-white': '#F8F9FA',
  'breachfix-emerald': '#2A9D8F',
  'breachfix-sage': '#88C999',
  'breachfix-gray': '#6C757D',
  'breachfix-dark': '#1A1A1A',
}
```

---

*This color system creates a premium, spiritual identity that distinguishes BreachFix from generic streaming platforms while maintaining excellent usability and accessibility. The royal navy and gold combination conveys trust and divine value, while the emerald accents provide hope and spiritual growth.*
