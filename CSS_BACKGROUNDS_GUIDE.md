# 🎨 Advanced Background CSS Guide

## Available Background Classes

### 1. **Pattern Backgrounds**

#### `.grid-pattern`
- Subtle grid pattern overlay
- Perfect for hero sections
- Usage: `<div className="grid-pattern">`

#### `.bg-dots`
- Dotted pattern (dark dots)
- Great for light backgrounds
- Usage: `<div className="bg-dots">`

#### `.bg-dots-white`
- Dotted pattern (white dots)
- Perfect for dark backgrounds
- Usage: `<div className="bg-dots-white">`

#### `.bg-mesh`
- Diagonal mesh pattern
- Adds texture to sections
- Usage: `<div className="bg-mesh">`

#### `.bg-waves`
- SVG wave pattern
- Elegant and modern
- Usage: `<div className="bg-waves">`

---

### 2. **Gradient Backgrounds**

#### `.bg-gradient-radial`
- Radial gradient from center
- Subtle spotlight effect
- Usage: `<div className="bg-gradient-radial">`

#### `.bg-gradient-conic`
- Conic gradient (circular sweep)
- Dynamic and eye-catching
- Usage: `<div className="bg-gradient-conic">`

#### `.bg-animated-gradient`
- Animated shifting gradient
- Smooth 15s animation loop
- Usage: `<div className="bg-animated-gradient">`

---

### 3. **Particle Effects**

#### `.bg-particles`
- Floating particle blobs
- Adds depth and movement
- Usage: `<div className="bg-particles">`
- Note: Creates animated blurred circles

---

### 4. **Glassmorphism**

#### `.bg-glass-light`
- Light frosted glass effect
- Backdrop blur + transparency
- Usage: `<div className="bg-glass-light">`

#### `.bg-glass-dark`
- Dark frosted glass effect
- Perfect for overlays
- Usage: `<div className="bg-glass-dark">`

---

### 5. **Gradient Overlays**

#### `.overlay-gradient-top`
- Fade from top to transparent
- Great for hero sections
- Usage: `<div className="overlay-gradient-top">`

#### `.overlay-gradient-bottom`
- Fade from bottom to transparent
- Perfect for footer sections
- Usage: `<div className="overlay-gradient-bottom">`

---

## 🎯 Usage Examples

### Example 1: Hero Section with Multiple Layers
```jsx
<div className="bg-gradient-to-br from-brand-600 to-brand-900 bg-particles">
  <div className="bg-dots-white opacity-20">
    <div className="bg-mesh opacity-30">
      {/* Your content */}
    </div>
  </div>
</div>
```

### Example 2: Card with Glass Effect
```jsx
<div className="bg-glass-light rounded-xl p-6 shadow-soft">
  {/* Card content */}
</div>
```

### Example 3: Animated Background Section
```jsx
<div className="bg-animated-gradient min-h-screen">
  {/* Your content */}
</div>
```

### Example 4: Layered Background
```jsx
<div className="relative bg-gradient-to-br from-gray-50 to-gray-100">
  <div className="absolute inset-0 bg-gradient-radial opacity-50"></div>
  <div className="relative z-10">
    {/* Your content */}
  </div>
</div>
```

---

## 🎨 Body Background

The default body background now includes:
- Multiple radial gradients for depth
- Fixed attachment for parallax effect
- Subtle brand color accents
- Smooth gradient base

---

## 💡 Tips

1. **Layer backgrounds** for rich visual effects
2. Use **opacity** to control intensity
3. Combine **patterns + gradients** for depth
4. Add **backdrop-blur** for modern glass effects
5. Use **relative/absolute positioning** for layering

---

## 🚀 Performance Notes

- All patterns use CSS/SVG (no images)
- Animations are GPU-accelerated
- Backdrop filters may impact older browsers
- Use sparingly for best performance
