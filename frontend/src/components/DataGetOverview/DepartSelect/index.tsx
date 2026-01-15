import { useDebounceFn } from 'ahooks'
import { Tag, TreeSelect } from 'antd'
import { memo, useEffect, useMemo, useState } from 'react'
import {
    formatError,
    getCurUserDepartment,
    getObjectDetails,
    getObjects,
    IGetObject,
    IObject,
} from '@/core'
import styles from './styles.module.less'

const { SHOW_PARENT } = TreeSelect
/**
 * 加载类型
 */
enum LoadType {
    Init,
    Load,
}

interface DataNode extends IObject {
    expand?: boolean
    path_id?: string
    children?: DataNode[]
    isExpand?: boolean
}

// 业务架构节点枚举
enum Architecture {
    ALL = 'all', // 全部
    DOMAIN = 'domain', // 域
    DISTRICT = 'district', // 区域
    ORGANIZATION = 'organization', // 组织
    DEPARTMENT = 'department', // 部门
    BSYSTEM = 'business_system', // 信息系统
    BMATTERS = 'business_matters', // 业务事项
    BFORM = 'business_form', // 业务表单
    BSYSTEMCONTAINER = 'business_system_container', // 信息系统容器
    BMATTERSCONTAINER = 'business_matters_container', // 业务事项容器
    COREBUSINESS = 'main_business', // 业务模型
    DATACATALOG = 'data_catalog', // 数据目录
}

const ArchitectureTypeList: any[] = [
    Architecture.DISTRICT,
    Architecture.ORGANIZATION,
    Architecture.DEPARTMENT,
    Architecture.BSYSTEM,
    Architecture.BMATTERS,
    Architecture.BFORM,
    Architecture.BSYSTEMCONTAINER,
    Architecture.BMATTERSCONTAINER,
    Architecture.COREBUSINESS,
    Architecture.DATACATALOG,
]

/**
 * 更新树
 * @param list 当前树列表
 * @param id 选中项id
 * @param children 选中项子节点
 * @returns 更新后的树数据
 */
const updateTreeData = (
    list: DataNode[],
    id: string,
    children: DataNode[],
): DataNode[] =>
    list.map((node) => {
        const isArchitecture = ArchitectureTypeList.includes(node.type)
        if (node.id === id) {
            return {
                ...node,
                isLeaf: !node.expand,
                children: children?.map((child) => {
                    return {
                        ...child,
                        isLeaf: !child.expand,
                    }
                }),
            }
        }
        if (node.children) {
            return {
                ...node,
                isLeaf: !node.expand,
                children: updateTreeData(node.children, id, children),
            }
        }
        return { ...node }
    })

const DefaultParams = { limit: 0, id: '', is_all: false }

const DepartSelect = ({
    onCheckChange,
    isShowCurDept = false,
    initParams,
    filterType,
    width,
}: {
    onCheckChange: (keys: string[]) => void
    isShowCurDept?: boolean
    initParams?: Object
    filterType?: string
    width?: number
}) => {
    const [departIds, setDepartIds] = useState<string[]>()
    const [treeData, setTreeData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [curUserDepartment, setCurUserDepartment] = useState<DataNode>()

    useEffect(() => {
        getTreeData()
    }, [isShowCurDept])

    const QueryParams = useMemo(
        () =>
            initParams
                ? { ...DefaultParams, ...initParams, type: filterType }
                : { ...DefaultParams, type: filterType },
        [filterType, initParams],
    )

    const { run: debouncedGetData } = useDebounceFn(
        (params: IGetObject, optType: LoadType, parent_id?: string) => {
            getData(params, optType, parent_id)
        },
        { wait: 100 },
    )

    // 增量更新
    const onLoadData = async (node: any) => {
        try {
            const { id, children } = node
            if (children) {
                return Promise.resolve()
            }
            await debouncedGetData({ ...QueryParams, id }, LoadType.Load, id)
        } catch (err) {
            formatError(err)
        }
        return Promise.resolve()
    }

    const getTreeData = async () => {
        try {
            setLoading(true)
            if (isShowCurDept) {
                let res = curUserDepartment
                if (!res) {
                    res = await getCurDepartment()
                    if (res) {
                        setCurUserDepartment(res)
                    } else {
                        return
                    }
                }
                const departRes = await getObjectDetails(res?.id)
                if (departRes) {
                    setTreeData([departRes])
                }
            } else {
                debouncedGetData(QueryParams, LoadType.Init)
            }
        } catch (error) {
            formatError(error)
        } finally {
            setLoading(false)
        }
    }

    const getCurDepartment = async () => {
        try {
            const res = await getCurUserDepartment()
            if (res?.length === 1) {
                setCurUserDepartment(res[0])
                return res[0]
            }
            return undefined
        } catch (error) {
            formatError(error)
            return Promise.resolve([])
        }
    }

    const getData = async (
        params: IGetObject,
        optType: LoadType,
        parent_id?: string,
    ) => {
        try {
            if (optType === LoadType.Init) {
                setLoading(true)
            }
            const responseData = await getObjects(params)
            const res = responseData?.entries

            let initData
            if (optType === LoadType.Init) {
                initData = res?.map((o) => ({
                    ...o,
                    isLeaf: !o.expand,
                }))
            }

            switch (optType) {
                case LoadType.Init:
                    setTreeData(initData)
                    break
                case LoadType.Load:
                    setTreeData((prev: DataNode[] | undefined) =>
                        updateTreeData(prev!, parent_id!, res),
                    )
                    break
                default:
                    break
            }
        } catch (error) {
            formatError(error)
        } finally {
            setLoading(false)
        }
    }

    const onChange = (newValue: string[]) => {
        setDepartIds(newValue)
        onCheckChange?.(newValue)
    }

    const tagRender = (p: any) => {
        const { closable, onClose, label } = p || {}
        return (
            <Tag
                closable={closable}
                onClose={onClose}
                title={label}
                className={styles['depart-select-tag']}
            >
                <span className={styles['depart-select-tag-span']}>
                    {label}
                </span>
            </Tag>
        )
    }

    return (
        <TreeSelect
            className={styles['depart-select']}
            popupClassName={styles['depart-select-popup']}
            treeData={treeData}
            value={departIds}
            onChange={onChange}
            loading={loading}
            loadData={onLoadData}
            treeCheckable
            showCheckedStrategy={SHOW_PARENT}
            placeholder="请选择部门"
            fieldNames={{ label: 'name', value: 'id' }}
            showArrow
            allowClear
            maxTagCount={1}
            maxTagPlaceholder={(omittedValues) => `+${omittedValues.length} `}
            tagRender={tagRender}
            style={{
                width: width ? `${width}px` : '200px',
                textAlign: 'left',
            }}
        />
    )
}

export default memo(DepartSelect)
