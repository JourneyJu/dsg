import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Graph } from '@antv/x6'
import { Tabs, Row, Col, Divider } from 'antd'
import { LeftOutlined } from '@ant-design/icons'
import ProjectTask from '../ProjectTask'
import { getProjectDetails, IProjectDetails, LoginPlatform } from '@/core'
import TaskCenterGraph from '../TaskCenterGraph'
import GraphToolBar from '../TaskCenterGraph/GraphToolBar'
import styles from './styles.module.less'
import ProjectIconOutlined from '@/icons/ProjectIconOutlined'
import {
    useQuery,
    getActualUrl,
    getOssResourceUrl,
    getPlatformNumber,
} from '@/utils'
import GlobalMenu from '../GlobalMenu'
import __ from './locale'

const ProjectContent = () => {
    const navigator = useNavigate()
    const query = useQuery()
    const { id } = useParams()
    const [details, setDetails] = useState<IProjectDetails>()
    const [tabKey, setTabKey] = useState('1')
    const [grapInstance, setGrapInstance] = useState<Graph>()
    const [graphSizeValue, setGraphSizeValue] = useState<number>(100)
    const [isloadError, setIsLoadError] = useState(false)
    const platform = getPlatformNumber()

    const [imageUrl, setImageUrl] = useState('')

    const getImage = async (imageId: string) => {
        const url = await getOssResourceUrl(imageId)
        setImageUrl(url)
    }

    // 回退到此页时，具体到哪个tab
    useEffect(() => {
        const params = query.get('params')
        if (params) {
            const paramsArr = params.split('|')
            setTabKey(paramsArr[0])
        }
    }, [])

    /**
     *设置画布实例
     * @param graphCase
     */
    const setGraphCase = (graphCase: Graph) => {
        setGrapInstance(graphCase)
    }

    /**
     * 获取画布实例
     */

    const getGraphCase = () => {
        return grapInstance
    }

    /**
     *画布大小变更
     * @param graphCase
     */
    const handleChangeGraphSize = (graphSize: number) => {
        setGraphSizeValue(graphSize)
    }
    const items = [
        {
            label: __('工作流程看板'),
            key: '1',
            children: (
                <TaskCenterGraph
                    onSetGraphCase={setGraphCase}
                    onGetGraphSize={handleChangeGraphSize}
                />
            ),
        },
        {
            label: __('工单/任务看板'),
            key: '2',
            children: <ProjectTask projectDetails={details} />,
        },
    ]

    const handleClick = () => {
        const backUrl = query.get('backUrl')
        if (backUrl) {
            navigator(backUrl)
        } else if (platform === LoginPlatform.drmb) {
            navigator(`/projectInfo`)
        } else {
            navigator(`/taskCenter/project`)
        }
    }

    // 获取项目详情
    const getDetails = async () => {
        if (!id) return
        const res = await getProjectDetails(id)
        setDetails(res)
        getImage(res.image)
    }

    useEffect(() => {
        getDetails()
    }, [id])

    return (
        <div className={styles.projectContentWrapper}>
            <Row>
                <Col span={10}>
                    <div className={styles.titleWrapper}>
                        <div className={styles.returnWrapper}>
                            <GlobalMenu />
                            <div onClick={handleClick}>
                                <LeftOutlined className={styles.returnArrow} />
                                <span className={styles.returnText}>
                                    {__('返回')}
                                </span>
                                <Divider
                                    className={styles.divider}
                                    type="vertical"
                                />
                            </div>
                            {details?.image && imageUrl && !isloadError ? (
                                <img
                                    // src={`/api/task-center/v1/oss/${details?.image}`}
                                    src={imageUrl}
                                    alt="project"
                                    width={48}
                                    height={48}
                                    className={styles.projectCover}
                                    onErrorCapture={() => setIsLoadError(true)}
                                />
                            ) : (
                                <div className={styles.emptyWrapper}>
                                    <ProjectIconOutlined
                                        style={{ fontSize: 18 }}
                                    />
                                </div>
                            )}
                        </div>
                        <div
                            className={styles.projectName}
                            title={details?.name}
                        >
                            {details?.name}
                        </div>
                    </div>
                </Col>
                <Col span={4}>
                    {tabKey === '1' ? (
                        <div className={styles.graphBar}>
                            <GraphToolBar
                                getGrapInstance={getGraphCase}
                                graphSizeValue={graphSizeValue}
                            />
                        </div>
                    ) : null}
                </Col>
                <Col span={10} />
            </Row>

            <Tabs
                items={items}
                activeKey={tabKey}
                onChange={(activeKey) => {
                    setTabKey(activeKey)
                }}
                destroyInactiveTabPane
            />
        </div>
    )
}

export default ProjectContent
