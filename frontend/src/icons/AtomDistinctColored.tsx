import Icon from '@ant-design/icons'
import { ReactComponent as AtomColoredIconSvg } from './svg/colored/shujuquzhongsuanzi.svg'
import { ReactComponent as AtomColoredGrayIconSvg } from './svg/colored/shujuquzhongsuanzi_hui.svg'

const AtomDistinctColored = (props: any) => {
    const { colored = false } = props
    return (
        <Icon
            component={colored ? AtomColoredIconSvg : AtomColoredGrayIconSvg}
            {...props}
        />
    )
}

export default AtomDistinctColored
