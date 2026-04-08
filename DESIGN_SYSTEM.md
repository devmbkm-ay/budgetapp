# Design System Documentation

Welcome to the BudgetApp Design System! This document outlines all available design tokens and component variants.

## Design Tokens

All design tokens are defined as CSS custom properties in `design-tokens.css` and can be used throughout your application.

### Colors

#### Neutral Palette
```css
--color-neutral-50 through --color-neutral-950
```

#### Primary (Blue)
```css
--color-primary-50 through --color-primary-900
```

#### Success (Green)
```css
--color-success-50 through --color-success-900
```

#### Warning (Amber)
```css
--color-warning-50 through --color-warning-900
```

#### Danger (Red)
```css
--color-danger-50 through --color-danger-900
```

#### Semantic Colors
```css
--color-background
--color-background-secondary
--color-background-tertiary
--color-foreground
--color-foreground-secondary
--color-foreground-tertiary
--color-border
--color-border-light
```

### Typography

#### Font Families
```css
--font-sans: Main font for UI text
--font-mono: Monospace font for code
```

#### Font Sizes
```css
--text-xs  (12px)
--text-sm  (14px)
--text-base (16px)
--text-lg  (18px)
--text-xl  (20px)
--text-2xl (24px)
--text-3xl (30px)
--text-4xl (36px)
--text-5xl (48px)
```

#### Font Weights
```css
--font-normal    (400)
--font-medium    (500)
--font-semibold  (600)
--font-bold      (700)
--font-extrabold (800)
```

#### Line Heights
```css
--line-height-tight    (1.2)
--line-height-normal   (1.5)
--line-height-relaxed  (1.75)
```

#### Letter Spacing
```css
--letter-spacing-tight   (-0.02em)
--letter-spacing-normal  (0)
--letter-spacing-wide    (0.05em)
```

### Spacing

```css
--space-0   (0)
--space-1   (4px)
--space-2   (8px)
--space-3   (12px)
--space-4   (16px)
--space-5   (20px)
--space-6   (24px)
--space-8   (32px)
--space-10  (40px)
--space-12  (48px)
--space-16  (64px)
--space-20  (80px)
```

### Border Radius

```css
--radius-sm    (6px)
--radius-md    (8px)
--radius-lg    (12px)
--radius-xl    (16px)
--radius-2xl   (24px)
--radius-3xl   (32px)
--radius-full  (9999px)
```

### Shadows

```css
--shadow-none
--shadow-sm
--shadow-md
--shadow-lg
--shadow-xl
--shadow-2xl
```

### Transitions

```css
--transition-fast    (150ms)
--transition-base    (200ms)
--transition-slow    (300ms)
```

### Z-Index Scale

```css
--z-hide              (-1)
--z-base              (0)
--z-dropdown         (100)
--z-sticky           (200)
--z-fixed            (300)
--z-modal-backdrop   (400)
--z-modal            (500)
--z-tooltip          (600)
--z-notification     (700)
```

---

## Button Component

### Sizes
```html
<button class="btn btn-sm">Small</button>
<button class="btn btn-md">Medium (Default)</button>
<button class="btn btn-lg">Large</button>
<button class="btn btn-xl">Extra Large</button>
```

### Color Variants
```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-tertiary">Tertiary (Ghost)</button>
<button class="btn btn-danger">Danger</button>
<button class="btn btn-success">Success</button>
```

### Modifiers
```html
<button class="btn btn-block">Full Width</button>
<button class="btn btn-icon btn-md">Icon</button>
<button class="btn btn-loading">Loading...</button>
<button disabled class="btn btn-primary">Disabled</button>
```

### Button Group
```html
<div class="btn-group">
  <button class="btn btn-primary">Save</button>
  <button class="btn btn-secondary">Cancel</button>
</div>
```

---

## Card Component

### Basic Usage
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
  </div>
  <div class="card-body">
    Content here
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Action</button>
  </div>
</div>
```

### Variants
```html
<div class="card card-elevated">Elevated</div>
<div class="card card-flat">Flat</div>
<div class="card card-outlined">Outlined</div>
<div class="card card-interactive">Interactive</div>
```

### Sizes
```html
<div class="card card-sm">Small</div>
<div class="card">Medium (Default)</div>
<div class="card card-lg">Large</div>
```

### Card Grid
```html
<div class="card-grid">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
</div>
```

---

## Form Components

### Input Sizes
```html
<input type="text" class="input input-sm" />
<input type="text" class="input input-md" />
<input type="text" class="input input-lg" />
```

### Input Variants
```html
<input type="text" class="input" />
<input type="text" class="input input-success" />
<input type="text" class="input input-error" />
<input type="text" class="input input-warning" />
```

### Form Group
```html
<div class="form-group">
  <label class="form-label required">Email</label>
  <input type="email" class="input" />
  <span class="form-hint">Enter your email address</span>
</div>
```

### Error / Success Messages
```html
<div class="form-error">❌ This field is required</div>
<div class="form-success">✅ Changes saved</div>
```

### Textarea
```html
<textarea class="textarea-sm">Short area</textarea>
<textarea class="textarea-lg">Large area</textarea>
```

### Checkboxes
```html
<div class="checkbox-group">
  <div class="checkbox-item">
    <input type="checkbox" id="check1" />
    <label for="check1">Option 1</label>
  </div>
</div>
```

### Radio Buttons
```html
<div class="radio-group">
  <div class="radio-item">
    <input type="radio" id="radio1" name="group" />
    <label for="radio1">Option 1</label>
  </div>
</div>
```

### Input with Addon
```html
<div class="input-addon">
  <span class="input-addon-before">$</span>
  <input type="number" placeholder="0.00" />
  <span class="input-addon-after">USD</span>
</div>
```

### Floating Label
```html
<div class="form-floating">
  <input type="text" placeholder=" " />
  <label>Your Label</label>
</div>
```

---

## Badge Component

### Sizes
```html
<span class="badge badge-sm">Small</span>
<span class="badge badge-md">Medium</span>
<span class="badge badge-lg">Large</span>
```

### Color Variants
```html
<span class="badge badge-primary">Primary</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-danger">Danger</span>
<span class="badge badge-neutral">Neutral</span>
```

### Styles
```html
<span class="badge badge-primary badge-solid">Solid (Default)</span>
<span class="badge badge-primary badge-outline">Outline</span>
```

### Semantic Status Badges
```html
<!-- Transaction Types -->
<span class="badge badge-income">Income</span>
<span class="badge badge-expense">Expense</span>
<span class="badge badge-transfer">Transfer</span>

<!-- Status -->
<span class="badge badge-pending">Pending</span>
<span class="badge badge-completed">Completed</span>
<span class="badge badge-cancelled">Cancelled</span>
```

### With Icon
```html
<span class="badge badge-primary badge-with-icon">
  ✓ Completed
</span>
```

### Dismissible Badge
```html
<span class="badge badge-primary badge-dismissible">
  <span>Remove me</span>
  <button>×</button>
</span>
```

### Badge List
```html
<div class="badge-list">
  <span class="badge badge-primary">Feature</span>
  <span class="badge badge-secondary">Bug</span>
  <span class="badge badge-warning">Enhancement</span>
</div>
```

---

## Usage Tips

### 1. Always Use Design Tokens
Instead of hardcoding colors:
```css
/* ❌ Don't do this */
.my-element {
  color: #2563eb;
  padding: 16px;
}

/* ✅ Do this */
.my-element {
  color: var(--color-primary-600);
  padding: var(--space-4);
}
```

### 2. Responsive Design
Use media queries for responsive layouts:
```css
.my-grid {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}
```

### 3. Dark Mode Support
The design system automatically adapts to dark mode. Test by:
```bash
# In your browser DevTools
# Settings > Rendering > Emulate CSS media feature prefers-color-scheme
```

### 4. Accessibility
- All interactive elements have focus states
- Color contrast meets WCAG AA standards
- Use semantic HTML with ARIA labels when needed

### 5. Transition Guidelines
Use the predefined transitions:
```css
.my-element {
  transition: all var(--transition-base); /* 200ms */
}

/* Fast for micro-interactions */
transition: all var(--transition-fast); /* 150ms */

/* Slow for complex animations */
transition: all var(--transition-slow); /* 300ms */
```

---

## Component Composition Examples

### Transaction Card
```html
<div class="card card-interactive">
  <div class="card-header">
    <h4 class="card-title">Groceries</h4>
    <span class="badge badge-expense">Expense</span>
  </div>
  <div class="card-body">
    <p>Amount: $52.30</p>
    <p class="card-subtitle">Submitted 2 hours ago</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-sm btn-secondary">Edit</button>
    <button class="btn btn-sm btn-danger">Delete</button>
  </div>
</div>
```

### Form with Validation
```html
<div class="form-group">
  <label class="form-label required">Amount</label>
  <div class="input-addon">
    <span class="input-addon-before">$</span>
    <input type="number" placeholder="0.00" class="input input-success" />
  </div>
  <span class="form-success">✓ Valid amount</span>
</div>
```

### Status Dashboard
```html
<div class="card-grid">
  <div class="card">
    <h3 class="card-title">Pending</h3>
    <p style="font-size: var(--text-2xl);">5</p>
    <span class="badge badge-pending">awaiting</span>
  </div>
  
  <div class="card">
    <h3 class="card-title">Completed</h3>
    <p style="font-size: var(--text-2xl);">48</p>
    <span class="badge badge-completed">done</span>
  </div>
</div>
```

---

## Next Steps

Once you're familiar with the design system:
1. Update existing components to use the new tokens and classes
2. Create reusable React components that wrap these CSS classes
3. Establish component naming conventions
4. Add animations and micro-interactions
5. Build a Storybook or component library

Happy designing! 🎨
