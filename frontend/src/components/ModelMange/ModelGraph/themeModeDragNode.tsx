import { register } from '@antv/x6-react-shape'
import { ConfigProvider } from 'antd'
import classnames from 'classnames'
import styles from './styles.module.less'

const ThemeModelNodeComponent = (props: any) => {
    const { node } = props
    const { data } = node
    return (
        <ConfigProvider
            prefixCls="any-fabric-ant"
            iconPrefixCls="any-fabric-anticon"
        >
            <div
                className={classnames(
                    styles['meta-node-wrapper'],
                    styles['meta-node-wrapper-drag'],
                )}
            >
                <div className={styles['meta-header']}>
                    <div className={styles['top-border']} />
                    <div className={styles['node-title']}>
                        <div className={styles['node-title-label']}>
                            <div
                                className={styles['node-title-text']}
                                title={data?.modelInfo?.business_name || ''}
                            >
                                <span>
                                    {data?.modelInfo?.business_name || ''}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ConfigProvider>
    )
}

const themeModelNode = () => {
    register({
        shape: 'theme-model-node',
        effect: ['data'],
        component: ThemeModelNodeComponent,
    })
    return 'theme-model-node'
}

export default themeModelNode
