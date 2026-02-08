import React from 'react';
import styles from './ProductGrid.module.scss';

interface ProductGridProps {
  children: React.ReactNode;
  className?: string;
}

export function ProductGrid({ children, className }: ProductGridProps) {
  const classes = className ? `${styles.grid} ${className}` : styles.grid;
  return <div className={classes}>{children}</div>;
}
