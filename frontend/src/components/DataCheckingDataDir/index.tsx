import { useEffect, useState } from 'react'
import { Tabs } from 'antd'
import DragBox from '../DragBox'
import { tabItems, TabKey, allNodeInfo } from './const'
import styles from './styles.module.less'
import __ from './locale'
import ResourcesCustomTree from '../ResourcesDir/ResourcesCustomTree'
import DepartmentResourceDir from './DepartmentResourceDir'
import AuthorizedResources from './AuthorizedResources'
import { CatlgTreeNode, Architecture } from '../ResourcesDir/const'

const DataCheckingDataDir = () => {
    const [defaultSize, setDefaultSize] = useState<Array<number>>([12, 88])
    const [activeKey, setActiveKey] = useState<TabKey>(
        TabKey.DepartmentResources,
    )
    const [selectedNode, setSelectedNode] = useState<CatlgTreeNode>(allNodeInfo)

    // 获取选中的节点
    const getSelectedNode = (sn?: any) => {
        setSelectedNode(sn || allNodeInfo)
    }

    const handleTabChange = (key: string) => {
        setActiveKey(key as TabKey)
        setSelectedNode(allNodeInfo)
    }

    return (
        <div className={styles.dataCheckingWrapper}>
            <Tabs
                activeKey={activeKey}
                onChange={handleTabChange}
                items={tabItems}
                className={styles.tabs}
            />
            {/* 本部门数据资源目录 - 左右分栏布局 */}
            {activeKey === TabKey.DepartmentResources && (
                <DragBox
                    defaultSize={defaultSize}
                    minSize={[220, 270]}
                    maxSize={[800, Infinity]}
                    onDragEnd={(size) => {
                        setDefaultSize(size)
                    }}
                >
                    <div className={styles.left}>
                        <ResourcesCustomTree
                            onChange={getSelectedNode}
                            defaultCategotyId="00000000-0000-0000-0000-000000000001"
                            needUncategorized
                            isShowCurDept
                            isShowMainDept
                            wapperStyle={{ height: 'calc(100vh - 105px)' }}
                            applyScopeTreeKey="data_resource_left"
                        />
                    </div>
                    <div className={styles.right}>
                        <DepartmentResourceDir
                            selectedTreeNode={selectedNode}
                        />
                    </div>
                </DragBox>
            )}
            {/* 已授权目录 - 全宽布局，无需树形筛选 */}
            {activeKey === TabKey.AuthorizedResources && (
                <div className={styles.authorizedWrapper}>
                    <AuthorizedResources />
                </div>
            )}
        </div>
    )
}

export default DataCheckingDataDir
