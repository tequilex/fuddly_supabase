import { MessageCircle } from 'lucide-react';
import styles from './Reviews.module.css';
import { Product } from '@/types';

interface ProductProps {
  product: Product;
}

const Reviews = ({ product }: ProductProps) => {
  return (
    <div className={styles.reviewsBlock}>
      <div className={styles.reviewsHeader}>
        <h2 className={styles.sectionTitle}>Отзывы покупателей</h2>
        <div className={styles.overallRating}>
          <div className={styles.ratingNumber}>{product.rating}</div>
          <div>
            <div className={styles.stars}>
              {/* {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={18} 
                        fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
                      />
                    ))} */}
            </div>
            <div className={styles.reviewsCountText}>
              {product.reviewsCount} отзывов
            </div>
          </div>
        </div>
      </div>

      <div className={styles.reviewsList}>
        {/* {product.reviews.map((review) => (
                <div key={review.id} className={styles.review}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewAuthor}>
                      <div className={styles.reviewAvatar}>
                        {review.author.charAt(0)}
                      </div>
                      <div>
                        <div className={styles.reviewAuthorName}>{review.author}</div>
                        <div className={styles.reviewDate}>{review.date}</div>
                      </div>
                    </div>
                    <div className={styles.reviewRating}>
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          fill={i < review.rating ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className={styles.reviewComment}>{review.comment}</p>
                </div>
              ))} */}
      </div>

      <button className={styles.writeReviewButton}>
        <MessageCircle size={20} />
        Написать отзыв
      </button>
    </div>
  );
};

export default Reviews;
