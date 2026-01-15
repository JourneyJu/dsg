import { Drawer, Table } from 'antd'
import __ from '../locale'

interface IpDetailsProps {
    open: boolean
    onClose: () => void
    dataSource: { ip: string; port: string }[]
}

const IpDetails = ({ open, onClose, dataSource }: IpDetailsProps) => {
    const columns = [
        {
            title: __('序号'),
            dataIndex: 'index',
            render: (text, record, index) => index + 1,
        },
        {
            title: 'IP',
            dataIndex: 'ip',
            ellipsis: true,
        },
        {
            title: __('端口'),
            dataIndex: 'port',
            ellipsis: true,
        },
    ]
    return (
        <Drawer
            width={400}
            open={open}
            onClose={onClose}
            title={__('IP及端口')}
        >
            <Table
                columns={columns}
                dataSource={dataSource}
                pagination={false}
            />
        </Drawer>
    )
}

export default IpDetails
