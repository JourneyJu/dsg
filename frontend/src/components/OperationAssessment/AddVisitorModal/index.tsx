import { useContext, useEffect, useRef, useState } from 'react'
import { Modal, message } from 'antd'
import { MicroWidgetPropsContext } from '@/context'
import VisitorList from './components/VisitorList'
import VisitorTree from './components/VisitorTree'
import __ from './locale'
import styles from './styles.module.less'
import { Architecture } from '@/components/BusinessArchitecture/const'
import { OptionType } from './const'

interface IAddMember {
    open: boolean
    value?: any
    onOk: (data: any) => void
    onCancel: () => void
}

function ChooseMembers({ open, value, onOk, onCancel }: IAddMember) {
    const treeRef = useRef<any>()
    const [selectedMembers, setSelectedMembers] = useState<any[]>([])

    useEffect(() => {
        if (!open) {
            treeRef?.current?.onClear()
        }
    }, [open])

    useEffect(() => {
        if (value) {
            setSelectedMembers(value)
        }
    }, [value])

    const handleOptItem = (type, item) => {
        if (type === OptionType.Remove) {
            setSelectedMembers(
                selectedMembers.filter((it) => it.id !== item.id),
            )
        }
        if (type === OptionType.Add) {
            setSelectedMembers([
                ...selectedMembers,
                { id: item.id, name: item.name },
            ])
        }
    }

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            title={__('设置成员')}
            width={800}
            bodyStyle={{ height: 532 }}
            onOk={() => {
                onOk?.(selectedMembers)
                onCancel()
            }}
        >
            <div className={styles['visitor-wrapper']}>
                <div className={styles['visitor-wrapper-content']}>
                    <div className={styles['visitor-wrapper-content-left']}>
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
                            items={selectedMembers}
                            optItem={handleOptItem}
                            ref={treeRef}
                        />
                    </div>
                    <div className={styles['visitor-wrapper-content-right']}>
                        <VisitorList
                            items={selectedMembers}
                            clearItems={() => setSelectedMembers([])}
                            optItem={handleOptItem}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default ChooseMembers
