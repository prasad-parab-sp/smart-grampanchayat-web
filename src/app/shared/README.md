# 📁 Shared Module - SmartGramPanchayat

Professional shared folder structure following Angular best practices and enterprise architecture patterns.

## 🏗️ **Folder Structure**

```
shared/
├── 📂 components/           # Reusable UI components
│   ├── hero-banner/
│   ├── contact-banner/
│   ├── footer-brand/
│   └── index.ts            # Barrel exports
│
├── 📂 services/            # Shared business logic services
│   ├── api.service.ts
│   ├── storage.service.ts
│   └── notification.service.ts
│
├── 📂 models/              # TypeScript interfaces & types
│   ├── user.model.ts
│   ├── api-response.model.ts
│   └── index.ts
│
├── 📂 styles/              # SCSS variables & mixins
│   ├── _variables.scss     # Design system variables
│   ├── _mixins.scss        # Reusable SCSS mixins
│   └── _functions.scss     # SCSS functions
│
├── 📂 utils/               # Helper functions & utilities
│   ├── date.utils.ts
│   ├── validation.utils.ts
│   └── index.ts
│
├── 📂 pipes/               # Custom Angular pipes
│   ├── currency.pipe.ts
│   ├── date-format.pipe.ts
│   └── index.ts
│
├── 📂 directives/          # Custom Angular directives
│   ├── auto-focus.directive.ts
│   ├── click-outside.directive.ts
│   └── index.ts
│
└── README.md               # This documentation
```

## 🎯 **Usage Guidelines**

### **Components**
```typescript
// Import shared components
import { HeroBannerComponent } from '@shared/components';
```

### **Services**
```typescript
// Import shared services
import { ApiService } from '@shared/services';
```

### **Styles**
```scss
// Import shared variables
@import 'shared/styles/variables';

.my-component {
  background: $white;
}
```

### **Models**
```typescript
// Import shared types
import { User, ApiResponse } from '@shared/models';
```

## 🔧 **Development Rules**

1. **Reusability First** - Only add items that are used in 2+ places
2. **No Business Logic** - Keep shared services generic
3. **Proper Exports** - Always use barrel exports (index.ts)
4. **Documentation** - Document all public APIs
5. **Testing** - Write unit tests for shared utilities

## 📝 **Naming Conventions**

- **Components**: `kebab-case` folders, `PascalCase` classes
- **Services**: `camelCase.service.ts`
- **Models**: `camelCase.model.ts`
- **Utils**: `camelCase.utils.ts`
- **Pipes**: `camelCase.pipe.ts`
- **Directives**: `camelCase.directive.ts`