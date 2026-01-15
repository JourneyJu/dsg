import { useEffect } from 'react'
import { Edge, Node, Graph, EdgeView, Shape } from '@antv/x6'
import { v4 as uuidv4 } from 'uuid'
import { Drawer, Form, Button, Input, Row, Col } from 'antd'
import __ from '../locale'
import {
    dataModelNameReg,
    modelBusinessNameReg,
    nameEnReg,
    nameReg,
} from '@/utils'
import { RelationConfig } from '../const'
import SelectArea from './SelectArea'
import styles from './styles.module.less'
import { useGraphContentContext } from './GraphContentProvider'

interface ConfigRelationProps {
    open: boolean
    fromNode: Node
    toNode: Node
    edge: Edge
    onConfirm: (relationName: string, edge: Edge) => void
    onCancel: () => void
    graph: Graph | null
}

const ConfigRelation = ({
    open,
    fromNode,
    toNode,
    edge,
    onConfirm,
    onCancel,
    graph,
}: ConfigRelationProps) => {
    const [form] = Form.useForm()

    const { graphInstance, relationData, setRelationData } =
        useGraphContentContext()

    useEffect(() => {
        if (
            fromNode?.data?.modelInfo?.technical_name &&
            toNode?.data?.modelInfo?.technical_name
        ) {
            const name = `${fromNode?.data?.modelInfo?.technical_name}_${toNode?.data?.modelInfo?.technical_name}`
            form.setFieldsValue({
                business_name: name.slice(0, 50),
                technical_name: name.slice(0, 255),
            })
        }
    }, [fromNode, toNode])

    useEffect(() => {
        if (edge.getData()?.relation) {
            form.setFieldsValue({
                business_name: edge.getData()?.relation?.business_name,
                technical_name: edge.getData()?.relation?.technical_name,
                description: edge.getData()?.relation?.description,
                start_end_Model: {
                    startModelId:
                        edge.getData()?.relation?.links[0]?.start_model_id,
                    startFieldId:
                        edge.getData()?.relation?.links[0]?.start_field_id,
                    endModelId:
                        edge.getData()?.relation?.links[0]?.end_model_id,
                    endFieldId:
                        edge.getData()?.relation?.links[0]?.end_field_id,
                },
            })
        }
    }, [edge])

    const validateTechnicalNameRepeat = (value, id?: string) => {
        if (id) {
            const edgeRelations =
                graph?.getEdges().map((item) => item.getData()?.relation) || []
            const relationAllTechnicalName = edgeRelations?.find(
                (item) =>
                    item.technical_name === value.trim() && item.id !== id,
            )
            if (relationAllTechnicalName) {
                return Promise.reject(new Error(__('关联技术名称已存在')))
            }
            return Promise.resolve()
        }
        const relationAllTechnicalName = relationData.find(
            (item) => item.technical_name === value.trim(),
        )
        if (relationAllTechnicalName) {
            return Promise.reject(new Error(__('关联技术名称已存在')))
        }
        return Promise.resolve()
    }

    const FormItemsConfig = {
        business_name: (
            <Form.Item
                name="business_name"
                label={__('关联业务名称')}
                required
                rules={[
                    { required: true, message: __('请输入关联业务名称') },
                    {
                        pattern: modelBusinessNameReg,
                        message: __('仅支持中英文、数字及下划线'),
                    },
                ]}
            >
                <Input placeholder={__('请输入关联业务名称')} maxLength={50} />
            </Form.Item>
        ),
        technical_name: (
            <Form.Item
                name="technical_name"
                label={__('关联技术名称')}
                required
                rules={[
                    { required: true, message: __('请输入关联技术名称') },
                    {
                        pattern: dataModelNameReg,
                        message: __(
                            '仅支持英文、数字及下划线且只能以大小写字母开头',
                        ),
                    },
                    {
                        validator: (rule, value, callback) => {
                            return validateTechnicalNameRepeat(
                                value,
                                edge.getData()?.relation?.id,
                            )
                        },
                    },
                ]}
            >
                <Input placeholder={__('请输入关联技术名称')} maxLength={255} />
            </Form.Item>
        ),
        description: (
            <Form.Item name="description" label={__('描述')}>
                <Input.TextArea
                    placeholder={__('请输入描述')}
                    maxLength={255}
                    style={{ height: 60, resize: 'none' }}
                />
            </Form.Item>
        ),
        start_end_Model: (
            <Form.Item
                name="start_end_Model"
                label={__('起点模型和终点模型')}
                required
                rules={[
                    {
                        validator: (rule, value, callback) => {
                            if (!value.startFieldId) {
                                return Promise.reject(
                                    new Error(__('请选择起点字段')),
                                )
                            }
                            if (!value.endFieldId) {
                                return Promise.reject(
                                    new Error(__('请选择终点字段')),
                                )
                            }
                            return Promise.resolve()
                        },
                    },
                ]}
                initialValue={{
                    startFieldId: '',
                    endFieldId: '',
                    startModelId: fromNode?.data?.modelInfo?.id,
                    endModelId: toNode?.data?.modelInfo?.id,
                }}
            >
                <SelectArea
                    modelList={[
                        {
                            id: fromNode?.data?.modelInfo?.id || '',
                            business_name:
                                fromNode?.data?.modelInfo?.business_name || '',
                            technical_name:
                                fromNode?.data?.modelInfo?.technical_name || '',
                            fields: fromNode?.data?.items || [],
                        },
                        {
                            id: toNode?.data?.modelInfo?.id || '',
                            business_name:
                                toNode?.data?.modelInfo?.business_name || '',
                            technical_name:
                                toNode?.data?.modelInfo?.technical_name || '',
                            fields: toNode?.data?.items || [],
                        },
                    ]}
                />
            </Form.Item>
        ),
    }

    const changeRelationDirection = (values: any) => {
        const targetPortId = edge.getTargetPortId()
        const sourcePortId = edge.getSourcePortId()

        graph?.removeEdge(edge)
        const newEdge = new Shape.Edge({
            source: {
                cell: toNode?.id,
                port: targetPortId,
            },
            target: {
                cell: fromNode?.id,
                port: sourcePortId,
            },
            attrs: {
                line: {
                    stroke: 'rgba(49, 132, 254, 1)',
                    strokeWidth: 0.7,
                },
            },
            zIndex: 0,
        })
        graph?.addEdge(newEdge)
        return newEdge
    }

    /**
     * 格式化关联关系数据
     * @param values
     * @param currentEdge
     * @returns
     */
    const formatRelationData = (values: any, currentEdge: Edge) => {
        return {
            business_name: values.business_name,
            technical_name: values.technical_name,
            description: values.description,
            links: [
                {
                    start_model_id: values.start_end_Model.startModelId,
                    start_field_id: values.start_end_Model.startFieldId,
                    end_model_id: values.start_end_Model.endModelId,
                    end_field_id: values.start_end_Model.endFieldId,
                },
            ],
        }
    }

    /**
     * 更新关联关系数据
     * @param values
     * @param newRelationData
     */
    const updateRelationData = (newRelationData: any) => {
        const newRelationsData = relationData.filter(
            (relation) => relation.edge.id !== newRelationData.edge.id,
        )
        setRelationData([...newRelationsData, newRelationData])
    }

    /**
     * 确定
     * @param values
     */
    const handleFinish = (values: any) => {
        const edgeRelation = edge.getData()?.relation || {}
        const edgeRelationId = edgeRelation?.id || uuidv4()
        if (
            values.start_end_Model.startModelId ===
            fromNode?.data?.modelInfo?.id
        ) {
            graphInstance?.removeEdge(edge)
            const newRelationData = formatRelationData(values, edge)
            edge.setData({
                relation: {
                    ...newRelationData,
                    id: edgeRelationId,
                },
            })
            updateRelationData([
                ...relationData,
                {
                    ...newRelationData,
                    edge,
                    id: edgeRelationId,
                },
            ])
            onConfirm(values.business_name, edge)
        } else {
            const newEdge = changeRelationDirection(values)
            graphInstance?.removeEdge(edge)
            const newRelationData = formatRelationData(values, newEdge)
            newEdge.setData({
                relation: {
                    ...newRelationData,
                    id: edgeRelationId,
                },
            })
            updateRelationData([
                ...relationData,
                {
                    ...newRelationData,
                    id: edgeRelationId,
                    edge: newEdge,
                },
            ])
            onConfirm(values.business_name, newEdge)
        }
    }

    return (
        <Drawer
            title={__('关联关系')}
            open={open}
            onClose={() => {
                if (graph && !edge.getData()?.relation) {
                    graph.removeEdge(edge)
                }
                onCancel()
            }}
            width={560}
            footer={
                <div className={styles['config-relation-footer-wrapper']}>
                    <Button
                        onClick={() => {
                            if (graph && !edge.getData()?.relation) {
                                graph.removeEdge(edge)
                            }
                            onCancel()
                        }}
                        className={styles['footer-btn']}
                    >
                        {__('取消')}
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => {
                            form.submit()
                        }}
                        className={styles['footer-btn']}
                    >
                        {__('确定')}
                    </Button>
                </div>
            }
            maskClosable={false}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                autoComplete="off"
            >
                {RelationConfig.map((item) => (
                    <Row key={item.key}>
                        <Col span={item.span}>{FormItemsConfig[item.key]}</Col>
                    </Row>
                ))}
            </Form>
        </Drawer>
    )
}

export default ConfigRelation
