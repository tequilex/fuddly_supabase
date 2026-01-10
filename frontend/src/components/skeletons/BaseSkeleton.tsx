import React from 'react';
import styles from './BaseSkeleton.module.scss';

interface BaseSkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  variant?: 'rectangle' | 'circle' | 'text';
  className?: string;
}

export function BaseSkeleton({
  width = '100%',
  height = 20,
  borderRadius,
  variant = 'rectangle',
  className = '',
}: BaseSkeletonProps) {
  const formatValue = (value: string | number) => {
    return typeof value === 'number' ? `${value}px` : value;
  };

  const style: React.CSSProperties = {
    width: formatValue(width),
    height: formatValue(height),
  };

  if (borderRadius !== undefined) {
    style.borderRadius = formatValue(borderRadius);
  }

  const variantClass = variant === 'circle'
    ? styles.circle
    : variant === 'text'
    ? styles.text
    : '';

  return (
    <div
      className={`${styles.skeleton} ${variantClass} ${className}`.trim()}
      style={style}
      data-skeleton
    />
  );
}
