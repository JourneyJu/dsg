import {
    MarkAGreyColored,
    MarkBGreenColored,
    MarkGreenColored,
    MarkGreyColored,
} from '@/icons'
import __ from './locale'
import styles from './styles.module.less'

const TypeShow = () => {
    return (
        <div className={styles['type-show-container']}>
            <div className={styles['business-form']}>
                <MarkGreenColored className={styles['business-icon']} />
                <span className={styles.desc}>{__('业务表')}</span>
            </div>
            <div className={styles['data-form']}>
                <MarkGreyColored className={styles['data-icon']} />
                <span className={styles.desc}>{__('数据表')}</span>
            </div>
            <div className={styles['map-info']}>
                <MarkAGreyColored className={styles['data-icon']} />
                <div className={styles.arrow} />
                <MarkBGreenColored className={styles['business-icon']} />
                <span className={styles.desc}>
                    {__('B表数据由A表“映射”后得到')}
                </span>
            </div>
        </div>
    )
}

export default TypeShow
