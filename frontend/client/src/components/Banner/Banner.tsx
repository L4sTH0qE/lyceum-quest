import styles from './Banner.module.css';

interface IBannerProps {
    url: string;
    name: string;
}

const Banner = ({ url }: IBannerProps) => {
    return (
        <div className={styles.banner_wrapper}>
            <img src={url} className={styles.banner} alt='' />
        </div>
    );
};

export default Banner;
