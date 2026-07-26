import type { Variants, Transition, Easing } from "framer-motion";

/**
 * Global Easing: Apple iOS 26 Inspired (Used as fallback when springs aren't appropriate)
 */
export const appleEase: Easing = [0.22, 1, 0.36, 1];
export const rubberBandEase: Easing = [0.175, 0.885, 0.32, 1.275];

/**
 * Global Durations (seconds)
 */
export const duration = {
  instant: 0.10,
  fast: 0.15,
  normal: 0.20,
  smooth: 0.25,
  medium: 0.30,
  slow: 0.40,
  page: 0.45,
  immersive: 0.50,
};

/**
 * Apple iOS 26 Spring Physics Configurations
 * Designed to be soft, fluid, interruptible, and physics-based.
 */
export const springConfig: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 1,
};

export const springBouncy: Transition = {
  type: "spring",
  stiffness: 450,
  damping: 25,
  mass: 0.8,
};

export const springSoft: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 35,
  mass: 1.2,
};

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 35,
  mass: 0.8,
};

/**
 * Interactive Elements (Buttons, Cards)
 * Slightly compress on press, slightly bounce back
 */
export const interactiveTap = { scale: 0.96 };
export const interactiveHover = { scale: 1.02, y: -2 };

export const interactiveTransition: Transition = {
  type: "spring",
  stiffness: 450,
  damping: 20,
  mass: 0.8
};

/**
 * Page Transitions (Shared Element & Spring)
 */
export const pageTransitionVariants: Variants = {
  initial: { opacity: 0, scale: 0.98, y: 15, filter: "blur(10px)" },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { ...springSoft, staggerChildren: 0.05, delayChildren: 0.05 } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.98, 
    y: -15, 
    filter: "blur(5px)",
    transition: { duration: 0.2, ease: appleEase } 
  }
};

/**
 * Stagger Container (Dashboards, Lists)
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

export const staggerItemFadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  show: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: springSoft
  },
};

/**
 * Modals & Dialogs (Glass Materialization)
 */
export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.85, y: 30, filter: "blur(15px)" },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: springConfig 
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    y: 20, 
    filter: "blur(10px)",
    transition: { duration: 0.25, ease: appleEase } 
  }
};

/**
 * Bottom Sheets (Mobile)
 */
export const bottomSheetVariants: Variants = {
  hidden: { y: "100%", opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: springConfig
  },
  exit: { 
    y: "100%", 
    opacity: 0,
    transition: { type: "spring", stiffness: 350, damping: 40 }
  }
};

/**
 * Notifications / Toasts
 */
export const toastVariants: Variants = {
  initial: { opacity: 0, y: -40, scale: 0.9 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: springBouncy
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    scale: 0.8,
    transition: { duration: 0.2, ease: appleEase } 
  }
};

/**
 * Chat / Messages
 */
export const chatMessageVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: springConfig
  }
};

/**
 * Popovers & Dropdowns (Context Menus)
 */
export const popoverVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: -10, filter: "blur(8px)" },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: springSnappy 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: -5, 
    filter: "blur(4px)",
    transition: { duration: 0.15, ease: appleEase } 
  }
};

