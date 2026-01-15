import styles from './styles.module.less'
/**
 * 标签 view
 */
export const TagsView = (props: { data?: string[] }) => {
    const { data = [] } = props
    return (
        <div className={styles.tagsViewWrap}>
            {data.length > 0
                ? data.map((item, idx) => (
                      <span key={idx} className={styles.tagItem}>
                          {item}
                      </span>
                  ))
                : '--'}
        </div>
    )
}
