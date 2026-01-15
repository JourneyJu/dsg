import { Anchor } from 'antd'
import React from 'react'
import __ from '../locale'
import styles from './styles.module.less'

interface ICommonAnchor {
    container?: any
    config?: any[]
}

/**
 * 锚点
 */
const CommonAnchor: React.FC<ICommonAnchor> = ({ container, config = [] }) => {
    const { Link } = Anchor

    return (
        <div className={styles['common-anchor']}>
            <Anchor
                targetOffset={16}
                getContainer={() =>
                    (container.current as HTMLElement) || window
                }
            >
                {config.map((item) => (
                    <Link
                        href={`#${item.key}`}
                        title={item.title}
                        key={item.key}
                    />
                ))}
            </Anchor>
        </div>
    )
}
export default CommonAnchor
