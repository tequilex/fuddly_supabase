import { Product } from "../../../../types";
import { ProductCard } from "../../../../components/ProductCard/ProductCard";
import styles from "./SimilarProducts.module.css";

interface SimilarProductsProps {
  products: Product[];
  onProductClick: (productId: string) => void;
}

const SimilarProducts = ({ products, onProductClick }: SimilarProductsProps) => {
  return (
    <div className={styles.similarSection}>
      <h2 className={styles.sectionTitle}>Похожие блюда</h2>
      <div className={styles.similarGrid}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => {
              onProductClick(product.id);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SimilarProducts;
