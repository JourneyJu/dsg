import Icon from '@ant-design/icons'
import { ReactComponent as FormIconSvg } from './svg/colored/shitusuanzi.svg'
import { ReactComponent as FormIconGraySvg } from './svg/colored/shitusuanzi_hui.svg'

const AtomFormColored = (props: any) => {
    const { colored = false } = props
    return (
        <Icon component={colored ? FormIconSvg : FormIconGraySvg} {...props} />
    )
}

export default AtomFormColored
