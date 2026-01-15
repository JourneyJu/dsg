import { Drawer, Table } from 'antd'
import __ from '../locale'

interface FieldDetailsProps {
    fields: any[]
    open: boolean
    onClose: () => void
}
const FieldDetails = ({ fields, open, onClose }: FieldDetailsProps) => {
    const columns = [
        {
            title: __('序号'),
            dataIndex: 'order',
            key: 'order',
            width: 118,
            render: (_, record, index: number) => index + 1,
        },
        {
            title: __('名称'),
            dataIndex: 'name_cn',
            key: 'name_cn',
            ellipsis: true,
        },
    ]
    return (
        <Drawer title={__('表字段')} width={433} open={open} onClose={onClose}>
            <Table columns={columns} dataSource={fields} pagination={false} />
        </Drawer>
    )
}

export default FieldDetails
