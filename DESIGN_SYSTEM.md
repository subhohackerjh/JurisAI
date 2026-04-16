# LegalConnect - Professional Design System

## 🎨 Design Philosophy

LegalConnect uses a **professional, trustworthy, and modern** design system appropriate for a legal services platform. The design emphasizes clarity, accessibility, and ease of use while maintaining a professional appearance.

---

## 🌈 Color Palette

### Primary Colors

#### Navy Blue (Primary Brand Color)
```
CSS: bg-primary, text-primary
Hex: #1e40af
Usage: Headers, buttons, important elements
Psychology: Professional, trustworthy, legal authority
```

#### Orange (Accent Color)
```
CSS: bg-accent, text-accent
Hex: #ea580c
Usage: CTAs, highlights, important actions
Psychology: Energy, action, approachable
```

### Neutral Colors

#### Backgrounds
```
Light Background: bg-background (white/off-white)
Card Background: bg-card (light gray)
Border: border-border (light gray)
```

#### Text
```
Primary Text: text-foreground (dark gray/black)
Secondary Text: text-muted-foreground (medium gray)
```

### Status Colors

```
Success: Green (#22c55e)
Error: Red (#ef4444)
Warning: Orange (#f59e0b)
Info: Blue (#3b82f6)
```

### Color Usage Guidelines

| Element | Color | Purpose |
|---------|-------|---------|
| Primary buttons | Navy Blue | Main CTAs |
| Secondary buttons | Gray | Alternative actions |
| Danger buttons | Red | Destructive actions |
| Success messages | Green | Confirmation |
| Error messages | Red | Problems/warnings |
| Links | Blue | Navigation |
| Badges | Various | Status indicators |

---

## 🔤 Typography System

### Font Families

```css
/* Headings - Bold, Authoritative */
font-family: Geist, system-ui, -apple-system, sans-serif;
font-weight: 600-700;

/* Body - Clean, Readable */
font-family: Geist, system-ui, -apple-system, sans-serif;
font-weight: 400;

/* Code/Mono - Technical Content */
font-family: Geist Mono, monospace;
font-weight: 400;
```

### Font Scale

| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| H1 (Page Title) | 2rem / 32px | 700 | 1.2 | Page headers |
| H2 (Section Title) | 1.5rem / 24px | 700 | 1.2 | Section headings |
| H3 (Card Title) | 1.125rem / 18px | 600 | 1.4 | Card headings |
| Body (Regular) | 1rem / 16px | 400 | 1.5 | Main text |
| Body (Small) | 0.875rem / 14px | 400 | 1.5 | Secondary text |
| Caption | 0.75rem / 12px | 400 | 1.4 | Captions, hints |

### Responsive Typography

```
Mobile:  h1 = 24px, body = 14px
Tablet:  h1 = 28px, body = 15px
Desktop: h1 = 32px, body = 16px
```

### Text Styles

- **Headings**: Bold, uppercase color (navy blue)
- **Body**: Regular weight, excellent contrast
- **Labels**: Semibold, medium gray
- **Help Text**: Small, light gray, italic
- **Links**: Underlined on hover

---

## 📏 Spacing System

### Spacing Scale (Tailwind)

```css
0 = 0px
1 = 0.25rem (4px)
2 = 0.5rem (8px)
3 = 0.75rem (12px)
4 = 1rem (16px)
6 = 1.5rem (24px)
8 = 2rem (32px)
12 = 3rem (48px)
16 = 4rem (64px)
```

### Padding Conventions

| Component | Padding |
|-----------|---------|
| Page container | p-4 (mobile), p-6 (tablet), p-8 (desktop) |
| Card | p-4 (mobile), p-6 (desktop) |
| Button (standard) | px-4 py-2 |
| Input field | px-3 py-2 |
| Form group | mb-4 |

### Gap Conventions

| Layout | Gap |
|--------|-----|
| Grid (cards) | gap-4 (mobile), gap-6 (desktop) |
| Flex items | gap-2 to gap-4 |
| Form groups | gap-1.5 to gap-2 |

---

## 🔘 Component System

### Buttons

#### Primary Button
```
Background: Navy Blue
Text: White
Hover: Darker navy
Size: 36-44px (touch target minimum)
Padding: px-4 py-2
```

#### Secondary Button
```
Background: Light gray
Text: Dark gray
Hover: Slightly darker gray
Border: 1px gray
```

#### Destructive Button
```
Background: Red
Text: White
Hover: Darker red
```

#### Button States
- **Default**: Normal appearance
- **Hover**: Darker shade + shadow
- **Active**: Even darker shade
- **Disabled**: Grayed out, no interaction
- **Loading**: Spinner icon + disabled state

### Cards

```
Background: Card background color
Border: 1px light gray
Padding: p-4 (mobile), p-6 (desktop)
Radius: rounded-lg (8px)
Shadow: subtle (on hover: medium)
Transition: smooth 200ms
```

### Input Fields

```
Background: Background color
Border: 1px light gray
Padding: px-3 py-2
Radius: rounded-lg (8px)
Focus: 2px blue outline
Font: Regular, dark text
```

### Badges

```
Padding: px-2 py-1
Radius: rounded-full
Font: Small (12px), semibold
Colors: Various based on status
```

### Dropdowns / Select

```
Similar to input fields
Padding: px-3 py-2
Options: Vertical list
Focus: Outline on option
```

---

## 🏗️ Layout Patterns

### Page Layout

```
┌─────────────────────┐
│   Header/Nav        │
├─────────────────────┤
│                     │
│   Main Content      │
│   (Max width: 7xl)  │
│                     │
├─────────────────────┤
│   Footer (optional) │
└─────────────────────┘
```

### Grid Layouts

#### Responsive Behavior
- **Mobile**: 1 column
- **Tablet (md)**: 2 columns
- **Desktop (lg)**: 3+ columns

```html
<!-- Example -->
<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Cards -->
</div>
```

### Card Grid

```
Mobile:  1 × 1 (stacked)
Tablet:  2 × 2 (2 columns)
Desktop: 3 × 3 (3 columns)
Gap:     4px mobile, 6px desktop
```

### Form Layout

```
Single column layout
Label on top, input below
Help text below input
Required asterisk next to label
```

---

## ♿ Accessibility Features

### Color Contrast
- Text on background: > 4.5:1 (WCAG AA)
- Large text: > 3:1 (WCAG AA)
- UI components: > 3:1

### Interactive Elements
- Minimum touch target: 44×44px
- Visible focus indicators: 2px outline
- Color not only cue for information
- Sufficient spacing between clickable elements

### Semantic HTML
- Use `<button>` for buttons
- Use `<a>` for links
- Use `<header>`, `<nav>`, `<main>`, `<footer>`
- Use `<label>` for form labels
- Use `<input>` with proper `type` attribute

### ARIA Labels
```html
<button aria-label="Open menu">☰</button>
<input aria-labelledby="label-id" />
<span role="status">Message sent</span>
```

---

## 📱 Responsive Design

### Breakpoints

```
xs: 0px (mobile)
sm: 640px (mobile landscape / small tablet)
md: 768px (tablet)
lg: 1024px (desktop)
xl: 1280px (large desktop)
2xl: 1536px (extra large)
```

### Mobile-First Approach

1. Design for mobile first
2. Use responsive prefixes: `sm:`, `md:`, `lg:`
3. Stack elements on mobile
4. Expand to columns on larger screens

### Responsive Typography

```
Headings scale from 24px (mobile) → 32px (desktop)
Body text scales from 14px (mobile) → 16px (desktop)
Padding scales: p-3 (mobile) → p-6 (desktop)
Gaps scale: gap-2 (mobile) → gap-6 (desktop)
```

### Mobile Menu

```
≡ Hamburger icon on mobile
Vertical navigation menu
Overlay background
Close button or outside click
```

---

## 🎭 Component States

### Buttons
- Default
- Hover
- Active/Pressed
- Disabled
- Loading
- Focus (keyboard navigation)

### Form Fields
- Idle
- Focus
- Filled
- Error
- Disabled
- Loading

### Cards
- Default
- Hover (lift + shadow)
- Active (selected)
- Disabled

### Navigation
- Default
- Active (current page)
- Hover
- Focus

---

## 🌐 Design Tokens

### Sizing Tokens

```css
--radius: 0.5rem; /* rounded-lg */
--border: 1px; /* border width */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
```

### Transition Tokens

```css
--duration-fast: 100ms;
--duration-base: 200ms;
--duration-slow: 300ms;
--easing: cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 🎨 Visual Hierarchy

### Size
- Large: Headers, important CTAs
- Medium: Cards, form labels
- Small: Supporting text, captions

### Color
- Primary color: Main focus
- Gray: Secondary information
- Red: Important warnings

### Weight
- Bold (700): Headers, important text
- Semibold (600): Labels
- Regular (400): Body text

### Space
- More space: Important sections
- Less space: Related information

---

## 📐 Spacing Rules

### Consistency
- Use spacing scale (0, 1, 2, 3, 4, 6, 8...)
- Don't use arbitrary values
- Consistent padding inside components
- Consistent gaps between components

### Margins
- Never use margin and gap together
- Use gap for spacing between flex/grid children
- Use padding for spacing inside components

### Padding
- Cards: p-4 (mobile), p-6 (desktop)
- Buttons: px-4 py-2
- Inputs: px-3 py-2
- Forms: space-y-4 or space-y-6

---

## 🎬 Animations & Transitions

### Principles
- Smooth, not bouncy
- Fast (200ms), not slow
- Purposeful, not gratuitous
- Accessible (respects prefers-reduced-motion)

### Common Transitions

```css
/* Hover effects */
transition: all 200ms ease-in-out;

/* Color changes */
transition: color 150ms ease-in-out;

/* Size changes */
transition: transform 150ms ease-in-out;

/* Shadows on hover */
transition: box-shadow 200ms ease-in-out;
```

### Animation Examples

- Button hover: Slightly darker, shadow
- Card hover: Slight lift (transform Y), increased shadow
- Menu open: Fade in + slide
- Loading: Spinner rotation

---

## 🖼️ Real-World Examples

### Professional Header
```html
<header className="bg-primary text-white">
  <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
    <h1 className="text-2xl font-bold">LegalConnect</h1>
    <nav className="space-x-6">...</nav>
  </div>
</header>
```

### Professional Card
```html
<div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition">
  <h3 className="text-lg font-bold text-foreground mb-2">Card Title</h3>
  <p className="text-muted-foreground mb-4">Card description</p>
  <button className="w-full bg-primary text-white py-2 rounded">Action</button>
</div>
```

### Professional Form
```html
<form className="space-y-6">
  <div className="space-y-2">
    <label className="text-sm font-semibold">Label *</label>
    <input placeholder="..." className="w-full px-3 py-2 border rounded-lg" />
    <p className="text-xs text-muted-foreground">Help text</p>
  </div>
</form>
```

---

## ✅ Design Quality Checklist

Before shipping any component:
- [ ] Color contrast is sufficient (4.5:1)
- [ ] Typography hierarchy is clear
- [ ] Spacing is consistent (uses scale)
- [ ] Touch targets are ≥44px
- [ ] Focus indicators are visible
- [ ] Mobile layout is responsive
- [ ] Hover/active states are clear
- [ ] Form validation is visible
- [ ] Loading states are shown
- [ ] Error states are clear

---

## 📚 Resources

### Typography
- Primary Font: Geist (Google Fonts)
- Icons: Lucide React
- Color System: Tailwind CSS

### Components
- Base UI: shadcn/ui
- Headless UI: Radix UI
- Form Library: React Hook Form

### Tools
- Design System: Figma (recommended)
- Spacing: Tailwind scale
- Colors: Tailwind color palette
- Icons: Lucide React

---

## 🎓 Best Practices

1. **Be Consistent**: Use the same styles everywhere
2. **Respect Scale**: Use spacing and sizing scales
3. **Prioritize Readability**: Good contrast, large enough text
4. **Mobile First**: Design for small screens first
5. **Accessibility**: Include everyone, always
6. **Performance**: Minimize animations, optimize images
7. **Testing**: Test on real devices and browsers

---

## 🚀 Future Enhancements

- [ ] Dark mode support
- [ ] Animation library (Framer Motion)
- [ ] Advanced theming system
- [ ] Component Storybook
- [ ] Design tokens in CSS variables
- [ ] Internationalization support
- [ ] Custom font weights

---

*Design System Version: 1.0*
*Last Updated: April 16, 2026*
*Status: Production-Ready ✅*
