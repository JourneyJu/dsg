/* eslint-disable no-bitwise */
import { useState } from 'react'
import DragBox from '../DragBox'
import {
    Architecture,
    CatlgTreeNode,
    allNodeInfo,
    EditResourcesType,
    TableResourcesListType,
} from '../ResourcesDir/const'
import styles from './styles.module.less'
import __ from './locale'
import ResourcesEdited from '../ResourcesDir/ResourcesEdited'
import ResourcesCustomTree from '../ResourcesDir/ResourcesCustomTree'
import { useQuery } from '@/utils'

const ResourceBlacklist = () => {
    const query = useQuery()
    const [defaultSize, setDefaultSize] = useState<Array<number>>([12, 88])
    // 左侧目录tabKey
    const [activeTabKey, setActiveTabKey] = useState<string>()
    const [departmentKey, setDepartmentKey] = useState<string>()
    const [selectedNode, setSelectedNode] = useState<CatlgTreeNode>({
        name: __('全部'),
        id: '',
        path: '',
        type: Architecture.ALL,
    })

    // 获取选中的节点
    const getSelectedNode = (sn?: any) => {
        // if: 在树结构中操作后获取选中项 else: 在列表中操作后 选中项不变，但要更新列表及详情
        let node
        if (sn) {
            node = { ...sn }
        } else {
            node = allNodeInfo
        }
        setSelectedNode(sn || allNodeInfo)
    }

    return (
        <div className={styles.catlgResourceWrapper}>
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
                        needUncategorized
                        isShowCurDept={
                            departmentKey === EditResourcesType.Edited
                        }
                    />
                </div>
                <div className={styles.right}>
                    <ResourcesEdited
                        treeType={activeTabKey}
                        selectedTreeNode={selectedNode}
                        updateResourcesSum={() => {}}
                        tableResourcesListType={
                            TableResourcesListType.ResourcesBackList
                        }
                        departmentKeyChange={setDepartmentKey}
                    />
                </div>
            </DragBox>
        </div>
    )
}

export default ResourceBlacklist
