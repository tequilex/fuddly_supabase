import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';
import { fadeOnly, fastTransition } from './animations';

interface PageTransitionProps {
  children: ReactNode;
  variants?: Variants;
  transition?: any;
}

const PageTransition = ({
  children,
  variants = fadeOnly,
  transition = fastTransition
}: PageTransitionProps) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={transition}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
