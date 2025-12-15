# E-Commerce Frontend Coding Instructions

## Architecture Overview

This is a **React 18 SPA** using Material-UI v5, React Router v6, and Context API for state management. The app follows a **security-first approach** with comprehensive XSS protection, CSRF tokens, encrypted token storage, and automatic token refresh.

**Key architectural pattern**: Layered architecture with strict separation:
- **Contexts** (`src/contexts/`) - Global state (Auth, Cart, Favorites, Store/Theme)
- **Services** (`src/services/`) - All API calls via centralized axios instance
- **Hooks** (`src/hooks/`) - Reusable stateful logic (useDataFetching, useForm)
- **Components** (`src/components/`) - Presentation layer (DataTable, EmptyState, etc.)
- **Pages** (`src/pages/`) - Route-level components composing contexts + components

## Security-First Development

**CRITICAL**: This codebase prioritizes security. All new features MUST follow these patterns:

### Authentication Flow
- Tokens stored **encrypted** in sessionStorage (access) and localStorage (refresh) via `secureStorage.js`
- Auth interceptor in `api.js` handles automatic token refresh on 401 responses
- All API requests include security headers: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`
- Example token refresh logic: See [src/services/api.js](src/services/api.js#L86-L133)

### Input Sanitization
Always sanitize user input using `utils/security.js`:
```javascript
import { sanitizeInput, sanitizeHTML, validateEmail } from '../utils/security';

// Before sending to API
const cleanData = sanitizeObject(formData); // Auto-applied in api.js interceptor

// Before rendering user content
<div>{sanitizeHTML(userProvidedText)}</div>
```

## Context Usage Patterns

**All contexts follow the same structure**:
1. Create context with JSDoc typedef
2. Export custom hook (`useAuth`, `useCart`, etc.) that throws if used outside provider
3. Provider component manages state + API calls via services
4. Example: [src/contexts/AuthContext.js](src/contexts/AuthContext.js)

**Context dependency hierarchy**:
```
App.js
└─ StoreProvider (theme from API, wraps everything)
   └─ Router
      └─ AuthProvider (user state)
         └─ CartProvider (depends on auth)
            └─ FavoritesProvider (depends on auth)
```

**Never** call context hooks outside their provider tree. Always destructure needed values:
```javascript
const { user, login, logout } = useAuth();
const { cart, addToCart, itemCount } = useCart();
```

## Custom Hooks

### useDataFetching
Standard hook for API calls with loading/error states:
```javascript
const { data, loading, error, refetch } = useDataFetching(
  () => productService.getProducts({ category: 'electronics' }),
  [category], // dependencies trigger refetch
  { onSuccess: (data) => console.log('Loaded', data) }
);
```

### useForm
Form state + validation:
```javascript
const { values, errors, handleChange, handleSubmit } = useForm(
  { email: '', password: '' },
  async (values) => await login(values),
  (values) => validateLoginForm(values) // optional validator
);
```

## Reusable Components

### DataTable (Template Method Pattern)
For any data table, use `<DataTable>` with column definitions:
```javascript
<DataTable
  columns={[
    { field: 'name', header: 'Product Name' },
    { field: 'price', header: 'Price', render: (row) => `$${row.price}` }
  ]}
  data={products}
  loading={loading}
  emptyState={{ title: 'No products', description: 'Add some products!' }}
/>
```

### EmptyState (Composite Pattern)
Consistent empty states across the app:
```javascript
<EmptyState
  icon={ShoppingCartOutlined}
  iconColor="primary.main"
  title="Cart is Empty"
  description="Add products to get started"
  actionLabel="Browse Products"
  onAction={() => navigate('/products')}
/>
```

## API Service Pattern

**All API calls go through services** (`src/services/`). Never call axios directly from components.

Service pattern:
```javascript
// services/productService.js
import api from './api';

const productService = {
  getProducts: async (filters = {}) => {
    const response = await api.get('/products', { params: filters });
    return response.data;
  },
  // ... other methods
};

export default productService;
```

The centralized `api.js` axios instance handles:
- Token injection and auto-refresh
- Input sanitization (via request interceptor)
- Global error notifications (using notistack)
- Security headers

## Styling Conventions

Using **Material-UI's `sx` prop** exclusively (no styled-components or CSS files):
```javascript
<Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
  <Button variant="contained" sx={{ px: 4, borderRadius: 2 }}>
    Action
  </Button>
</Box>
```

**Theme customization**: The `StoreProvider` fetches store settings from API and creates a dynamic MUI theme with custom colors. Access theme values via `sx` or `useTheme()`.

## Navigation

Use React Router v6 patterns:
- `<Navigate to="/login" replace />` for redirects
- `useNavigate()` hook for programmatic navigation
- `ProtectedRoute` wrapper for authenticated routes (see [src/App.js](src/App.js#L66-L71))

## Error Handling

Errors are displayed via **notistack** (configured in App.js):
```javascript
// In components (via context hooks)
try {
  await addToCart(productId, quantity);
  enqueueSnackbar('Added to cart!', { variant: 'success' });
} catch (error) {
  // API interceptor already shows error notification
}
```

Global notification handler is set in `api.js` via `setNotificationHandler(enqueueSnackbar)`.

## Development Workflow

```bash
npm start          # Development server on :3000
npm run build      # Production build
npm test           # Run tests
```

**Environment variables**: Configure in `.env`:
```
REACT_APP_API_BASE_URL=http://localhost:8001
REACT_APP_API_VERSION=v1
```

## Common Patterns to Follow

1. **JSDoc comments** on all functions/components (see existing files)
2. **PropTypes** validation on all components
3. **Async/await** (not .then/.catch) for API calls
4. **Early returns** in components for loading/error/empty states
5. **Functional components** only (no class components)
6. Export components as **default**, utilities as **named exports**

## What NOT to Do

❌ Don't store tokens in plain text - use `secureStorage.js`  
❌ Don't call axios directly - use services  
❌ Don't use inline styles - use MUI's `sx` prop  
❌ Don't access context without the custom hook (e.g., use `useAuth()` not `useContext(AuthContext)`)  
❌ Don't skip input sanitization for user-provided data  
❌ Don't create new loading/error components - use `LoadingState`, `ErrorState`, `EmptyState`
