import styles from './styles.module.less'
import __ from './locale'
import developing from '@/assets/developing.svg'

function Developing() {
    return (
        <div className={styles.developingWrapper}>
            <img
                src={developing}
                alt={__('努力上线中，敬请期待...')}
                width={400}
                height={200}
                className={styles.developingImage}
            />
            {__('努力上线中，敬请期待...')}
        </div>
    )
}

export default Developing
