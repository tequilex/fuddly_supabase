import { Star, Clock, Award } from "lucide-react";
import styles from "./ProductInfo.module.scss";
import { Product } from "@/types";

interface ProductInfoProps {
  product: Product;
}

const ProductInfo = ({product}: ProductInfoProps) => {
  return (
    <div className={styles.productMainInfo}>
      <div className={styles.categoryBadge}>{product.category}</div>
      <h1 className={styles.productTitle}>{product.title}</h1>
      <div className={styles.productMeta}>
        <div className={styles.rating}>
          <Star size={20} fill="currentColor" />
          <span className={styles.ratingValue}>{product.rating}</span>
          <span className={styles.reviewsCount}>
            ({product.reviewsCount} отзывов)
          </span>
        </div>
        <div className={styles.productDetails}>
          <span className={styles.detailItem}>
            <Clock size={18} />
            {product.prepTime}
          </span>
          <span className={styles.detailItem}>
            <Award size={18} />
            {product.weight}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
