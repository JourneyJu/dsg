import React, { useState, useMemo } from 'react'
import { Input, Button, Checkbox, Tree } from 'antd'
import {
    DownOutlined,
    UserOutlined,
    LockOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons'
import { FontIcon } from '@/icons'
import { menuManageData } from './const'
import __ from './locale'
import styles from './styles.module.less'

function MenuManage() {
    const [hoveredKey, setHoveredKey] = useState(null)

    const onSelect = (selectedKeys, info) => {}

    const handleAdd = (node, e) => {
        e.stopPropagation()
        // TODO: 添加新增逻辑
    }

    const handleEdit = (node, e) => {
        e.stopPropagation()
        // TODO: 添加编辑逻辑
    }

    const handleDelete = (node, e) => {
        e.stopPropagation()
        // TODO: 添加删除逻辑
    }

    // 自定义节点渲染
    const titleRender = (nodeData) => {
        const isHovered = hoveredKey === nodeData.key

        return (
            <div
                className={`${styles.treeNodeWrapper} ${
                    isHovered ? styles.hovered : ''
                }`}
                onMouseEnter={() => setHoveredKey(nodeData.key)}
                onMouseLeave={() => setHoveredKey(null)}
            >
                <span className={styles.nodeTitle}>{nodeData.title}</span>
                {isHovered && (
                    <div className={styles.nodeActions}>
                        <PlusOutlined
                            title={__('新增')}
                            className={styles.actionIcon}
                            onClick={(e) => handleAdd(nodeData, e)}
                        />
                        <FontIcon
                            name="icon-edit"
                            title={__('编辑')}
                            className={styles.actionIcon}
                            onClick={(e) => handleEdit(nodeData, e)}
                        />
                        <DeleteOutlined
                            title={__('删除')}
                            className={styles.actionIcon}
                            onClick={(e) => handleDelete(nodeData, e)}
                        />
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className={styles.menuManage}>
            <div className={styles.titleWrapper}>
                <div className={styles.title}>{__('菜单管理')}</div>
                <div className={styles.operationWrapper}>
                    <Button icon={<PlusOutlined />} type="primary">
                        {__('新建导航菜单')}
                    </Button>
                </div>
            </div>
            <Tree
                defaultExpandAll
                blockNode
                treeData={menuManageData}
                switcherIcon={<DownOutlined style={{ paddingTop: '12px' }} />}
                onSelect={onSelect}
                titleRender={titleRender}
                className={styles.customTree}
            />
        </div>
    )
}

export default MenuManage
