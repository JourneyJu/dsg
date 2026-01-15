import Icon from '@ant-design/icons'
import { ReactComponent as AtomColoredIconSvg } from './svg/colored/shujuguanliansuanzi.svg'
import { ReactComponent as AtomColoredGrayIconSvg } from './svg/colored/shujuguanliansuanzi_hui.svg'

const AtomJoinColored = (props: any) => {
    const { colored = false } = props
    return (
        <Icon
            component={colored ? AtomColoredIconSvg : AtomColoredGrayIconSvg}
            {...props}
        />
    )
}

export default AtomJoinColored
