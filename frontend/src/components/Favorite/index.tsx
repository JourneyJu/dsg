import { Tabs } from 'antd'
import { useState } from 'react'
import FavoriteTable from './FavoriteTable'
import { ResType } from '@/core'
import styles from './styles.module.less'
import __ from './locale'

/**
 * 我的收藏
 */
const MyFavoriteList = () => {
    const [activeKey, setActiveKey] = useState(ResType.DataCatalog)

    const handleTabChange = (key: ResType) => {
        setActiveKey(key)
    }

    const renderTabContent = (key: ResType) => {
        if (key !== activeKey) return null

        return <FavoriteTable key={key} menu={key} />
    }

    return (
        <div className={styles.favoriteMgt}>
            <Tabs
                activeKey={activeKey}
                onChange={(key) => handleTabChange(key as ResType)}
                items={[
                    // {
                    //     label: __('信息资源目录'),
                    //     key: ResType.InfoCatalog,
                    //     children: renderTabContent(ResType.InfoCatalog),
                    // },
                    {
                        label: __('数据资源目录'),
                        key: ResType.DataCatalog,
                        children: renderTabContent(ResType.DataCatalog),
                    },
                    {
                        label: __('接口服务'),
                        key: ResType.InterfaceSvc,
                        children: renderTabContent(ResType.InterfaceSvc),
                    },
                    // {
                    //     label: __('电子证照目录'),
                    //     key: ResType.ElecLicenceCatalog,
                    //     children: renderTabContent(ResType.ElecLicenceCatalog),
                    // },
                ]}
            />
        </div>
    )
}

export default MyFavoriteList
