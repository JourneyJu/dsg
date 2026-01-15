import Icon from '@ant-design/icons'
import { ReactComponent as AtomColoredIconSvg } from './svg/colored/xuanzeliesuanzi.svg'
import { ReactComponent as AtomColoredGrayIconSvg } from './svg/colored/xuanzeliesuanzi_hui.svg'

const AtomSelectColored = (props: any) => {
    const { colored = false } = props
    return (
        <Icon
            component={colored ? AtomColoredIconSvg : AtomColoredGrayIconSvg}
            {...props}
        />
    )
}

export default AtomSelectColored
