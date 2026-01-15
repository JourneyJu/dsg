import Icon from '@ant-design/icons'
import { ReactComponent as AtomColoredIconSvg } from './svg/colored/shujuguolvsuanzi.svg'
import { ReactComponent as AtomColoredGrayIconSvg } from './svg/colored/shujuguolvsuanzi_hui.svg'

const AtomWhereColored = (props: any) => {
    const { colored = false } = props
    return (
        <Icon
            component={colored ? AtomColoredIconSvg : AtomColoredGrayIconSvg}
            {...props}
        />
    )
}

export default AtomWhereColored
