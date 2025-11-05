import styles from "./LogoHeader.module.css";

type LogoHeaderProps = {
  leftLogo?: {
    src: string;
    alt?: string;
  };
  rightLogo?: {
    src: string;
    alt?: string;
  };
};

const defaultLeftText = "Canalco";
const defaultRightText = "Tu Logo";

function LogoHeader({ leftLogo, rightLogo }: LogoHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.logoWrapper}>
        {leftLogo ? (
          <img
            className={styles.logoImage}
            src={leftLogo.src}
            alt={leftLogo.alt ?? "Logo institucional izquierdo"}
          />
        ) : (
          <div className={styles.logoPlaceholder}>{defaultLeftText}</div>
        )}
      </div>
      <div className={styles.logoWrapper}>
        {rightLogo ? (
          <img
            className={styles.logoImage}
            src={rightLogo.src}
            alt={rightLogo.alt ?? "Logo institucional derecho"}
          />
        ) : (
          <div className={styles.logoPlaceholder}>{defaultRightText}</div>
        )}
      </div>
    </header>
  );
}

export default LogoHeader;
