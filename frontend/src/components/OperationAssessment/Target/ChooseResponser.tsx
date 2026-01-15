import { message, Modal } from 'antd'
import { useEffect, useState } from 'react'
import __ from '../locale'
import styles from './styles.module.less'
import { Architecture } from '@/components/BusinessArchitecture/const'
import { OptionType } from '../AddVisitorModal/const'
import VisitorTree from '../AddVisitorModal/components/VisitorTree'

type IResponser = {
    id: string
    name: string
}

const ChooseResponser = ({
    open,
    onCancel,
    value,
    onOk,
}: {
    open: boolean
    onCancel: () => void
    value: IResponser
    onOk: (responser: IResponser) => void
}) => {
    const [selectedMember, setSelectedMember] = useState<IResponser>()

    useEffect(() => {
        if (value) {
            setSelectedMember(value)
        }
    }, [value])

    const handleOptItem = (type, item) => {
        if (type === OptionType.Add) {
            setSelectedMember({ id: item.id, name: item.name })
        }
    }

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            title={__('选择责任人')}
            width={800}
            bodyStyle={{ height: 532 }}
            onOk={() => {
                if (selectedMember) {
                    onOk(selectedMember)
                    onCancel()
                } else {
                    message.error(__('请选择责任人'))
                }
            }}
        >
            <div className={styles['choose-responser-wrapper']}>
                <div className={styles['selected-member']}>
                    已选择：{selectedMember?.name}
                </div>
                <div className={styles['visitor-tree-wrapper']}>
                    <VisitorTree
                        hiddenType={[
                            Architecture.BMATTERS,
                            Architecture.BSYSTEM,
                            Architecture.COREBUSINESS,
                        ]}
                        filterType={[
                            Architecture.ORGANIZATION,
                            Architecture.DEPARTMENT,
                        ].join(',')}
                        items={selectedMember ? [selectedMember] : []}
                        optItem={handleOptItem}
                    />
                </div>
            </div>
        </Modal>
    )
}

export default ChooseResponser
