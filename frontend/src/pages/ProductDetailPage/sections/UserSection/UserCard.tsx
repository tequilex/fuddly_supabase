import React from "react";
import { ChefHat, Star, ShoppingCart, MapPin } from "lucide-react";
import styles from "./UserCard.module.css";
import { Seller } from "@/types";

interface UserCardProps {
  userInfo: Seller;
  toSeller: () => void;
}

const UserCard = ({ userInfo, toSeller }: UserCardProps) => {
  return (
    <div className={styles.chefCard}>
      <div className={styles.chefCardHeader}>
        <h3 className={styles.sectionTitleSmall}>О продавце</h3>
      </div>

      <div className={styles.chefProfile}>
        <div className={styles.chefImageLarge}>
          <img src={userInfo?.avatar} alt={userInfo?.name} />
        </div>
        <div className={styles.chefInfo}>
          <h3 className={styles.chefName}>{userInfo?.name}</h3>
          <div className={styles.chefBadge}>
            <ChefHat size={14} />
            Проверенный повар
          </div>
          <div className={styles.chefStats}>
            <div className={styles.chefStat}>
              <Star size={16} fill="currentColor" />
              <span>{userInfo?.chefRating || 5}</span>
            </div>
            <div className={styles.chefStat}>
              <ShoppingCart size={16} />
              <span>{userInfo?.chefOrders || 300} заказов</span>
            </div>
            <div className={styles.chefStat}>
              <MapPin size={16} />
              <span>{userInfo.distance || "fff"}</span>
            </div>
          </div>
        </div>
      </div>

      <p className={styles.chefBio}>
        {userInfo?.chefBio ||
          "Кондитер с французским образованием. Готовлю свежую выпечку каждое утро по классическим рецептам."}
      </p>

      <button className={styles.viewChefButton} onClick={toSeller}>
        Все блюда повара
      </button>
    </div>
  );
};

export default UserCard;
