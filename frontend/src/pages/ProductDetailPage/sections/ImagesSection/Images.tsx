import { Heart, Share2 } from "lucide-react";
import { Product } from "../../../../types";
import styles from "./Images.module.scss";

interface ImagesProps {
  product: Product;
  selectedImage: number;
  setSelectedImage: (index: number) => void;
  isFavorite: boolean;
  setIsFavorite: (isFavorite: boolean) => void;
  setLightboxOpen: (isOpen: boolean) => void;
}

const Images = ({product, selectedImage, setSelectedImage, isFavorite, setIsFavorite, setLightboxOpen}: ImagesProps) => {

  return (
    <>
      <div className={styles.mainImage}>
        <img
          src={product.images[selectedImage]}
          alt={product.title}
          className={styles.image}
          onClick={() => setLightboxOpen(true)}
        />
        <div className={styles.imageActions}>
          <button
            className={`${styles.iconButton} ${
              isFavorite ? styles.favorite : ""
            }`}
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
          </button>
          <button className={styles.iconButton}>
            <Share2 size={20} />
          </button>
        </div>
      </div>
      <div className={styles.thumbnails}>
        {product.images.map((img, index) => (
          <button
            key={index}
            className={`${styles.thumbnail} ${
              selectedImage === index ? styles.active : ""
            }`}
            onClick={() => setSelectedImage(index)}
          >
            <img src={img} alt={`${product.title} ${index + 1}`} />
          </button>
        ))}
      </div>
    </>
  );
};

export default Images;
