# Modal Standardization Guide

## Overview
I've created a `BaseModal` component that provides consistent styling, behavior, and functionality across all modals in your application. The BaseModal includes:

- **Consistent styling** with your dark theme
- **Close button** in the header
- **Click outside to close** functionality
- **Escape key to close**
- **Body scroll prevention** when modal is open
- **Consistent animations** (using your existing animate-fadeIn class)
- **Customizable sizing** and icons

## What I've Updated

### 1. Created BaseModal Component
**File:** `src/components/BaseModal.tsx`

**Features:**
- Reusable modal wrapper
- Consistent header with optional title, subtitle, and icon
- Configurable close behaviors
- Responsive sizing options
- Accessibility features (escape key, focus management)

### 2. Updated GuestList Page Modals
**File:** `src/pages/GuestList.tsx`

**Changes:**
- Guest list view modal → now uses BaseModal
- Create/edit list modal → now uses BaseModal
- Removed duplicate modal styling code
- Consistent behavior across all modals

### 3. Updated Modal Components
**Files Updated:**
- `src/components/BroadcastModal.tsx`
- `src/components/GuestListModal.tsx` 
- `src/components/ReportModal.tsx`
- `src/components/ShareModal.tsx`

## How to Update Remaining Modals

For the remaining 12+ modal components, follow this pattern:

### Step 1: Import BaseModal
```tsx
import BaseModal from "./BaseModal";
import { FaIconName } from "react-icons/fa"; // Choose appropriate icon
```

### Step 2: Replace Modal Structure
**Before:**
```tsx
return (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="p-4 bg-dark rounded-lg shadow-lg">
      {/* Modal Header */}
      <div className="flex items-center justify-between mb-4 border-b border-gray-500">
        <h3 className="text-xl font-semibold text-teal-500">Modal Title</h3>
        <button onClick={onClose}>
          <FaTimesCircle className="w-6 h-6" />
        </button>
      </div>
      {/* Modal Content */}
      <div>{children}</div>
    </div>
  </div>
);
```

**After:**
```tsx
return (
  <BaseModal
    isOpen={isOpen}
    onClose={onClose}
    title="Modal Title"
    subtitle="Optional subtitle"
    icon={<FaIconName className="w-5 h-5" />}
    closeOnClickOutside={true}
    minWidth="min-w-96"
    maxWidth="md:max-w-lg"
  >
    {/* Modal Content */}
    <div>{children}</div>
  </BaseModal>
);
```

### Step 3: Choose Appropriate Props

**Common Icon Examples:**
- `<FaUser />` - Profile/user modals
- `<FaCog />` - Settings/preferences
- `<FaCalendar />` - Event-related modals
- `<FaComment />` - Comments/messaging
- `<FaBookmark />` - Bookmarks/favorites
- `<FaSearch />` - Search modals
- `<FaPlus />` - Create/add modals

**Common Size Combinations:**
- Small modals: `minWidth="min-w-80" maxWidth="max-w-sm"`
- Medium modals: `minWidth="min-w-96" maxWidth="md:max-w-lg"`
- Large modals: `minWidth="min-w-96" maxWidth="md:max-w-2xl"`
- Full-width: `minWidth="min-w-96" maxWidth="md:max-w-4xl"`

## Benefits of This Approach

1. **Consistency**: All modals now have the same look, feel, and behavior
2. **Maintainability**: Changes to modal behavior only need to be made in one place
3. **Accessibility**: Built-in keyboard navigation and screen reader support
4. **Performance**: Prevents body scroll and handles focus management
5. **Developer Experience**: Less boilerplate code for each modal

## Remaining Modals to Update

You still have these modal components that can be updated to use BaseModal:

- `BookingModal.tsx`
- `CRUDModal.tsx`
- `CommentsModal.tsx`
- `EditEventModal.tsx`
- `EventFormModal.tsx`
- `NotificationsModal.tsx`
- `FollowersModal.tsx`
- `RepostModal.tsx`
- `PreferencesModal.tsx`
- `SocialLinksModal.tsx`
- `SearchFormModal.tsx`
- `TippingModal.tsx`

Each of these should take about 5-10 minutes to update following the pattern above.

## Testing Checklist

After updating each modal, verify:
- ✅ Modal opens and closes properly
- ✅ Click outside to close works
- ✅ Escape key closes modal
- ✅ Close button works
- ✅ Content displays correctly
- ✅ Responsive behavior is maintained
- ✅ All functionality still works
