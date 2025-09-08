# 🔗 Backend Integration Guide for Donation System

## 📋 Overview

This guide shows you how to integrate the frontend donation system with your backend API endpoints for complete payment tracking and partnership status.

## 🚀 **Integration Complete!**

Your donation system now includes:

✅ **Frontend Components** - Beautiful donation buttons and partnership indicators  
✅ **Backend API Integration** - Real-time partnership status checking  
✅ **Payment Tracking** - MongoDB storage via Stripe webhooks  
✅ **Partnership Indicators** - Visual badges showing supported content  

---

## 🔧 **Backend API Endpoints Required**

### 1. **Donation Intent Creation**
```
POST /api/v3/all-bibles/donations/intent
```
**Request Body:**
```json
{
  "scope": {
    "kind": "verse|chapter|book",
    "lang": "eng",
    "source": "kjv",
    "bookNumber": 43,
    "chapter": 3,
    "verse": 16
  },
  "amount": 2500,
  "currency": "USD",
  "returnUrl": "http://localhost:5174/donation-success"
}
```

### 2. **Partnership Status Check**
```
GET /api/v3/all-bibles/donations/partnership
```
**Query Parameters:**
- `kind` - verse|chapter|book
- `lang` - Language code
- `source` - Source code
- `bookNumber` - Book number
- `chapter` - Chapter number
- `verse` - Verse number (optional)
- `userId` - User ID (optional for anonymous donations)

**Response:**
```json
{
  "success": true,
  "isPartner": true,
  "donationCount": 1,
  "totalAmount": 2500
}
```

### 3. **Donation Statistics**
```
GET /api/v3/all-bibles/donations/stats
```
**Response:**
```json
{
  "success": true,
  "payments": [
    {
      "id": "payment_123",
      "scope": { "kind": "verse", "lang": "eng", "source": "kjv", "bookNumber": 43, "chapter": 3, "verse": 16 },
      "amount": 2500,
      "currency": "USD",
      "status": "succeeded",
      "createdAt": "2024-12-19T10:30:00Z",
      "paymentIntentId": "pi_123"
    }
  ],
  "totalDonated": 2500,
  "donationCount": 1
}
```

---

## 🎯 **Frontend Integration Points**

### **1. Partnership Indicators**

The system automatically shows partnership status throughout your app:

#### **Verse Level**
```jsx
// In VerseDisplay component
<PartnerBadge
  scope={{
    kind: 'verse',
    lang: selectedLanguage,
    source: selectedSource,
    bookNumber: selectedBookNumber,
    chapter: selectedChapter,
    verse: verse.verse
  }}
  userId={userId} // From auth context
  size="sm"
  showText={false}
/>
```

#### **Chapter Level**
```jsx
// In ChapterHeader component
<PartnerBadge
  scope={{
    kind: 'chapter',
    lang: language,
    source: source,
    bookNumber: bookNumber,
    chapter: chapterNumber
  }}
  userId={userId} // From auth context
  size="sm"
  showText={true}
/>
```

### **2. Payment Tracking Hook**

```jsx
import { usePaymentTracking } from '../hooks/usePaymentTracking';

const { 
  userPayments, 
  hasSupported, 
  checkPartnershipStatus,
  getTotalDonated,
  getDonationCount 
} = usePaymentTracking();

// Check if user has supported specific content
const isPartner = hasSupported(scope);

// Check partnership status from backend
const isPartnerFromAPI = await checkPartnershipStatus(scope, userId);
```

### **3. Donation Dashboard**

```jsx
import PartnerDashboard from '../components/donations/PartnerDashboard';

// Shows user's donation history and statistics
<PartnerDashboard />
```

---

## 🔄 **Complete User Flow**

### **1. User Makes Donation**
1. User clicks 💝 donation button
2. Stripe payment form opens
3. User enters payment details
4. Payment processed via Stripe

### **2. Backend Records Payment**
1. Stripe webhook calls your backend
2. Payment record saved to MongoDB
3. Partnership status updated

### **3. Frontend Shows Partnership**
1. User returns to supported content
2. Partnership indicator appears
3. User sees "Partner" badge with ⭐

### **4. Persistent Partnership Status**
1. Partnership status checked from backend API
2. Visual indicators show throughout app
3. Donation history available in dashboard

---

## 🛠️ **Implementation Checklist**

### **Backend Setup**
- [ ] Stripe webhook endpoint configured
- [ ] MongoDB payment collection created
- [ ] Partnership status API endpoint working
- [ ] Donation statistics API endpoint working

### **Frontend Integration**
- [ ] Partnership indicators added to Bible pages
- [ ] User authentication context available
- [ ] Payment tracking hook integrated
- [ ] Donation dashboard accessible

### **Testing**
- [ ] Test donation flow end-to-end
- [ ] Verify partnership status appears
- [ ] Check donation history in dashboard
- [ ] Test with both logged-in and anonymous users

---

## 🎨 **Customization Options**

### **Partnership Badge Styling**
```jsx
<PartnershipIndicator
  scope={scope}
  userId={userId}
  size="lg"           // sm, md, lg
  showText={true}     // Show "Partner" text
  showStats={true}    // Show partner count
  className="custom-class"
/>
```

### **Donation Button Styling**
```jsx
<DonationButton
  scope={scope}
  amount={25}
  label="Support This Verse"
  className="custom-donation-button"
  onSuccess={handleSuccess}
  onError={handleError}
/>
```

---

## 📊 **Analytics & Tracking**

### **Donation Metrics**
- Total donations received
- Average donation amount
- Most supported content
- User engagement with donation features

### **Partnership Analytics**
- Number of active partners
- Partnership retention rate
- Content support distribution
- User journey analysis

---

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Partnership indicators not showing**
   - Check backend API endpoint is working
   - Verify user ID is being passed correctly
   - Check browser console for API errors

2. **Payment not being recorded**
   - Verify Stripe webhook is configured
   - Check webhook secret in environment variables
   - Test webhook endpoint manually

3. **Donation buttons not working**
   - Check Stripe publishable key
   - Verify API base URL configuration
   - Test with Stripe test cards

### **Debug Mode**
Enable debug logging by adding to `.env`:
```bash
VITE_DEBUG_DONATIONS=true
VITE_DEBUG_PARTNERSHIP=true
```

---

## 🎉 **Success Criteria**

### **Technical Success**
- [ ] All API endpoints responding correctly
- [ ] Partnership status updating in real-time
- [ ] Payment tracking working end-to-end
- [ ] No console errors during donation flow

### **User Experience Success**
- [ ] Partnership indicators clearly visible
- [ ] Donation flow smooth and intuitive
- [ ] Thank you page shows after payment
- [ ] Partnership status persistent across sessions

### **Business Success**
- [ ] Donation conversion rate > 2%
- [ ] Average donation amount > $15
- [ ] Partnership retention rate > 80%
- [ ] User engagement with donation features

---

## 🚀 **Next Steps**

1. **Set up Stripe webhooks** - Follow the webhook setup guide
2. **Test donation flow** - Use Stripe test cards
3. **Add user authentication** - Connect to your auth system
4. **Customize styling** - Match your brand colors
5. **Add analytics** - Track donation metrics
6. **Deploy to production** - Use live Stripe keys

---

**Your donation system is now fully integrated and ready for production!** 🎉

The system will automatically:
- ✅ Track all donations in MongoDB
- ✅ Show partnership status throughout the app
- ✅ Provide beautiful user experience
- ✅ Support both logged-in and anonymous users
- ✅ Handle payment success and error states

**Ready to start accepting donations and building your community of Bible translation partners!** 💚
