import { Product } from "@/types";
import styles from "./Breadcrumbs.module.css";

interface BreadcrumbsProps {
  product: Product;
  onBack: () => void;
}

const Breadcrumbs = ({ product, onBack }: BreadcrumbsProps) => {
  return (
    <div className={styles.breadcrumbs}>
      <button onClick={onBack} className={styles.breadcrumbLink}>
        Каталог
      </button>
      <span className={styles.breadcrumbSeparator}>/</span>
      <span className={styles.breadcrumbCurrent}>{product.category}</span>
      <span className={styles.breadcrumbSeparator}>/</span>
      <span className={styles.breadcrumbCurrent}>{product.title}</span>
    </div>
  );
};

export default Breadcrumbs;
