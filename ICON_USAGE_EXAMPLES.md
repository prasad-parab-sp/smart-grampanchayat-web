# Icon System Usage Examples

## 1. Basic Usage in Templates

```html
<!-- Direct icon usage -->
<h2>{{ icons.LOGIN }} लॉगिन करा</h2>
<button>{{ icons.SUCCESS }} सेव करा</button>
<span>{{ icons.ERROR }} त्रुटी आली</span>

<!-- Dynamic icon based on condition -->
<button>
  {{ showPassword ? icons.HIDE : icons.SHOW }}
</button>

<!-- Status indicators -->
<div class="status">
  {{ icons.PENDING }} प्रतीक्षा करा...
</div>
```

## 2. Component Setup

```typescript
import { ICONS, ICON_GROUPS } from '../shared';

export class MyComponent {
  // Make icons available to template
  readonly icons = ICONS;
  readonly iconGroups = ICON_GROUPS;
  
  // Example usage in methods
  showSuccessMessage() {
    const message = `${this.icons.SUCCESS} यशस्वी!`;
    console.log(message);
  }
}
```

## 3. Using Icon Service (Advanced)

```typescript
import { IconService } from '../shared';

export class MyComponent {
  constructor(private iconService: IconService) {}
  
  getStatusMessage(status: string) {
    const icon = this.iconService.getStatusIcon(status as any);
    return `${icon} Status: ${status}`;
  }
  
  searchIcons() {
    const results = this.iconService.searchIcons('payment');
    // Returns: [{key: 'TAX_PAYMENT', icon: '💰'}, {key: 'PAYMENT', icon: '💳'}]
  }
}
```

## 4. Available Icon Categories

### Authentication & User
- `LOGIN` 🏛️ - Government building for login
- `USER` 👤 - Generic user
- `ADMIN` 👨‍💼 - Administrator
- `CITIZEN` 👥 - Citizens/users

### Services
- `CERTIFICATE` 📄 - Documents/certificates
- `PROPERTY` 🏠 - Property related
- `TAX_PAYMENT` 💰 - Tax and payments
- `ELECTRICITY` 💡 - Electricity services
- `WATER` 💧 - Water services

### Status
- `SUCCESS` ✅ - Success state
- `ERROR` ❌ - Error state
- `PENDING` ⏳ - Pending/waiting
- `IN_PROGRESS` 🔄 - Processing

### Actions
- `EDIT` ✏️ - Edit action
- `DELETE` 🗑️ - Delete action
- `SAVE` 💾 - Save action
- `SEARCH` 🔍 - Search functionality

## 5. Best Practices

1. **Always use the centralized icons**:
   ```html
   <!-- ✅ Good -->
   <h2>{{ icons.LOGIN }} लॉगिन करा</h2>
   
   <!-- ❌ Avoid -->
   <h2>🏛️ लॉगिन करा</h2>
   ```

2. **Use icon groups for related functionality**:
   ```typescript
   // Easy access to related icons
   readonly statusIcons = ICON_GROUPS.STATUS;
   readonly serviceIcons = ICON_GROUPS.SERVICES;
   ```

3. **Consistent spacing**:
   ```html
   <!-- Consistent spacing between icon and text -->
   <span>{{ icons.SUCCESS }} यशस्वी</span>
   ```

## 6. Adding New Icons

To add new icons, update `/shared/constants/icons.ts`:

```typescript
export const ICONS = {
  // ... existing icons
  NEW_ICON: '🆕',  // Add your new emoji here
} as const;
```

## 7. Icon Customization

Icons can be styled with CSS:

```scss
.icon-large {
  font-size: 1.5em;
}

.icon-colored {
  filter: hue-rotate(45deg); // Change color slightly
}
```