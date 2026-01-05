import styles from './Footer.module.scss';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <p>&copy; 2025 Fuddly. Маркетплейс оптовых продаж пищевой продукции.</p>
      </div>
    </footer>
  );
};

export default Footer;
