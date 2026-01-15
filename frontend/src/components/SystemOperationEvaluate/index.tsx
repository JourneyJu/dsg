import { Tabs, Button } from 'antd'
import React, { useState } from 'react'
import AllOperationResult from './AllOperationResult'
import SystemOperationDetails from './SystemOperationDetails'
import { operationType, tabItems } from './const'
import styles from './styles.module.less'
import __ from './locale'
import RuleConfigModal from './RuleConfigModal'

const SystemOperationEvaluate: React.FC<any> = () => {
    const [activeKey, setActiveKey] = useState<operationType>(
        operationType.AllOperationResult,
    )
    const [ruleConfigOpen, setRuleConfigOpen] = useState<boolean>(false)

    const handleTabChange = (key) => {
        setActiveKey(key)
    }

    return (
        <div className={styles.systemOperationWrapper}>
            <Tabs
                activeKey={activeKey}
                onChange={handleTabChange}
                items={tabItems}
                className={styles.catlgTabs}
                tabBarExtraContent={
                    <Button
                        className={styles.configBtn}
                        onClick={() => setRuleConfigOpen(true)}
                    >
                        {__('规则设置')}
                    </Button>
                }
            />
            <div className={styles.content}>
                {activeKey === operationType.AllOperationResult ? (
                    <AllOperationResult />
                ) : null}
                {activeKey === operationType.SystemOperationDetail ? (
                    <SystemOperationDetails />
                ) : null}
            </div>

            {ruleConfigOpen && (
                <RuleConfigModal
                    open={ruleConfigOpen}
                    onClose={() => setRuleConfigOpen(false)}
                />
            )}
        </div>
    )
}

export default SystemOperationEvaluate
