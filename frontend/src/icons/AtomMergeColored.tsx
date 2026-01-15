import Icon from '@ant-design/icons'
import { ReactComponent as AtomColoredIconSvg } from './svg/colored/shujuhebingsuanzi.svg'
import { ReactComponent as AtomColoredGrayIconSvg } from './svg/colored/shujuhebingsuanzi_hui.svg'

const AtomMergeColored = (props: any) => {
    const { colored = false } = props
    return (
        <Icon
            component={colored ? AtomColoredIconSvg : AtomColoredGrayIconSvg}
            {...props}
        />
    )
}

export default AtomMergeColored
