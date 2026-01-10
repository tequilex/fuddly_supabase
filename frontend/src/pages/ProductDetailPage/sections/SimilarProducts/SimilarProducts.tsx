import { Product } from "../../../../types";
import { ProductCard } from "../../../../components/ProductCard/ProductCard";
import { ProductCardSkeleton } from "../../../../components/skeletons";
import styles from "./SimilarProducts.module.scss";

interface SimilarProductsProps {
  products: Product[];
  onProductClick: (productId: string) => void;
  loading?: boolean;
}

const SimilarProducts = ({ products, onProductClick, loading = false }: SimilarProductsProps) => {
  return (
    <div className={styles.similarSection}>
      <h2 className={styles.sectionTitle}>Похожие блюда</h2>
      <div className={styles.similarGrid}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => {
                onProductClick(product.id);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SimilarProducts;
