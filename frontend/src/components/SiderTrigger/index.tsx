import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'

interface ISiderTrigger {
    collapsed: boolean
}
const SiderTrigger = ({ collapsed }: ISiderTrigger) => {
    return collapsed ? (
        <MenuUnfoldOutlined style={{ fontSize: 16 }} />
    ) : (
        <MenuFoldOutlined
            style={{
                position: 'absolute',
                fontSize: 16,
                right: '20px',
                top: '16px',
            }}
        />
    )
}

export default SiderTrigger
