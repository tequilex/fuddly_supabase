import styles from "./Description.module.scss";

interface DescriptionProps {
  description: string;
}

const Description = ({ description }: DescriptionProps) => {
  return (
    <div className={styles.descriptionBlock}>
      <h2 className={styles.sectionTitle}>Описание</h2>
      <p className={styles.description}>{description}</p>
    </div>
  );
};

export default Description;
