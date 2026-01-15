import { Drawer, Table } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import styles from './styles.module.less'
import __ from '../locale'
import { SearchInput } from '@/ui'
import { formsEnumConfig } from '@/core'

interface AddAnalysisOutputProps {
    isDrawer?: boolean
    open?: boolean
    onClose?: () => void
    data: { name: string; columns: any[] }
}
const OutputDetails = ({
    open = false,
    onClose = () => {},
    data,
    isDrawer = true,
}: AddAnalysisOutputProps) => {
    // 字段信息的相关的后端枚举映射
    const [dataTypeOptions, setDataTypeOptions] = useState<any[]>([])
    const [searchValue, setSearchValue] = useState('')

    const filteredData = useMemo(() => {
        return data.columns.filter(
            (item) =>
                item.name_cn
                    .toLowerCase()
                    .includes(searchValue.toLowerCase()) ||
                item.name_en.toLowerCase().includes(searchValue.toLowerCase()),
        )
    }, [data.columns, searchValue])

    const getEnumConfig = async () => {
        const enumConfig = await formsEnumConfig()
        const res = (enumConfig?.data_type || []).filter(
            (item) => item.value_en !== 'number',
        )
        setDataTypeOptions(res)
    }

    useEffect(() => {
        getEnumConfig()
    }, [])

    const columns = [
        {
            title: __('字段名称'),
            dataIndex: 'name_cn',
            key: 'name_cn',
        },
        {
            title: __('英文名称'),
            dataIndex: 'name_en',
            key: 'name_en',
        },
        {
            title: __('数据标准'),
            dataIndex: 'data_std_name',
            key: 'data_std_name',
            render: (val: string) => val || '--',
        },
        {
            title: __('关联码表'),
            dataIndex: 'dict_name',
            key: 'dict_name',
            render: (val: string) => val || '--',
        },
        {
            title: __('关联编码规则'),
            dataIndex: 'rule_name',
            key: 'rule_name',
            render: (val: string) => val || '--',
        },
        {
            title: __('值域'),
            dataIndex: 'ranges',
            key: 'ranges',
            render: (val: string) => val || '--',
        },
        {
            title: __('数据类型'),
            dataIndex: 'data_type',
            key: 'data_type',
            render: (val) =>
                dataTypeOptions.find((item) => item.value_en === val)?.value ||
                '--',
        },
        {
            title: __('数据长度'),
            dataIndex: 'data_length',
            key: 'data_length',
            render: (val) => val || '--',
        },
        {
            title: __('数据精度'),
            dataIndex: 'data_accuracy',
            key: 'data_accuracy',
            render: (val) => val || '--',
        },
        {
            title: __('主键'),
            dataIndex: 'is_pk',
            key: 'is_pk',
            render: (val: boolean) => (val ? __('是') : __('否')),
        },
        {
            title: __('必填'),
            dataIndex: 'is_mandatory',
            key: 'is_mandatory',
            render: (val: boolean) => (val ? __('是') : __('否')),
        },
        {
            title: __('增量字段'),
            dataIndex: 'is_increment_field',
            key: 'is_increment_field',
            render: (val: boolean) => (val ? __('是') : __('否')),
        },
        {
            title: __('是否标准'),
            dataIndex: 'is_standardized',
            key: 'is_standardized',
            render: (val: boolean) => (val ? __('是') : __('否')),
        },
        {
            title: __('字段关系'),
            dataIndex: 'field_rel',
            key: 'field_rel',
            render: (val: string, record) =>
                val ||
                (record.view_busi_name && record.name_cn
                    ? __('默认”取值${view}表${field}字段“', {
                          view: record.view_busi_name,
                          field: record.name_cn,
                      })
                    : '--'),
        },
    ]

    const TableComp = (
        <div className={styles['output-details']}>
            <div className={styles['output-details-search']}>
                <SearchInput
                    placeholder={__('搜索字段中英文名称')}
                    style={{ width: 280 }}
                    onKeyChange={(e) => setSearchValue(e)}
                />
            </div>
            <Table
                columns={columns}
                dataSource={filteredData || []}
                pagination={{ hideOnSinglePage: true }}
                className={styles['analysis-output-table']}
                rowKey="id"
            />
        </div>
    )
    return isDrawer ? (
        <Drawer title={data.name} width={1640} open={open} onClose={onClose}>
            {TableComp}
        </Drawer>
    ) : (
        TableComp
    )
}

export default OutputDetails
