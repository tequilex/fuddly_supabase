import { Link } from 'react-router-dom';
import styles from './HomePage.module.scss';

const HomePage = () => {
  return (
    <div className={styles.homePage}>
      <section className={styles.hero}>
        <div className="container">
          <h1>Fuddly - Маркетплейс оптовых продаж</h1>
          <p>Покупайте и продавайте пищевую продукцию оптом</p>
          <Link to="/catalog" className={styles.cta}>
            Перейти в каталог
          </Link>
        </div>
      </section>

      <section className={styles.features}>
        <div className="container">
          <h2>Почему Fuddly?</h2>
          <div className={styles.featureGrid}>
            <div className={styles.feature}>
              <h3>Для покупателей</h3>
              <p>Находите надёжных поставщиков пищевой продукции</p>
            </div>
            <div className={styles.feature}>
              <h3>Для продавцов</h3>
              <p>Размещайте объявления и привлекайте оптовых покупателей</p>
            </div>
            <div className={styles.feature}>
              <h3>Безопасность</h3>
              <p>Модерация объявлений и проверенные продавцы</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
