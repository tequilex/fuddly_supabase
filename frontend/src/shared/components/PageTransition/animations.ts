import { Variants } from 'framer-motion';

// 1. Fade + Slide Up (текущая, плавная)
export const fadeSlideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// 2. Fade только (самая простая)
export const fadeOnly: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// 3. Slide from Right (как в мобильных приложениях)
export const slideFromRight: Variants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
};

// 4. Scale + Fade (увеличение)
export const scaleFade: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.05 },
};

// 5. Blur + Fade (размытие)
export const blurFade: Variants = {
  initial: { opacity: 0, filter: 'blur(10px)' },
  animate: { opacity: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, filter: 'blur(10px)' },
};

// Настройки transition по умолчанию
export const defaultTransition = {
  duration: 0.3,
  ease: 'easeInOut',
};

export const fastTransition = {
  duration: 0.2,
  ease: 'easeOut',
};

export const slowTransition = {
  duration: 0.5,
  ease: 'easeInOut',
};
