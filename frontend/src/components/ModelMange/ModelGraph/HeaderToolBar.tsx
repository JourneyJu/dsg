import { Button, Divider, Dropdown, Space, Tooltip } from 'antd'
import { useState } from 'react'
import { DownOutlined, LeftOutlined } from '@ant-design/icons'
import { useModelGraphContext } from './ModelGraphProvider'
import GlobalMenu from '@/components/GlobalMenu'
import styles from './styles.module.less'
import __ from '../locale'
import {
    FontIcon,
    LargeOutlined,
    LocationOutlined,
    NarrowOutlined,
} from '@/icons'
import { ReturnConfirmModal } from '@/ui'
import { ViewModel } from '../const'

const graphSizeItems = [
    {
        key: 'all',
        label: __('总览全部'),
    },
    {
        key: 'divider',
        label: (
            <Divider
                style={{
                    margin: 0,
                }}
            />
        ),
        disabled: true,
    },
    {
        key: '400',
        label: '400%',
    },
    {
        key: '200',
        label: '200%',
    },
    {
        key: '100',
        label: '100%',
    },
    {
        key: '50',
        label: '50%',
    },
]

const HeaderToolBar = () => {
    const {
        onReturn,
        modelInfo,
        graphSize,
        onShowAll,
        onChangeSize,
        onMovedToCenter,
        onFoldAll,
        onSaveModel,
        viewModel,
    } = useModelGraphContext()
    const [saveLoading, setSaveLoading] = useState<boolean>(false)

    /**
     * 选择画布大小
     * @param key 选择项
     */
    const selectGraphSize = (key: string) => {
        const showSize: number = 100
        switch (true) {
            case key === 'all':
                onShowAll()
                break
            case key === 'divider':
                break
            default:
                onChangeSize(Number(key) / 100)
                break
        }
    }

    return (
        <div className={styles['header-bar-wrapper']}>
            <Space className={styles['menu-container']} size={12}>
                <div className={styles['menu-wrapper']}>
                    <GlobalMenu />
                    <div
                        onClick={() => {
                            if (viewModel === ViewModel.EDIT) {
                                ReturnConfirmModal({
                                    onCancel: onReturn,
                                })
                            } else {
                                onReturn()
                            }
                        }}
                        className={styles['back-wrapper']}
                    >
                        <LeftOutlined className={styles['return-arrow']} />
                        <span className={styles['return-text']}>
                            {__('返回')}
                        </span>
                    </div>
                </div>
                <div className={styles.divider} />
                <div
                    className={styles['title-text']}
                    title={modelInfo?.business_name}
                >
                    {modelInfo?.business_name}
                </div>
            </Space>
            <div className={styles.toolWrapper}>
                <div className={styles.toolbarContent}>
                    <div>
                        <Tooltip placement="top" title={__('收起所有模型')}>
                            <Button
                                type="text"
                                icon={<FontIcon name="icon-shouqimoxing" />}
                                onClick={() => {
                                    onFoldAll()
                                }}
                            />
                        </Tooltip>
                    </div>
                </div>
                <div className={styles.divider} />
                <div className={styles.toolbarContent}>
                    <div className={styles.toolIcon}>
                        <Tooltip placement="top" title={__('缩小')}>
                            <Button
                                type="text"
                                icon={
                                    <NarrowOutlined
                                        style={{
                                            fontSize: '14px',
                                        }}
                                        disabled={graphSize <= 20}
                                    />
                                }
                                onClick={() => {
                                    onChangeSize(
                                        Math.round(graphSize - 5) / 100,
                                    )
                                }}
                                disabled={graphSize <= 20}
                                className={`${styles.toolButton} ${
                                    graphSize <= 20
                                        ? styles.iconDisabled
                                        : styles.iconEnabled
                                }`}
                            />
                        </Tooltip>
                    </div>
                    <div className={styles.toolIcon}>
                        <Dropdown
                            menu={{
                                items: graphSizeItems,
                                onClick: ({ key }) => {
                                    selectGraphSize(key)
                                },
                            }}
                        >
                            <div
                                className={`${styles.toolSelectSize} ${styles.iconEnabled}`}
                            >
                                <div
                                    style={{
                                        fontSize: '12px',
                                        userSelect: 'none',
                                    }}
                                    onDoubleClick={() => {
                                        onChangeSize(1)
                                    }}
                                >
                                    {`${Math.round(graphSize)}%`}
                                </div>
                                <DownOutlined
                                    style={{
                                        fontSize: '10px',
                                        margin: '0 0 0 5px',
                                    }}
                                />
                            </div>
                        </Dropdown>
                    </div>
                    <div className={styles.toolIcon}>
                        <Tooltip placement="top" title={__('放大')}>
                            <Button
                                type="text"
                                icon={
                                    <LargeOutlined
                                        style={{
                                            fontSize: '14px',
                                        }}
                                    />
                                }
                                onClick={() => {
                                    onChangeSize(
                                        Math.round(graphSize + 5) / 100,
                                    )
                                }}
                                disabled={graphSize >= 400}
                                className={`${styles.toolButton} ${
                                    graphSize >= 400
                                        ? styles.iconDisabled
                                        : styles.iconEnabled
                                }`}
                            />
                        </Tooltip>
                    </div>
                </div>
                <div className={styles.divider} />
                <div className={styles.toolbarContent}>
                    <div className={styles.toolIcon}>
                        <Tooltip placement="top" title={__('定位')}>
                            <Button
                                type="text"
                                icon={
                                    <LocationOutlined
                                        style={{
                                            fontSize: '16px',
                                        }}
                                    />
                                }
                                onClick={() => {
                                    onMovedToCenter()
                                }}
                                className={`${styles.toolButton} ${styles.iconEnabled}`}
                            />
                        </Tooltip>
                    </div>
                </div>
            </div>
            <div className={styles.toolbarContent}>
                {viewModel === ViewModel.EDIT && (
                    <Button
                        type="primary"
                        onClick={async () => {
                            setSaveLoading(true)
                            await onSaveModel()
                            setSaveLoading(false)
                        }}
                        loading={saveLoading}
                    >
                        {__('保存')}
                    </Button>
                )}
            </div>
        </div>
    )
}

export default HeaderToolBar
