import { useState } from 'react'
import AddressBookTable from './list/AddressBookTable'
import { AddressBookMenuEnum, AddressBookTabMap } from './helper'
import styles from './styles.module.less'
import __ from './locale'
import ArchitectureDirTree from '@/components/BusinessArchitecture/ArchitectureDirTree'
import { DataNode, Architecture } from '@/components/BusinessArchitecture/const'
import DragBox from '../DragBox'

/**
 * 通讯录
 */
const AddressBookList = () => {
    const [defaultSize, setDefaultSize] = useState<Array<number>>([12, 88])

    const [selectedNode, setSelectedNode] = useState<DataNode>()
    const [searchValue, setSearchValue] = useState('')
    const [searchCondition, setSearchCondition] = useState<any>({
        id: '',
        is_all: true,
        type: '',
        keyword: '',
        current: 1,
    })
    const [selectedRow, setSelectedRow] = useState<DataNode>()

    // 获取选中的节点 delNode: 删除的节点(用来判断列表中的选中项是否被删除) 用来刷新列表及详情
    const getSelectedNode = (sn?: DataNode, delNode?: DataNode) => {
        // if: 在树结构中操作后获取选中项 else: 在列表中操作后 选中项不变，但要更新列表及详情
        if (sn) {
            setSelectedNode({ ...sn })
            setSelectedRow(undefined)
            setSearchCondition({
                ...searchCondition,
                is_all: true,
                keyword: '',
                type: '',
                id:
                    sn.id.endsWith('SC') || sn.id.endsWith('MC')
                        ? sn.id.substring(0, sn.id.length - 3)
                        : sn.id,
                current: 1,
            })
            setSearchValue('')
            // lightweightSearchRef.current?.reset()
        } else {
            // 在列表中删除的情况或重命名时，选中项不变，但是要更新数据
            setSearchCondition({
                ...searchCondition,
            })
            // 操作成功后，按照左侧树选中节点刷新列表+详情
            setSelectedRow(undefined)
            setSelectedNode(selectedNode ? { ...selectedNode } : undefined)
        }
    }

    return (
        <div className={styles.addressBookMgt}>
            <DragBox
                defaultSize={defaultSize}
                minSize={[220, 270]}
                maxSize={[800, Infinity]}
                onDragEnd={(size) => {
                    setDefaultSize(size)
                }}
            >
                <div className={styles.leftWrapper}>
                    <ArchitectureDirTree
                        getSelectedNode={getSelectedNode}
                        filterType={[
                            Architecture.ORGANIZATION,
                            Architecture.DEPARTMENT,
                        ].join()}
                        needUncategorized
                        unCategorizedKey="00000000-0000-0000-0000-000000000000"
                    />
                </div>

                <div className={styles.rightWrapper}>
                    <div className={styles.addressBookTitle}>
                        {AddressBookTabMap[AddressBookMenuEnum.List].title}
                    </div>
                    <AddressBookTable
                        selectedNode={selectedNode}
                        menu={AddressBookMenuEnum.List}
                    />
                </div>
            </DragBox>
        </div>
    )
}

export default AddressBookList
