import * as React from 'react'

import __ from '../locale'
import styles from './styles.module.less'

// 长沙数据局专有的应用服务 tab
const CSSJJAppService: React.FC = () => {
    return (
        <iframe
            className={styles.container}
            title={__('应用服务')}
            src="https://smartgate.changsha.gov.cn/app_yyztmh/web/service-supermark/#/menuManager"
        />
    )
}

export default CSSJJAppService
