import Icon from '@ant-design/icons'
import { ReactComponent as AtomColoredIconSvg } from './svg/colored/shuchushitu.svg'
import { ReactComponent as AtomColoredGrayIconSvg } from './svg/colored/shuchushituhui.svg'

const AtomOutputColored = (props: any) => {
    const { colored = false } = props
    return (
        <Icon
            component={colored ? AtomColoredIconSvg : AtomColoredGrayIconSvg}
            {...props}
        />
    )
}

export default AtomOutputColored
