

# Adat - Authentication Implementation Plan

## Overview
Build a minimal, elegant authentication system for Adat with email/password sign in and sign up, featuring a split-screen layout with the splash image on the left and the form on the right.

---

## Phase 1: Setup & Styling

### 1.1 Add Zalando Sans Font
- Import Zalando Sans from Google Fonts
- Configure as the base font in Tailwind
- Set up typography scale: bold large titles, smaller body text

### 1.2 Update Theme to Minimal Black & White
- Adjust CSS variables for a minimal monochrome palette
- Clean black for primary actions
- Soft grays for borders and muted text
- Pure white backgrounds

### 1.3 Copy Assets to Project
- Copy the Adat logo (SVG) to assets
- Copy the splash image (mosque/shrine) to assets

---

## Phase 2: Database Setup

### 2.1 User Profiles Table
- The existing `profiles` table already exists with `id`, `username`, `avatar_url`, and `website`
- Add a `full_name` column for display name
- Create a trigger to auto-create profile on user signup

---

## Phase 3: Authentication Pages

### 3.1 Login Page
A split-screen layout similar to the reference:
- **Left side**: Full-height splash image with Adat logo overlaid and a subtle tagline about spiritual life management
- **Right side**: Clean login form with:
  - "Welcome Back" heading
  - Email input field
  - Password input field with visibility toggle
  - Login button (black, full-width)
  - Link to Sign Up page

### 3.2 Sign Up Page
Same split-screen layout:
- **Left side**: Same splash image design
- **Right side**: Registration form with:
  - "Create Account" heading
  - Full name input
  - Email input
  - Password input with visibility toggle
  - Confirm password input
  - Sign Up button
  - Link to Login page

---

## Phase 4: Auth Logic & State

### 4.1 Authentication Context
- Create auth context to manage user session state
- Set up `onAuthStateChange` listener for session persistence
- Handle auto-login on page refresh

### 4.2 Protected Routes
- Create a protected route wrapper component
- Redirect unauthenticated users to login
- Redirect authenticated users from auth pages to dashboard

### 4.3 Post-Auth Flow
- After successful signup/login, redirect to a placeholder dashboard page
- Display user's name in the dashboard header

---

## Deliverables
- `/auth` - Login page (default view)
- `/auth/signup` - Sign up page  
- `/dashboard` - Protected placeholder page (ready for future features)
- Responsive design for mobile and desktop
- Clean transitions between auth states

