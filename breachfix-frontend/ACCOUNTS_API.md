# Accounts API Frontend Implementation

## Overview

The Accounts API frontend provides comprehensive sub-account management with role-based access control, PIN security, audit trails, and avatar upload capabilities. This implementation connects to the v3 Accounts backend module.

## Features

- ✅ **Core Account Operations**: Create, read, update, delete, reactivate accounts
- ✅ **Security & PIN Management**: PIN validation, change, and account unlocking
- ✅ **Role Management**: Add, update, remove user roles with RBAC
- ✅ **Avatar Upload**: Direct upload with unified media system
- ✅ **Admin & Analytics**: Dashboard analytics and admin operations
- ✅ **Audit Trail**: Complete activity logging
- ✅ **TypeScript Support**: Full type safety and IntelliSense

## Quick Start

### 1. Basic Usage

```typescript
import { useMediaApi } from '../hooks/useApi';

// Get all accounts
const { data: accounts, isLoading } = useMediaApi.accounts.useGetAll();

// Create a new account
const createAccount = useMediaApi.accounts.useCreate();
const handleCreate = async () => {
  await createAccount.mutateAsync({
    name: 'My Account',
    pin: '1234',
    type: 'standard'
  });
};
```

### 2. Account Management

```typescript
// Get specific account
const { data: account } = useMediaApi.accounts.useGetById(accountId);

// Update account
const updateAccount = useMediaApi.accounts.useUpdate();
await updateAccount.mutateAsync({
  accountId: 'account-id',
  data: { name: 'Updated Name', type: 'kids' }
});

// Delete account (soft delete)
const deleteAccount = useMediaApi.accounts.useDelete();
await deleteAccount.mutateAsync('account-id');

// Reactivate account
const reactivateAccount = useMediaApi.accounts.useReactivate();
await reactivateAccount.mutateAsync('account-id');
```

### 3. PIN Management

```typescript
// Validate PIN
const validatePin = useMediaApi.accounts.useValidatePin();
const result = await validatePin.mutateAsync({
  accountId: 'account-id',
  pin: '1234'
});

// Change PIN
const changePin = useMediaApi.accounts.useChangePin();
await changePin.mutateAsync({
  accountId: 'account-id',
  data: {
    currentPin: '1234',
    newPin: '5678'
  }
});

// Unlock account
const unlockAccount = useMediaApi.accounts.useUnlock();
await unlockAccount.mutateAsync('account-id');
```

### 4. Role Management

```typescript
// Get user role
const { data: role } = useMediaApi.accounts.useGetUserRole(accountId, userId);

// Add user role
const addUserRole = useMediaApi.accounts.useAddUserRole();
await addUserRole.mutateAsync({
  accountId: 'account-id',
  data: {
    targetUserId: 'user-id',
    role: 'editor'
  }
});

// Update user role
const updateUserRole = useMediaApi.accounts.useUpdateUserRole();
await updateUserRole.mutateAsync({
  accountId: 'account-id',
  targetUserId: 'user-id',
  data: { role: 'owner' }
});

// Remove user role
const removeUserRole = useMediaApi.accounts.useRemoveUserRole();
await removeUserRole.mutateAsync({
  accountId: 'account-id',
  targetUserId: 'user-id'
});
```

### 5. Avatar Upload

```typescript
// Upload avatar
const uploadAvatar = useMediaApi.accounts.useUploadAvatar();
const handleUpload = async (file: File) => {
  await uploadAvatar.mutateAsync({
    accountId: 'account-id',
    file: file
  });
};
```

### 6. Admin Operations

```typescript
// Get analytics
const { data: analytics } = useMediaApi.accounts.useGetAnalytics();

// Get locked accounts
const { data: lockedAccounts } = useMediaApi.accounts.useGetLockedAccounts();

// Get deleted accounts
const { data: deletedAccounts } = useMediaApi.accounts.useGetDeletedAccounts({
  page: 1,
  limit: 20,
  includeInactive: true
});
```

## TypeScript Interfaces

### Account Interface

```typescript
interface Account {
  _id: string;
  userId: string;
  name: string;
  isActive: boolean;
  type: 'standard' | 'kids' | 'adult';
  avatar?: string;
  roles: AccountRole[];
  auditLogs: AuditLog[];
  createdAt: string;
  updatedAt: string;
}
```

### Account Role Interface

```typescript
interface AccountRole {
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  addedAt: string;
  addedBy: string;
}
```

### Audit Log Interface

```typescript
interface AuditLog {
  action: string;
  date: string;
  meta: Record<string, any>;
}
```

### Analytics Interface

```typescript
interface AccountAnalytics {
  totalAccounts: number;
  activeAccounts: number;
  lockedAccounts: number;
  deletedAccounts: number;
  accountsByType: {
    standard: number;
    kids: number;
    adult: number;
  };
  recentActivity: AuditLog[];
}
```

## API Methods

### Core Account Operations

| Method | Hook | Description |
|--------|------|-------------|
| `getAll()` | `useGetAll()` | Get all user accounts |
| `getById(id)` | `useGetById(id)` | Get specific account |
| `create(data)` | `useCreate()` | Create new account |
| `update(id, data)` | `useUpdate()` | Update account |
| `delete(id)` | `useDelete()` | Soft delete account |
| `reactivate(id)` | `useReactivate()` | Reactivate account |
| `purge(id)` | `usePurge()` | Hard delete (admin only) |

### Security & PIN Management

| Method | Hook | Description |
|--------|------|-------------|
| `validatePin(data)` | `useValidatePin()` | Validate account PIN |
| `changePin(id, data)` | `useChangePin()` | Change account PIN |
| `unlock(id)` | `useUnlock()` | Unlock locked account |

### Role Management

| Method | Hook | Description |
|--------|------|-------------|
| `getUserRole(accountId, userId)` | `useGetUserRole(accountId, userId)` | Get user role |
| `addUserRole(accountId, data)` | `useAddUserRole()` | Add user role |
| `updateUserRole(accountId, userId, data)` | `useUpdateUserRole()` | Update user role |
| `removeUserRole(accountId, userId)` | `useRemoveUserRole()` | Remove user role |

### Avatar Upload

| Method | Hook | Description |
|--------|------|-------------|
| `uploadAvatar(accountId, file)` | `useUploadAvatar()` | Upload account avatar |

### Admin & Analytics

| Method | Hook | Description |
|--------|------|-------------|
| `getAnalytics()` | `useGetAnalytics()` | Get account analytics |
| `getLockedAccounts()` | `useGetLockedAccounts()` | Get locked accounts |
| `getDeletedAccounts(params)` | `useGetDeletedAccounts(params)` | Get deleted accounts |

## Error Handling

### Standard Error Response

```typescript
interface ErrorResponse {
  success: false;
  message: string;
  error?: {
    details: Array<{
      field: string;
      message: string;
    }>;
    count: number;
  };
}
```

### Common Error Codes

- `400` - Validation errors (invalid PIN, duplicate name, invalid file type)
- `401` - Authentication required
- `403` - Insufficient permissions
- `404` - Account not found
- `409` - Conflict (e.g., purge without soft delete)
- `423` - Account locked or paused
- `429` - Rate limit exceeded

### Error Handling Example

```typescript
const createAccount = useMediaApi.accounts.useCreate();

const handleCreate = async () => {
  try {
    await createAccount.mutateAsync({
      name: 'My Account',
      pin: '1234',
      type: 'standard'
    });
    alert('Account created successfully!');
  } catch (error: any) {
    if (error.response?.status === 400) {
      alert('Validation error: ' + error.response.data.message);
    } else if (error.response?.status === 401) {
      alert('Please log in to create accounts');
    } else {
      alert('Failed to create account: ' + error.message);
    }
  }
};
```

## Best Practices

### 1. Authentication

Always ensure the user is authenticated before making API calls:

```typescript
const { isAuthenticated } = useAuthStore();

if (!isAuthenticated) {
  return <div>Please log in to access accounts</div>;
}
```

### 2. Loading States

Handle loading states for better UX:

```typescript
const { data: accounts, isLoading, error } = useMediaApi.accounts.useGetAll();

if (isLoading) {
  return <div>Loading accounts...</div>;
}

if (error) {
  return <div>Error loading accounts: {error.message}</div>;
}
```

### 3. Optimistic Updates

Use React Query's cache invalidation for automatic updates:

```typescript
const updateAccount = useMediaApi.accounts.useUpdate();

// The cache will automatically update after successful mutation
await updateAccount.mutateAsync({
  accountId: 'account-id',
  data: { name: 'New Name' }
});
```

### 4. Form Validation

Validate forms before submission:

```typescript
const [form, setForm] = useState({
  name: '',
  pin: '',
  type: 'standard' as const
});

const isValid = form.name.length > 0 && 
                form.pin.length === 4 && 
                /^\d{4}$/.test(form.pin);

// Disable submit button if invalid
<button disabled={!isValid || createAccount.isPending}>
  Create Account
</button>
```

### 5. File Upload Validation

Validate avatar files before upload:

```typescript
const validateFile = (file: File) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (file.size > maxSize) {
    throw new Error('File too large. Max size: 10MB');
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP');
  }
  
  return true;
};
```

## Security Considerations

### 1. PIN Security

- PINs are 4-digit numbers only
- Rate limiting: 5 attempts per minute per IP
- Automatic lockout after 5 failed attempts (10 minutes)
- PINs are hashed with bcrypt on the backend

### 2. Role-Based Access Control

- **Owner**: Full access (create, read, update, delete, manage roles, upload avatars)
- **Editor**: Read, update, upload avatars, cannot delete or manage roles
- **Viewer**: Read-only access

### 3. Account Protection

- **Sole Owner Protection**: Cannot remove the only owner of an account
- **Owner Promotion**: Only account owner or platform admin can promote users to owner
- **Unique Membership**: Each user can have only one role per account

### 4. Avatar Upload Security

- File type validation (JPEG, PNG, WebP only)
- File size limit (10MB maximum)
- Ownership validation prevents cross-tenant abuse
- Rate limiting: 20 requests per 10 minutes per user

## Examples

### Complete Account Management Component

```typescript
import React, { useState } from 'react';
import { useMediaApi } from '../hooks/useApi';

const AccountManager: React.FC = () => {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  
  // Data hooks
  const { data: accounts, isLoading } = useMediaApi.accounts.useGetAll();
  const { data: selectedAccountData } = useMediaApi.accounts.useGetById(selectedAccount || '', {
    enabled: !!selectedAccount
  });
  
  // Mutation hooks
  const createAccount = useMediaApi.accounts.useCreate();
  const updateAccount = useMediaApi.accounts.useUpdate();
  const deleteAccount = useMediaApi.accounts.useDelete();
  
  const handleCreate = async (formData: any) => {
    try {
      await createAccount.mutateAsync(formData);
      alert('Account created successfully!');
    } catch (error: any) {
      alert('Failed to create account: ' + error.response?.data?.message);
    }
  };
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Account Management</h1>
      
      {/* Account List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accounts?.accounts.map(account => (
          <div 
            key={account._id}
            onClick={() => setSelectedAccount(account._id)}
            className="p-4 border rounded cursor-pointer"
          >
            <h3>{account.name}</h3>
            <p>Type: {account.type}</p>
            <p>Status: {account.isActive ? 'Active' : 'Inactive'}</p>
          </div>
        ))}
      </div>
      
      {/* Selected Account Details */}
      {selectedAccountData && (
        <div className="mt-8 p-4 border rounded">
          <h2>Account Details: {selectedAccountData.name}</h2>
          <p>Roles: {selectedAccountData.roles.length}</p>
          <p>Created: {new Date(selectedAccountData.createdAt).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
};
```

### PIN Management Component

```typescript
import React, { useState } from 'react';
import { useMediaApi } from '../hooks/useApi';

const PinManager: React.FC = () => {
  const [form, setForm] = useState({
    accountId: '',
    currentPin: '',
    newPin: ''
  });
  
  const validatePin = useMediaApi.accounts.useValidatePin();
  const changePin = useMediaApi.accounts.useChangePin();
  
  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await validatePin.mutateAsync({
        accountId: form.accountId,
        pin: form.currentPin
      });
      alert(`PIN validation: ${result.message}`);
    } catch (error: any) {
      alert('PIN validation failed: ' + error.response?.data?.message);
    }
  };
  
  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await changePin.mutateAsync({
        accountId: form.accountId,
        data: {
          currentPin: form.currentPin,
          newPin: form.newPin
        }
      });
      alert('PIN changed successfully!');
      setForm({ accountId: '', currentPin: '', newPin: '' });
    } catch (error: any) {
      alert('Failed to change PIN: ' + error.response?.data?.message);
    }
  };
  
  return (
    <div>
      <h2>PIN Management</h2>
      
      <form onSubmit={handleValidate} className="mb-4">
        <h3>Validate PIN</h3>
        <input
          type="text"
          placeholder="Account ID"
          value={form.accountId}
          onChange={e => setForm({ ...form, accountId: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="PIN"
          value={form.currentPin}
          onChange={e => setForm({ ...form, currentPin: e.target.value })}
          pattern="[0-9]{4}"
          maxLength={4}
          required
        />
        <button type="submit" disabled={validatePin.isPending}>
          {validatePin.isPending ? 'Validating...' : 'Validate PIN'}
        </button>
      </form>
      
      <form onSubmit={handleChange}>
        <h3>Change PIN</h3>
        <input
          type="password"
          placeholder="New PIN"
          value={form.newPin}
          onChange={e => setForm({ ...form, newPin: e.target.value })}
          pattern="[0-9]{4}"
          maxLength={4}
          required
        />
        <button type="submit" disabled={changePin.isPending}>
          {changePin.isPending ? 'Changing...' : 'Change PIN'}
        </button>
      </form>
    </div>
  );
};
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Ensure user is authenticated and token is valid
2. **403 Forbidden**: Check user permissions for the specific operation
3. **404 Not Found**: Verify account ID exists and user has access
4. **429 Too Many Requests**: Wait for rate limit to reset
5. **500 Internal Server Error**: Check backend logs for server issues

### Debug Tips

1. **Enable Development Logging**: Check browser console for detailed error messages
2. **Verify API Endpoints**: Ensure backend routes are properly configured
3. **Check Network Tab**: Monitor API requests and responses
4. **Validate Data**: Ensure all required fields are provided with correct formats

## Migration Guide

### From Legacy API

If migrating from a legacy accounts API:

1. Update import statements to use `useMediaApi.accounts`
2. Replace direct API calls with React Query hooks
3. Update TypeScript interfaces to match new schema
4. Implement proper error handling with new error format
5. Update avatar upload to use unified media system

### Breaking Changes

- PIN validation now requires both `accountId` and `pin` fields
- Role management uses separate endpoints for add/update/remove
- Avatar upload uses unified media upload system
- All mutations return proper error responses with details

## Support

For issues or questions:

1. Check the browser console for error messages
2. Verify backend API is running and accessible
3. Ensure authentication tokens are valid
4. Review this documentation for usage examples
5. Check the backend API documentation for endpoint details
