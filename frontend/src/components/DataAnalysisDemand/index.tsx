import { Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import __ from './locale'

const DataAnalysisDemand = () => {
    const navigate = useNavigate()
    return (
        <div>
            <div>{__('需求申请清单')}</div>
            <Button
                type="primary"
                onClick={() => navigate('/dataAnalysis/apply')}
            >
                {__('需求申报')}
            </Button>
        </div>
    )
}

export default DataAnalysisDemand
