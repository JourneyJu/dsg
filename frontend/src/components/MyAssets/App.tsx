import { useState } from 'react'
import { Tabs } from 'antd'
import { getPlatformNumber } from '@/utils'
import AssetsVisitorList from './AssetsVisitorList'
import __ from './locale'
import { LoginPlatform } from '@/core'
import GatewayAppMgt from '@/components/DataServiceMgt/GatewayAppMgt'
import styles from './styles.module.less'

enum AppType {
    APP = 'app',
    GATEWAY_APP = 'gateway_app',
}
const App = () => {
    const platform = getPlatformNumber()
    const [isAppDeveloperEmpty, setIsAppDeveloperEmpty] =
        useState<boolean>(false)

    return platform === LoginPlatform.default ? (
        <AssetsVisitorList updateAssetList={setIsAppDeveloperEmpty} />
    ) : (
        <div className={styles['app-container']}>
            <Tabs
                defaultActiveKey={AppType.APP}
                items={[
                    {
                        label: __('集成应用'),
                        key: AppType.APP,
                        children: (
                            <AssetsVisitorList
                                updateAssetList={setIsAppDeveloperEmpty}
                            />
                        ),
                    },
                    {
                        label: __('网关应用'),
                        key: AppType.GATEWAY_APP,
                        children: <GatewayAppMgt />,
                    },
                ]}
            />
        </div>
    )
}

export default App
