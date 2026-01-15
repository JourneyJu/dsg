import { SmileOutlined } from '@ant-design/icons'
import { Result } from 'antd'
import BackHome from '@/components/BackHome'
import styles from './styles.module.less'

function Template() {
    return (
        <div className={styles.template}>
            <Result
                icon={
                    <SmileOutlined style={{ fontSize: 48, color: '#126ee3' }} />
                }
                title="开发中，敬请期待"
                extra={<BackHome />}
            />
        </div>
    )
}

export default Template
