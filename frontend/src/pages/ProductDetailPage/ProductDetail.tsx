import { useState } from 'react';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { Product } from '../../types';
import styles from './ProductDetail.module.css';
import './ProductDetailLightbox.module.css';
import UserCard from './sections/UserSection/UserCard';
import ProductInfo from './sections/ProductSection/ProductInfo';
import Reviews from './sections/ReviewsSection/Reviews';
import Description from './sections/DescriptionSection/Description';
import Images from './sections/ImagesSection/Images';
import Breadcrumbs from '@/components/BreadCrumbs/Breadcrumbs';
import { mockProducts } from '@/mock';
import SimilarProducts from './sections/SimilarProducts/SimilarProducts';

interface ProductDetailProps {
  productId: string;
  onBack: () => void;
  onProductClick: (productId: string) => void;
  onSellerClick: () => void;
  product: Product; // Товар из Redux
  similarProducts?: Product[]; // Похожие товары из Redux
}

export function ProductDetail({ onBack, onProductClick, onSellerClick, product, similarProducts}: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!product) {
    return (
      <div className={styles.notFound}>
        <h2>Товар не найден</h2>
        <button onClick={onBack} className={styles.backButton}>
          Вернуться к каталогу
        </button>
      </div>
    );
  }

  return (
    <div className={styles.productDetail}>
      <div className={styles.container}>
        <Breadcrumbs product={product} onBack={onBack} />

        <div className={styles.header}>
          <h1 className={styles.title}>{product.title}</h1>
        </div>

        <div className={styles.topSection}>
          <div className={styles.imageSection}>
            <Images
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              isFavorite={isFavorite}
              setIsFavorite={setIsFavorite}
              setLightboxOpen={setLightboxOpen}
              product={product} 
            />
          </div>

          <div className={styles.sideSection}>
            <ProductInfo product={product} />
            <UserCard userInfo={product.seller} toSeller={onSellerClick} />
          </div>
        </div>

        <div className={styles.productInfoSection}>
          <Description description={product.description} />
          <Reviews product={product} />
        </div>

        {mockProducts.length > 0 && (
          <SimilarProducts products={mockProducts} onProductClick={onProductClick} />
        )}
      </div>

      {/* Lightbox for images */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={product.images.map((image) => ({ src: image }))}
        index={selectedImage}
        plugins={[Zoom, Fullscreen, Thumbnails]}
      />
    </div>
  );
}