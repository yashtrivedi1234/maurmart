# Real-Time Admin Panel Integration Guide

This document shows how to integrate real-time updates into all admin pages.

## Quick Integration Pattern

### 1. Import the hook and callbacks
```typescript
import { useCallback } from "react";
import { usePageRefresh } from "@/hooks/usePageRefresh";
```

### 2. Get the query hook
```typescript
const AdminProducts = () => {
  const productsQuery = useGetProductsQuery({});
  const { data: products, isLoading } = productsQuery;
  // ... rest of component
```

### 3. Create refresh handler
```typescript
  const handleRefresh = useCallback(async () => {
    try {
      await productsQuery.refetch();
      console.log("✅ Products refreshed");
    } catch (error) {
      console.error("❌ Error refreshing products:", error);
    }
  }, [productsQuery]);
```

### 4. Add page refresh listener
```typescript
  usePageRefresh({
    page: "products",  // Change per page: "orders", "users", "brands", etc.
    onRefresh: handleRefresh,
  });
```

## Individual Page Updates

### AdminProducts.tsx
```typescript
import { usePageRefresh } from "@/hooks/usePageRefresh";
import { useCallback } from "react";

const AdminProducts = () => {
  const productsQuery = useGetProductsQuery({});
  
  const handleRefresh = useCallback(async () => {
    await productsQuery.refetch();
  }, [productsQuery]);
  
  usePageRefresh({ page: "products", onRefresh: handleRefresh });
  
  // ... rest of component
};
```

### AdminUsers.tsx
```typescript
import { usePageRefresh } from "@/hooks/usePageRefresh";
import { useCallback } from "react";

const AdminUsers = () => {
  const usersQuery = useGetAllUsersQuery();
  
  const handleRefresh = useCallback(async () => {
    await usersQuery.refetch();
  }, [usersQuery]);
  
  usePageRefresh({ page: "users", onRefresh: handleRefresh });
  
  // ... rest of component
};
```

### AdminBrands.tsx
```typescript
import { usePageRefresh } from "@/hooks/usePageRefresh";
import { useCallback } from "react";

const AdminBrands = () => {
  const brandsQuery = useGetBrandsQuery({});
  
  const handleRefresh = useCallback(async () => {
    await brandsQuery.refetch();
  }, [brandsQuery]);
  
  usePageRefresh({ page: "brands", onRefresh: handleRefresh });
  
  // ... rest of component
};
```

### AdminNewsletter.tsx
```typescript
import { usePageRefresh } from "@/hooks/usePageRefresh";
import { useCallback } from "react";

const AdminNewsletter = () => {
  const newsletterQuery = useGetNewsletterQuery({});
  
  const handleRefresh = useCallback(async () => {
    await newsletterQuery.refetch();
  }, [newsletterQuery]);
  
  usePageRefresh({ page: "newsletter", onRefresh: handleRefresh });
  
  // ... rest of component
};
```

### AdminFAQ.tsx
```typescript
import { usePageRefresh } from "@/hooks/usePageRefresh";
import { useCallback } from "react";

const AdminFAQ = () => {
  const faqQuery = useGetFAQQuery({});
  
  const handleRefresh = useCallback(async () => {
    await faqQuery.refetch();
  }, [faqQuery]);
  
  usePageRefresh({ page: "faq", onRefresh: handleRefresh });
  
  // ... rest of component
};
```

### AdminContact.tsx (Messages)
```typescript
import { usePageRefresh } from "@/hooks/usePageRefresh";
import { useCallback } from "react";

const AdminContact = () => {
  const contactsQuery = useGetContactsQuery({});
  
  const handleRefresh = useCallback(async () => {
    await contactsQuery.refetch();
  }, [contactsQuery]);
  
  usePageRefresh({ page: "contact", onRefresh: handleRefresh });
  
  // ... rest of component
};
```

### AdminHero.tsx
```typescript
import { usePageRefresh } from "@/hooks/usePageRefresh";
import { useCallback } from "react";

const AdminHero = () => {
  const heroQuery = useGetHeroQuery({});
  
  const handleRefresh = useCallback(async () => {
    await heroQuery.refetch();
  }, [heroQuery]);
  
  usePageRefresh({ page: "hero", onRefresh: handleRefresh });
  
  // ... rest of component
};
```

### AdminTrending.tsx
```typescript
import { usePageRefresh } from "@/hooks/usePageRefresh";
import { useCallback } from "react";

const AdminTrending = () => {
  const trendingQuery = useGetTrendingQuery({});
  
  const handleRefresh = useCallback(async () => {
    await trendingQuery.refetch();
  }, [trendingQuery]);
  
  usePageRefresh({ page: "trending", onRefresh: handleRefresh });
  
  // ... rest of component
};
```

## Backend Integration

### Emit Events on Data Changes

When you create, update, or delete data, emit Socket.IO events:

```javascript
// In any controller
import { io } from "../server.js";

// When creating
io.to("dashboard").emit("productCreated", { productId, data });
io.to("dashboard").emit("dashboardReload");

// When updating
io.to("dashboard").emit("productUpdated", { productId, data });
io.to("dashboard").emit("dashboardReload");

// When deleting
io.to("dashboard").emit("productDeleted", { productId });
io.to("dashboard").emit("dashboardReload");
```

## Connection Indicator

The connection status automatically appears in the header:
- **🟢 Live** = WebSocket connected
- **🟠 Polling** = Using fallback polling

## Refresh Button

The "Refresh All" button in the header will trigger all page refreshes at once.

## Page Identifiers

Use these exact string identifiers for the `page` parameter:
- `"dashboard"` - Dashboard
- `"products"` - Products page
- `"orders"` - Orders page
- `"users"` - Users page
- `"brands"` - Brands page
- `"newsletter"` - Newsletter page
- `"faq"` - FAQ page
- `"contact"` - Messages/Contact page
- `"hero"` - Hero section
- `"trending"` - Trending deals

## How It Works

1. When a page inits, it listens for `admin-refresh` events via `usePageRefresh`
2. When data changes on backend, Socket.IO emits events
3. The `useAdminRealtime` hook receives events and triggers context functions
4. Context functions dispatch custom `admin-refresh` events
5. Pages listening to those events refetch their data
6. UI automatically updates with new data

## Testing

1. Open admin dashboard
2. Navigate to any page
3. Look for connection indicator (Live/Polling)
4. Make changes (create/update/delete)
5. Page should auto-refresh within 5 seconds
4. Click "Refresh All" button for instant update
