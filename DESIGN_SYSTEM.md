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

## Skeleton Loading Component

The skeleton loading system provides visual placeholders while content is loading, improving perceived performance and user experience.

### Basic Skeleton
```tsx
import { Skeleton } from '@/_components/skeleton';

<Skeleton variant="pulse" className="skeleton-md" />
```

### Skeleton Variants

**Animation Styles:**
- `pulse` - Subtle fade pulse (default, smooth & elegant)
- `shimmer` - Animated shimmer effect (more dynamic)
- `bounce` - Quick pulse bounce (energetic)

```tsx
<Skeleton variant="pulse" />
<Skeleton variant="shimmer" />
<Skeleton variant="bounce" />
```

### SkeletonText
Multiple lines of text placeholder
```tsx
import { SkeletonText } from '@/_components/skeleton';

<SkeletonText lines={3} variant="pulse" />
```

### SkeletonAvatar
Circular skeleton for avatars/profile pictures
```tsx
import { SkeletonAvatar } from '@/_components/skeleton';

<SkeletonAvatar size="sm" />      {/* 32px */}
<SkeletonAvatar size="md" />      {/* 48px */}
<SkeletonAvatar size="lg" />      {/* 64px */}
<SkeletonAvatar size="xl" />      {/* 96px */}
```

### SkeletonImage
Rectangular skeleton for images
```tsx
import { SkeletonImage } from '@/_components/skeleton';

<SkeletonImage size="sm" />    {/* 120px height */}
<SkeletonImage size="md" />    {/* 200px height */}
<SkeletonImage size="lg" />    {/* 300px height */}
```

### SkeletonCard
Complete card with header, body, and footer
```tsx
import { SkeletonCard } from '@/_components/skeleton';

<SkeletonCard variant="pulse" showFooter={true} />
```

### SkeletonList
Multiple list items
```tsx
import { SkeletonList, SkeletonListItem } from '@/_components/skeleton';

<SkeletonList count={5} variant="pulse" />

// Or single item:
<SkeletonListItem variant="pulse" />
```

### SkeletonGrid
Grid of card skeletons (ideal for dashboards)
```tsx
import { SkeletonGrid } from '@/_components/skeleton';

<SkeletonGrid count={6} variant="pulse" />
```

### SkeletonTable
Table layout skeleton
```tsx
import { SkeletonTable } from '@/_components/skeleton';

<SkeletonTable rows={5} columns={3} variant="pulse" />
```

### SkeletonWrapper
Wrapper component that toggles between skeleton and content
```tsx
import { SkeletonWrapper, SkeletonCard } from '@/_components/skeleton';

<SkeletonWrapper
  isLoading={isLoading}
  skeleton={<SkeletonCard />}
>
  <div>{actualContent}</div>
</SkeletonWrapper>
```

### Real-World Example: Transaction List
```tsx
import { useEffect, useState } from 'react';
import { SkeletonList } from '@/_components/skeleton';

export function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/transactions');
        const data = await res.json();
        setTransactions(data);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (isLoading) {
    return <SkeletonList count={5} variant="shimmer" />;
  }

  return (
    <div className="skeleton-list">
      {transactions.map((tx) => (
        <div key={tx.id} className="skeleton-list-item">
          <div className="skeleton-avatar" />
          <div className="skeleton-content" style={{flex: 1}}>
            <h4>{tx.description}</h4>
            <p>{tx.date}</p>
          </div>
          <div className="skeleton-value">${tx.amount}</div>
        </div>
      ))}
    </div>
  );
}
```

### Dashboard with Skeleton Grid
```tsx
import { SkeletonGrid } from '@/_components/skeleton';

export function Dashboard() {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCards().finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      {isLoading ? (
        <SkeletonGrid count={6} variant="pulse" />
      ) : (
        <div className="card-grid">
          {cards.map((card) => (
            <Card key={card.id} {...card} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Skeleton Accessibility

- Skeletons have `aria-hidden="true"` to hide them from screen readers
- Content underneath remains accessible to assistive technologies
- Motion respects `prefers-reduced-motion` (animations disabled)
- No color-only indicators; uses shape and position

### Skeleton CSS Classes

For custom HTML without React components:

```html
<!-- Text placeholder -->
<div class="skeleton skeleton-md"></div>

<!-- Multiple lines -->
<div class="skeleton-text">
  <div class="skeleton-line"></div>
  <div class="skeleton-line skeleton-line-short"></div>
</div>

<!-- Avatar -->
<div class="skeleton skeleton-circle skeleton-md"></div>

<!-- Image -->
<div class="skeleton skeleton-rect skeleton-lg"></div>

<!-- Card -->
<div class="skeleton-card">
  <!-- Content -->
</div>

<!-- List -->
<div class="skeleton-list">
  <div class="skeleton-list-item">
    <!-- Item -->
  </div>
</div>
```

### Best Practices

1. **Match the real content** - Skeleton should resemble the actual content size/shape
2. **Use appropriate delays** - Don't show skeleton for <200ms (feels janky)
3. **Limit network requests** - Combine data fetches to reduce loading states
4. **Provide fallbacks** - Show sensible defaults if loading fails
5. **Test with slow networks** - Use DevTools throttling to verify UX
6. **Choose animation wisely**:
   - `pulse` for simple, elegant loading
   - `shimmer` for more engaging, dynamic feel
   - `bounce` for quick interactions

---

## Toast Notification System

Toast notifications provide non-blocking feedback messages to users. Perfect for success confirmations, errors, and info messages.

### Setup

First, wrap your app with the `ToastProvider`:

```tsx
// app/layout.tsx
import { ToastProvider, ToastContainer } from '@/_components/toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ToastProvider>
          {children}
          <ToastContainer position="top-right" />
        </ToastProvider>
      </body>
    </html>
  );
}
```

### Basic Usage

```tsx
import { useToast } from '@/_components/toast';

export function MyComponent() {
  const { addToast } = useToast();

  return (
    <button onClick={() => addToast({
      type: 'success',
      message: 'Changes saved!',
      duration: 3000,
    })}>
      Save
    </button>
  );
}
```

### Toast Types

```tsx
// Success
addToast({ type: 'success', message: 'Operation completed!' });

// Error
addToast({ type: 'error', message: 'Something went wrong', duration: 5000 });

// Warning
addToast({ type: 'warning', message: 'Are you sure?' });

// Info
addToast({ type: 'info', message: 'New update available' });
```

### Advanced Options

```tsx
addToast({
  type: 'success',
  title: 'Success!',
  message: 'Your transaction has been created',
  description: 'ID: TRX-123456',
  duration: 4000,
  action: {
    label: 'View',
    onClick: () => router.push('/transaction/123456'),
  },
});
```

### Toast Positions

```tsx
<ToastContainer position="top-right" />     {/* Default */}
<ToastContainer position="top-left" />
<ToastContainer position="bottom-right" />
<ToastContainer position="bottom-left" />
<ToastContainer position="center" />
<ToastContainer position="bottom-center" />
```

---

## Empty State Components

Show meaningful messages when there's no data, no results, or errors.

### Basic Empty State

```tsx
import { EmptyState } from '@/_components/empty-state';

<EmptyState
  icon="📭"
  title="No transactions yet"
  description="Start by creating your first transaction"
  variant="no-data"
/>
```

### Pre-built Variants

```tsx
import {
  NoDataState,
  NoResultsState,
  ErrorState,
  SuccessState,
  OfflineState,
} from '@/_components/empty-state';

// No data
<NoDataState
  title="No transactions"
  description="Create one to get started"
/>

// No search results
<NoResultsState
  title="No results for 'coffee'"
  description="Try a different search term"
/>

// Error state
<ErrorState
  title="Failed to load data"
  description="Please refresh and try again"
/>

// Success state
<SuccessState
  title="Transaction created!"
  description="Your data has been saved"
/>

// Offline
<OfflineState />
```

### With Actions

```tsx
import { NoDataState } from '@/_components/empty-state';
import Link from 'next/link';

<NoDataState
  title="No categories yet"
  action={
    <Link href="/categories/new" className="btn btn-primary">
      Create Category
    </Link>
  }
/>
```

### Sizes

```tsx
<EmptyState size="sm" {...props} />   {/* Compact */}
<EmptyState size="md" {...props} />   {/* Default */}
<EmptyState size="lg" {...props} />   {/* Large/Feature */}
```

---

## Micro-interactions & Polish

Smooth animations and transitions that make the app feel fluid and responsive.

### Hover Effects

**Scale Effect**
```html
<!-- Subtle -->
<div class="hover-scale-sm">Hover me</div>

<!-- Normal -->
<div class="hover-scale">Hover me</div>

<!-- Large -->
<div class="hover-scale-lg">Hover me</div>
```

**Lift Effect (with shadow)**
```html
<card class="hover-lift">Lifts on hover</card>
<card class="hover-lift-sm">Subtle lift</card>
```

**Glow Effect**
```html
<div class="hover-glow">Glows blue</div>
<div class="hover-glow-success">Glows green</div>
<div class="hover-glow-danger">Glows red</div>
```

### Animation Classes

**Entrance Animations**
```html
<div class="fade-in">Fades in</div>
<div class="fade-in-slow">Fades in slower</div>

<div class="slide-in-left">Slides from left</div>
<div class="slide-in-right">Slides from right</div>
<div class="slide-in-top">Slides from top</div>
<div class="slide-in-bottom">Slides from bottom</div>
```

**Attention Seekers**
```html
<div class="pulse-attention">Pulses for attention</div>
<div class="badge badge-pulse">Pulsing badge</div>
<div class="bounce">Bounces</div>
<div class="shake">Shakes (error)</div>
```

**Loaders**
```html
<div class="spin">Spinning loader</div>
<div class="spin-slow">Slower spinner</div>
```

### Expand/Collapse

```html
<div class="expand">Expands on load</div>
<div class="collapse">Collapses on unload</div>
```

### Transition Utilities

```html
<!-- 150ms transition -->
<div class="transition-fast">Fast changes</div>

<!-- 200ms transition (default) -->
<div class="transition-base">Medium changes</div>

<!-- 300ms transition -->
<div class="transition-slow">Slow, elegant changes</div>
```

### Real-World Examples

**Button with Lift on Hover**
```tsx
<button className="btn btn-primary hover-lift">
  Click me
</button>
```

**Card with Scale on Hover**
```tsx
<div className="card hover-scale">
  Interactive card
</div>
```

**Loading Spinner with Pulse**
```tsx
<div className="pulse-attention">
  <div class="spin">Loading...</div>
</div>
```

**List Item Entrance**
```tsx
{items.map((item, i) => (
  <div key={item.id} className="slide-in-left" style={{
    animationDelay: `${i * 100}ms`
  }}>
    {item.name}
  </div>
))}
```

### Best Practices

1. **Don't overdo it** - Use subtle animations, not distracting ones
2. **Respect preferences** - All animations respect `prefers-reduced-motion`
3. **Fast is better** - Keep duration under 300ms for UI feedback
4. **Purpose** - Each animation should serve a purpose (feedback, attention, delight)
5. **Consistent** - Use the same timing and easing throughout
6. **Test performance** - Animations on slower devices should still feel smooth

### Customizing Animation Duration

Use CSS variables:
```css
.my-element {
  animation: fade-in var(--transition-slow);
  /* 300ms */
}
```

Or inline with `animation-delay` for staggered effects:
```css
.my-element {
  animation: slide-in-left var(--transition-base);
  animation-delay: 100ms;
}
```

---

## Next Steps

5. Build a Storybook or component library

Happy designing! 🎨
