# 🚀 Complete Donation System Setup Guide

## 📋 Overview

This guide will help you set up and test the complete donation system that has been integrated into your Bible frontend. The system includes:

- ✅ **Stripe Payment Integration** - Real payment processing
- ✅ **Verse-Level Donations** - Support individual verses
- ✅ **Chapter-Level Donations** - Support entire chapters  
- ✅ **Changed Verse Donations** - High-value donation opportunities
- ✅ **Featured Verse Donations** - Auto-rotating donation CTAs
- ✅ **Modal Donation Interface** - Professional payment flow
- ✅ **Component Architecture** - Modular, maintainable code

---

## 🔧 Environment Setup

### 1. Create Environment File

Create a `.env` file in your frontend root directory:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:7001/api/v3
VITE_INTERNAL_API_KEY=your-internal-api-key-here

# Stripe Configuration (REQUIRED FOR DONATIONS)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Application URLs
VITE_BASE_URL=http://localhost:5174
VITE_CLIENT_URL=http://localhost:5174
VITE_FRONTEND_URL=http://localhost:5174
```

### 2. Get Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Test** keys (not live keys for development)
3. Replace the placeholder values in your `.env` file

### 3. Backend Setup

Ensure your backend is running with the donations API endpoints:
- `POST /api/v3/all-bibles/donations/intent` - Create payment intent
- `GET /api/v3/payment/health` - Health check

---

## 🧪 Testing the Donation System

### 1. Start the Development Server

```bash
npm run dev
```

Your app will be available at `http://localhost:5174`

### 2. Test Donation Integration Points

#### **A. Bible Reading Interface**
1. Navigate to `/bible/read`
2. Select a language and source
3. Choose a book and chapter
4. Look for:
   - 💝 **Donation buttons** on individual verses
   - 💚 **Chapter support button** in the header
   - ⭐ **Asterisk donations** on changed verses

#### **B. Changed Verse Analysis**
1. Navigate to `/changed`
2. Click on any featured verse
3. Look for:
   - 💚 **"Support Translation Research"** section
   - 💝 **Donation button** with $25 suggested amount

#### **C. Featured Verse System**
1. Navigate to `/changed`
2. Scroll to the "Featured Example" section
3. Look for:
   - 💚 **"Support This Research"** section
   - 💝 **Donation button** with $15 suggested amount

#### **D. Donation Test Page**
1. Navigate to `/donation-test`
2. Test various donation scenarios:
   - Verse-level donations
   - Chapter-level donations
   - Custom amounts
   - Different scopes

---

## 💳 Payment Testing

### Test Card Numbers

Use these Stripe test card numbers:

```
✅ Success: 4242 4242 4242 4242
❌ Decline: 4000 0000 0000 0002
🔒 Authentication: 4000 0025 0000 3155
```

**Test Details:**
- **Expiry:** Any future date (e.g., 12/25)
- **CVC:** Any 3 digits (e.g., 123)
- **ZIP:** Any 5 digits (e.g., 12345)

### Expected Payment Flow

1. **Click Donation Button** → Opens payment form
2. **Enter Test Card** → Stripe processes payment
3. **Payment Success** → Redirects to success page
4. **Backend Webhook** → Records donation in database

---

## 🏗️ Architecture Overview

### **New Components Created**

```
src/
├── components/
│   ├── bible/
│   │   ├── VerseDisplay.tsx      # Individual verse with donation button
│   │   └── ChapterHeader.tsx     # Chapter header with support button
│   └── donations/
│       ├── DonationButton.tsx    # Individual donation buttons
│       ├── DonationCard.tsx      # Full donation cards
│       └── DonationModal.tsx     # Modal payment interface
├── context/
│   └── DonationContext.tsx       # Global donation state management
├── hooks/
│   └── useDonation.ts           # Donation functionality hook
└── pages/
    ├── DonationTest.tsx         # Test page for donations
    └── DonationSuccess.tsx      # Success page after payment
```

### **Integration Points**

1. **BibleRead.tsx** - Main reading interface with verse and chapter donations
2. **ChangedDetail.tsx** - Changed verse analysis with research donations
3. **ChangedFeatured.tsx** - Featured verses with donation CTAs
4. **App.tsx** - Global donation context provider

---

## 🎯 Donation Features

### **Verse-Level Donations**
- **Trigger:** Click 💝 button on any verse
- **Scope:** Specific verse (language, source, book, chapter, verse)
- **Amount:** $5 suggested
- **Context:** "Support this verse"

### **Chapter-Level Donations**
- **Trigger:** Click "Support Chapter" button in header
- **Scope:** Entire chapter (language, source, book, chapter)
- **Amount:** $10-100 suggested
- **Context:** "Help fund accurate translation for this chapter"

### **Changed Verse Donations**
- **Trigger:** Click donation button in changed verse details
- **Scope:** Specific changed verse
- **Amount:** $25 suggested
- **Context:** "Support Translation Research"

### **Featured Verse Donations**
- **Trigger:** Click donation button in featured verse section
- **Scope:** Featured verse being displayed
- **Amount:** $15 suggested
- **Context:** "Support Featured Research"

---

## 📊 Expected Results

### **User Experience**
- ✅ Seamless donation flow without leaving the page
- ✅ Contextual donation appeals tied to specific content
- ✅ Professional payment interface with Stripe
- ✅ Clear success/error feedback

### **Technical Performance**
- ✅ No impact on existing Bible reading functionality
- ✅ Modular components for easy maintenance
- ✅ Proper error handling and loading states
- ✅ Mobile-responsive design

### **Business Impact**
- ✅ Multiple donation touchpoints throughout user journey
- ✅ High-value donation opportunities (changed verses)
- ✅ Contextual relevance increases conversion likelihood
- ✅ Professional payment experience builds trust

---

## 🚨 Troubleshooting

### **Common Issues**

1. **"Stripe not loaded" error**
   - Check `VITE_STRIPE_PUBLISHABLE_KEY` in `.env`
   - Ensure key starts with `pk_test_`

2. **"API endpoint not found" error**
   - Verify backend is running on port 7001
   - Check `VITE_API_BASE_URL` in `.env`

3. **Donation buttons not appearing**
   - Check browser console for errors
   - Verify all components are properly imported

4. **Payment form not opening**
   - Check Stripe publishable key
   - Verify network connectivity

### **Debug Mode**

Enable debug logging by adding to `.env`:
```bash
VITE_DEBUG_DONATIONS=true
```

---

## 🎉 Success Criteria

### **Technical Success**
- [ ] All donation buttons render correctly
- [ ] Payment flow completes successfully
- [ ] Success page displays after payment
- [ ] No console errors during donation process

### **User Experience Success**
- [ ] Donation buttons are clearly visible
- [ ] Payment form is intuitive and professional
- [ ] Loading states provide clear feedback
- [ ] Error messages are helpful and actionable

### **Business Success**
- [ ] Multiple donation opportunities throughout app
- [ ] Contextual relevance increases engagement
- [ ] Professional payment experience builds trust
- [ ] System ready for production deployment

---

## 🚀 Next Steps

1. **Test all donation flows** with test cards
2. **Verify backend integration** with real API calls
3. **Test mobile responsiveness** on various devices
4. **Set up production Stripe keys** when ready to launch
5. **Configure webhook endpoints** for production
6. **Add analytics tracking** for donation metrics

---

**Last Updated:** December 2024  
**Status:** Ready for Testing  
**Priority:** High - Revenue Impact
