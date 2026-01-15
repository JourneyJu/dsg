import Icon from '@ant-design/icons'
import { ReactComponent as AtomColoredIconSvg } from './svg/colored/SQLsuanzi.svg'
import { ReactComponent as AtomColoredGrayIconSvg } from './svg/colored/SQLsuanzi_hui.svg'

const AtomSQLColored = (props: any) => {
    const { colored = false } = props
    return (
        <Icon
            component={colored ? AtomColoredIconSvg : AtomColoredGrayIconSvg}
            {...props}
        />
    )
}

export default AtomSQLColored
