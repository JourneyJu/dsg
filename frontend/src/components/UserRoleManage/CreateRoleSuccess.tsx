import * as React from 'react'
import { noop } from 'lodash'
import { Modal, Button } from 'antd'
import { CheckCircleFilled } from '@ant-design/icons'
import styles from './styles.module.less'
import __ from './locale'

interface CreateRoleSuccessType {
    onModelClose: () => void
    onAdduser: () => void
    name: string
}
const CreateRoleSuccess = ({
    onModelClose = noop,
    onAdduser,
    name,
}: CreateRoleSuccessType) => {
    return (
        <Modal
            open
            footer={null}
            closable={false}
            maskClosable={false}
            width={430}
        >
            <div className={styles.resultContainer}>
                <div className={styles.resultTitle}>
                    <CheckCircleFilled
                        style={{ color: '#74C041', fontSize: '72px' }}
                    />
                </div>
                <div className={styles.createTitle}>{__('创建成功')}</div>
                <div
                    className={styles.content}
                    title={`${__('角色')}「${name}」`}
                >
                    {`${__('角色')}「`}
                    <span className={styles.contentName}>{name}</span>」
                </div>
                <div className={styles.createTip}>
                    {__('您可以继续向角色中添加用户')}
                </div>
                <div className={styles.successButton}>
                    <div className={styles.closeButton}>
                        <Button
                            style={{
                                width: '80px',
                                height: '32px',
                                fontSize: '14px',
                            }}
                            onClick={onModelClose}
                        >
                            {__('关闭')}
                        </Button>
                    </div>
                    <div>
                        <Button
                            type="primary"
                            style={{
                                width: '80px',
                                height: '32px',
                                fontSize: '14px',
                            }}
                            onClick={onAdduser}
                        >
                            {__('添加用户')}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
export default CreateRoleSuccess
