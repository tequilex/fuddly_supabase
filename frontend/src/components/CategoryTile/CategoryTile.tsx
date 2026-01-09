import React from 'react';
import { LucideIcon } from 'lucide-react';
import styles from './CategoryTile.module.scss';

interface CategoryTileProps {
  name: string;
  icon: LucideIcon;
  imageUrl?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export function CategoryTile({ 
  name, 
  icon: Icon, 
  imageUrl, 
  onClick,
  isActive = false 
}: CategoryTileProps) {
  return (
    <button 
      className={`${styles.categoryTile} ${isActive ? styles.active : ''}`}
      onClick={onClick}
      type="button"
    >
      <div className={styles.iconWrapper}>
        {imageUrl ? (
          <img src={imageUrl} alt={name} className={styles.image} />
        ) : (
          <Icon className={styles.icon} />
        )}
      </div>
      <span className={styles.name}>{name}</span>
    </button>
  );
}
