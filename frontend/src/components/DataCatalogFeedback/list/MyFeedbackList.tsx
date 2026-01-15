import { Tabs } from 'antd'
import { useState } from 'react'
import classnames from 'classnames'
import FeedbackTable from './FeedbackTable'
import FeedbackTableResMode from '@/components/FeedbackResMode/list/FeedbackTable'
import { FeedbackMenuEnum } from '../helper'
import { FeedbackMenuEnum as FeedbackMenuEnumResMode } from '@/components/FeedbackResMode/helper'
import styles from '../styles.module.less'
import __ from '../locale'

/**
 * 我的反馈
 */
const MyFeedbackList = () => {
    const [activeKey, setActiveKey] = useState<FeedbackMenuEnum>(
        FeedbackMenuEnum.MyFeedback,
    )

    const handleTabChange = (key: FeedbackMenuEnum) => {
        setActiveKey(key)
    }

    const renderTabContent = (key: FeedbackMenuEnum) => {
        if (key !== activeKey) return null

        if (key === FeedbackMenuEnum.MyFeedback) {
            return (
                <FeedbackTable
                    key={FeedbackMenuEnum.MyFeedback}
                    menu={FeedbackMenuEnum.MyFeedback}
                    scrollY="calc(100vh - 343px)"
                />
            )
        }
        if (key === FeedbackMenuEnum.InterfaceSvc) {
            return (
                <FeedbackTableResMode
                    key={FeedbackMenuEnumResMode.InterfaceSvc}
                    menu={FeedbackMenuEnumResMode.InterfaceSvc}
                    scrollY="calc(100vh - 343px)"
                />
            )
        }
        return null
    }

    return (
        <div className={classnames(styles.feedbackMgt)}>
            <Tabs
                activeKey={activeKey}
                onChange={(key) => handleTabChange(key as FeedbackMenuEnum)}
                items={[
                    {
                        label: __('数据资源目录'),
                        key: FeedbackMenuEnum.MyFeedback,
                        children: renderTabContent(FeedbackMenuEnum.MyFeedback),
                    },
                    {
                        label: __('接口服务'),
                        key: FeedbackMenuEnum.InterfaceSvc,
                        children: renderTabContent(
                            FeedbackMenuEnum.InterfaceSvc,
                        ),
                    },
                ]}
                className={styles.feedbackTabs}
            />
        </div>
    )
}

export default MyFeedbackList
