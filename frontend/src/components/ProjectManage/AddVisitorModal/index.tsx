import { useContext, useEffect, useRef, useState } from 'react'
import { Modal, message } from 'antd'
import { MicroWidgetPropsContext } from '@/context'
import VisitorList from './components/VisitorList'
import VisitorTree from './components/VisitorTree'
import __ from './locale'
import styles from './styles.module.less'
import { Architecture } from '@/components/BusinessArchitecture/const'
import { OptionType } from './const'

function AddMember({ visible, value, onChange }: any) {
    const treeRef = useRef<any>()
    const [selectedMembers, setSelectedMembers] = useState<any[]>([])

    useEffect(() => {
        if (!visible) {
            treeRef?.current?.onClear()
        }
    }, [visible])

    useEffect(() => {
        if (value) {
            setSelectedMembers(value)
        }
    }, [value])

    const triggerOnChange = (data) => {
        onChange?.(data)
    }

    const handleOptItem = (type, item) => {
        if (type === OptionType.Remove) {
            triggerOnChange(selectedMembers.filter((it) => it.id !== item.id))
        }
        if (type === OptionType.Add) {
            triggerOnChange([
                ...selectedMembers,
                { id: item.id, name: item.name },
            ])
        }
    }

    return (
        <div className={styles['visitor-wrapper']}>
            <div className={styles['common-title']}>{__('选择成员')}</div>
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
                        clearItems={() => triggerOnChange([])}
                        optItem={handleOptItem}
                    />
                </div>
            </div>
        </div>
    )
}

export default AddMember
