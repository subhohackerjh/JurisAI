# Button & Interaction Testing Guide

Quick reference for testing all buttons and interactive elements in LegalConnect.

## 🏠 Landing Page Buttons

| Button | Expected Action | Status |
|--------|-----------------|--------|
| "Sign In" (top right) | Navigate to /login | ✅ |
| "Get Started" (top right) | Navigate to /login | ✅ |
| "Explore Advocates" (hero) | Navigate to /login | ✅ |
| "File a Case" (hero) | Navigate to /login | ✅ |
| "Start Now" (CTA section) | Navigate to /login | ✅ |

## 🔐 Login Page Buttons

| Button | Expected Action | Status |
|--------|-----------------|--------|
| Sign In (form submit) | Validate credentials, show error or redirect | ✅ |
| Demo Account Cards | Auto-fill email and password | ✅ |
| Back to Home | Navigate to home | ✅ |

**Test with:**
- Valid credentials: Any demo account email + "password"
- Invalid credentials: Wrong password (shows error message)

## 📊 Dashboard Buttons (All Roles)

### Header Navigation
| Button | Expected Action | Notes |
|--------|-----------------|-------|
| Logo/Dashboard | Return to main dashboard | Top left |
| Dashboard Link | Navigate to main dashboard | Desktop nav |
| Legal AI Link | Navigate to /dashboard/chat | Citizen only |
| Advocates Link | Navigate to /dashboard/advocates | Citizen only |
| Feedback Link | Navigate to /dashboard/feedback | All roles |
| User Profile Dropdown | Show user info and logout | Top right |
| Logout | Clear session, return to home | In dropdown |

### Mobile Navigation
| Button | Expected Action | Notes |
|--------|-----------------|-------|
| Hamburger Menu | Toggle mobile nav menu | Shows on mobile |
| Mobile Nav Links | Navigate to respective pages | Scrollable on mobile |
| Close Menu (X) | Close mobile nav menu | Closes menu |

## 👤 Citizen Dashboard

| Button | Expected Action | Status |
|--------|-----------------|--------|
| "File New Case" | Navigate to /dashboard/file-case | ✅ |
| Case Cards | Navigate to /dashboard/case/[id] | ✅ |
| "View Profile" (advocate) | Navigate to /dashboard/advocates/[id] | ✅ |
| Tab Navigation | Switch between My Cases / Advocates / Legal AI | ✅ |

## 🏢 Advocate Dashboard

| Button | Expected Action | Status |
|--------|-----------------|--------|
| Case Cards | Navigate to /dashboard/case/[id] | ✅ |

## 👮 Police Officer Dashboard

| Button | Expected Action | Status |
|--------|-----------------|--------|
| Case Cards | Navigate to /dashboard/case/[id] | ✅ |

## 👨‍⚖️ Admin Dashboard

| Button | Expected Action | Status |
|--------|-----------------|--------|
| "Respond" (feedback) | Expand feedback card | ✅ |
| "View" (feedback) | Show full feedback details | ✅ |
| "Mark as Resolved" | Update status, close expansion | ✅ |
| "Close" | Collapse feedback card | ✅ |

## 🔍 Advocate Discovery Page

| Button | Expected Action | Status |
|--------|-----------------|--------|
| "View Profile" | Navigate to advocate detail page | ✅ |
| Advocate Card | Navigate to advocate detail page | ✅ |

## 👤 Advocate Detail Page

| Button | Expected Action | Status |
|--------|-----------------|--------|
| "Back to Advocates" | Navigate back to /dashboard/advocates | ✅ |
| "Connect" (if visible) | Initiate contact with advocate | ✅ |

## 📝 Case Detail Page

| Button | Expected Action | Status |
|--------|-----------------|--------|
| "Back" button | Navigate back to /dashboard | ✅ |
| "View Full" (documents) | Expand document list | ✅ |

## 💬 Chat Page

| Button | Expected Action | Status |
|--------|-----------------|--------|
| "Send" button | Send message, clear input | ✅ |
| Sample Questions | Populate input with question | ✅ |
| Input Field | Accept text, enable send button when not empty | ✅ |

## 📋 File Case Page

| Button | Expected Action | Status |
|--------|-----------------|--------|
| "File Case" | Submit form, show loading, redirect to dashboard | ✅ |
| "Cancel" | Navigate back to /dashboard | ✅ |
| Form Fields | Accept input, validate on submit | ✅ |

## 📝 Feedback Page

| Button | Expected Action | Status |
|--------|-----------------|--------|
| Star Ratings (1-5) | Set rating value | ✅ |
| Category Dropdown | Select feedback category | ✅ |
| "Submit Feedback" | Submit form, show success screen | ✅ |
| "Cancel" | Navigate back to /dashboard | ✅ |

---

## ✅ Form Button Testing Checklist

### Login Form
- [ ] Sign In button disabled until fields filled
- [ ] Sign In button shows loading state on click
- [ ] Demo buttons are clickable and auto-fill form

### File Case Form
- [ ] File Case button disabled until required fields filled
- [ ] Form shows loading state while submitting
- [ ] Cancel button returns to dashboard
- [ ] All dropdowns work correctly

### Feedback Form
- [ ] Submit button disabled until all required fields filled
- [ ] Star rating buttons are clickable
- [ ] Category dropdown works
- [ ] Text inputs accept text
- [ ] Submit shows loading and success states

---

## 🎯 Interactive Element Testing

### Tabs
- [ ] Citizen dashboard tabs switch content
- [ ] Active tab shows underline
- [ ] Content updates smoothly
- [ ] Mobile scrolls horizontally if needed

### Dropdowns
- [ ] User profile dropdown opens/closes
- [ ] Mobile menu hamburger opens/closes
- [ ] Category/role dropdowns open and show options
- [ ] Selection works on all dropdowns

### Hover Effects
- [ ] Buttons change color on hover (desktop)
- [ ] Cards lift on hover
- [ ] Links underline on hover
- [ ] Transitions are smooth

### Loading States
- [ ] Buttons show loading text when submitting
- [ ] Spinners appear during async operations
- [ ] Loading state prevents double-clicks

---

## 🔗 Navigation Testing

### All Routes Accessible
- [ ] /
- [ ] /login
- [ ] /dashboard
- [ ] /dashboard/chat
- [ ] /dashboard/advocates
- [ ] /dashboard/advocates/[id]
- [ ] /dashboard/case/[id]
- [ ] /dashboard/file-case
- [ ] /dashboard/feedback

### Protected Routes
- [ ] Cannot access /dashboard without login
- [ ] Cannot access role-specific pages with wrong role
- [ ] Redirects to appropriate dashboard per role
- [ ] Back button works on all pages

---

## 📱 Mobile Button Testing

### Touch Targets
- [ ] All buttons are at least 44px tall
- [ ] All buttons have adequate padding
- [ ] No button overlap on small screens
- [ ] Forms are touch-friendly

### Responsive Layout
- [ ] Buttons stack vertically on mobile
- [ ] Full-width buttons on mobile
- [ ] Auto-width buttons on desktop
- [ ] Spacing scales appropriately

### Mobile Navigation
- [ ] Hamburger menu works smoothly
- [ ] Menu closes after navigation
- [ ] Back navigation works
- [ ] No horizontal scrolling

---

## 🐛 Common Issues to Check

### Button Issues
- ❌ Button not clickable → Check if disabled state is correct
- ❌ Wrong navigation → Check href/onClick handler
- ❌ Loading state doesn't clear → Check async handler completion
- ❌ Form doesn't submit → Check form validation

### Navigation Issues
- ❌ Page doesn't load → Check route configuration
- ❌ Back button doesn't work → Check useRouter implementation
- ❌ Protected route accessible → Check auth guard

### Mobile Issues
- ❌ Button too small → Increase padding/min-height
- ❌ Menu overlaps content → Check z-index
- ❌ Text is cut off → Check line-clamp class
- ❌ No scrolling → Check overflow classes

---

## 📊 Test Results Template

```markdown
# Test Results - [Date]

## Buttons Tested: __ / __

### Passed ✅
- Button Name
- Button Name

### Failed ❌
- Button Name (Issue: ...)
- Button Name (Issue: ...)

### Notes
- Navigation works smoothly
- Performance is good
- Mobile experience is responsive

### Recommendations
- [If any issues found]
```

---

## 🎯 Quick Test Flow

**As Citizen:**
1. Login → Home dashboard
2. Click "File New Case" → Form works
3. Click "Find Advocates" → Can view advocates
4. Click advocate → Detail page loads
5. Click "Legal AI" → Chat works
6. Click "Feedback" → Form submits
7. Logout → Returns to home

**As Admin:**
1. Login → Admin dashboard
2. Scroll to feedback section
3. Click "Respond" → Can expand and respond
4. "Mark as Resolved" → Status updates
5. Logout

---

**All buttons tested and working? ✅ Application is ready for use!**
