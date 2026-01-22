---
trigger: always_on
---

# React Project Architecture Rules

## Project Structure

```
src/
├── assets/          # Static files (images, fonts, global styles)
├── components/      # Reusable UI components
│   ├── common/     # Generic components (Button, Input, Modal)
│   └── layout/     # Layout components (Header, Footer, Sidebar)
├── pages/          # Page/Route components
├── hooks/          # Custom React hooks
├── services/       # API calls and external services
├── utils/          # Helper functions and utilities
├── constants/      # Constants and enums
├── contexts/       # React Context providers (if not using Redux/Zustand)
└── routes/         # Route configuration
```

## Naming Conventions

### Files & Folders
- **Components**: PascalCase - `Button.jsx`, `UserProfile.jsx`
- **Hooks**: camelCase with 'use' prefix - `useAuth.js`, `useLocalStorage.js`
- **Utils**: camelCase - `formatDate.js`, `validators.js`
- **Constants**: UPPER_SNAKE_CASE - `API_ENDPOINTS.js`, `USER_ROLES.js`
- **Pages**: PascalCase - `Home.jsx`, `UserProfile.jsx`

### Variables & Functions
- **Components**: PascalCase - `const UserCard = () => {}`
- **Functions**: camelCase - `const handleClick = () => {}`
- **Constants**: UPPER_SNAKE_CASE - `const API_URL = ''`
- **Boolean**: prefix with is/has/should - `isLoading`, `hasError`

## Component Rules

### 1. Component Structure
```jsx
// Imports
import { useState } from 'react';
import PropTypes from 'prop-types';

// Component
const ComponentName = ({ prop1, prop2 }) => {
  // State
  const [state, setState] = useState();
  
  // Hooks
  const customHook = useCustomHook();
  
  // Handlers
  const handleClick = () => {};
  
  // Effects
  useEffect(() => {}, []);
  
  // Render helpers
  const renderSection = () => {};
  
  // Return JSX
  return <div>Content</div>;
};

// PropTypes
ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number
};

// Export
export default ComponentName;
```

### 2. Component Types
- **Smart/Container Components** → in `pages/` - Handle logic, state, API calls
- **Dumb/Presentational Components** → in `components/` - Only receive props, no logic
- **Layout Components** → in `components/layout/` - App structure (Header, Sidebar)
- **Common Components** → in `components/common/` - Reusable UI elements

### 3. Component Size
- Max 250 lines per component
- If larger, split into smaller components
- Extract complex logic to custom hooks

## Code Organization Rules

### 1. Import Order
```jsx
// 1. React and external libraries
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 2. Internal components
import Button from '@/components/common/Button';
import Header from '@/components/layout/Header';

// 3. Hooks
import useAuth from '@/hooks/useAuth';

// 4. Utils and helpers
import { formatDate } from '@/utils/helpers';

// 5. Constants
import { API_ENDPOINTS } from '@/constants/api';

// 6. Styles
import './styles.css';
```

### 2. File Location Rules

**components/common/** - Use when:
- Component is reused in 3+ places
- Component is generic (Button, Input, Card, Modal)
- No business logic, only UI presentation

**components/layout/** - Use when:
- Component defines app structure (Header, Footer, Sidebar, Navbar)
- Component wraps pages or sections

**pages/** - Use when:
- Component represents a full page/route
- Component contains business logic
- Component is linked in routing

**hooks/** - Use when:
- Logic is reused in multiple components
- Logic manages state or side effects
- Logic can be abstracted from UI

**services/** - Use when:
- Making API calls
- Interacting with external services
- Data fetching/posting logic

**utils/** - Use when:
- Pure functions with no side effects
- Helper functions (format, validate, calculate)
- Functions used across multiple components

## State Management Rules

### 1. Local State (useState)
Use for:
- UI state (modals, dropdowns, tabs)
- Form inputs
- Component-specific data

### 2. Context API
Use for:
- Theme settings
- User authentication
- Language/localization
- Data needed by many components (max 2-3 levels deep)

### 3. Global State (Zustand/Redux)
Use for:
- App-wide state
- Complex state logic
- State shared across many components
- State that persists

## API & Data Fetching Rules

### 1. API Service Structure
```javascript
// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

export const userService = {
  getUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};
```

### 2. Data Fetching Pattern
- Use React Query or SWR for server state
- OR use custom hooks for data fetching
- Handle loading, error, and success states
- Implement error boundaries

## Styling Rules

### 1. CSS Organization
- Use CSS Modules or Tailwind CSS
- Global styles in `assets/styles/global.css`
- Component styles in same folder as component
- Use BEM naming if using plain CSS

### 2. Styling Priority
1. Tailwind utility classes (preferred)
2. CSS Modules
3. Styled-components
4. Inline styles (avoid unless dynamic)

## Performance Rules

1. **Lazy Loading**: Use `React.lazy()` for route-based code splitting
2. **Memoization**: Use `useMemo` and `useCallback` for expensive operations
3. **Avoid inline functions** in props for list items
4. **Use keys properly** in lists (avoid index as key)
5. **Optimize images**: Use appropriate formats and lazy loading

## Error Handling Rules

1. Implement Error Boundaries at page level
2. Use try-catch for async operations
3. Show user-friendly error messages
4. Log errors to monitoring service (Sentry, etc.)

## Testing Rules (if applicable)

1. Unit tests for utilities and hooks
2. Integration tests for pages
3. Test file location: next to component `Button.test.jsx`

## Environment Variables

1. Store in `.env` file
2. Prefix with `REACT_APP_` (Create React App) or `VITE_` (Vite)
3. Never commit `.env` to git
4. Use `.env.example` for documentation

## Git Commit Rules

Format: `type(scope): message`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `style`: Formatting, styling
- `docs`: Documentation
- `test`: Tests
- `chore`: Maintenance

Example: `feat(auth): add login functionality`

## Code Quality Rules

1. **No console.log** in production code
2. **Remove unused imports** and variables
3. **Use meaningful variable names** (no `x`, `temp`, `data`)
4. **Add comments** for complex logic only
5. **Follow DRY principle** (Don't Repeat Yourself)
6. **Keep functions small** (max 30 lines)
7. **Use TypeScript** for type safety (optional but recommended)

## Security Rules

1. Never store sensitive data in localStorage
2. Sanitize user inputs
3. Use HTTPS for API calls
4. Implement proper authentication/authorization
5. Keep dependencies updated

## Documentation Rules

1. README.md with setup instructions
2. JSDoc comments for complex functions
3. PropTypes or TypeScript for component props
4. API documentation in services folder

---

## Quick Decision Tree

**Where should I put this code?**

```
Is it a full page?
├─ YES → pages/
└─ NO → Is it reusable UI?
    ├─ YES → components/common/
    └─ NO → Is it layout structure?
        ├─ YES → components/layout/
        └─ NO → Is it logic/state?
            ├─ YES → hooks/
            └─ NO → Is it API call?
                ├─ YES → services/
                └─ NO → Is it helper function?
                    ├─ YES → utils/
                    └─ NO → Review architecture
```

## AI Agent Instructions

When generating code:
1. ✅ Always follow the folder structure above
2. ✅ Use proper naming conventions
3. ✅ Keep components small and focused
4. ✅ Extract reusable logic to hooks
5. ✅ Place API calls in services
6. ✅ Add PropTypes or TypeScript types
7. ✅ Handle loading and error states
8. ✅ Use meaningful variable names
9. ✅ Follow import order
10. ✅ Ask clarifying questions if structure is unclear