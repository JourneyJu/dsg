import { Button, Col, Radio, Row, Space, Table, Tooltip } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import styles from './styles.module.less'
import __ from '../locale'
import { Empty, SearchInput } from '@/ui'
import dataEmpty from '@/assets/dataEmpty.svg'
import { FontIcon } from '@/icons'
import { IconType } from '@/icons/const'
import { getActualUrl, OperateType } from '@/utils'
import AddResult from './AddResult'
import { getDataRescListByOper } from '@/core'
import FieldDetails from '../components/FieldDetails'

interface ResultTableProps {
    data?: any[]
    onChange?: (
        id: string,
        operate: OperateType,
        vals?: Record<string, any> | any[],
    ) => void
    isView?: boolean
}

const ResultTable = ({ data, onChange, isView = false }: ResultTableProps) => {
    const [items, setItems] = useState<any[]>([])
    const [operateItem, setOperateItem] = useState<any>(null)
    const [addResultOpen, setAddResultOpen] = useState<boolean>(false)
    const [searchValue, setSearchValue] = useState<string>('')
    const [fieldDetailsOpen, setFieldDetailsOpen] = useState(false)
    const [fieldsPre, setFieldsPre] = useState<any[]>([])

    useEffect(() => {
        if (data) {
            setItems(
                searchValue
                    ? data.filter((item) =>
                          item.business_name
                              .toLowerCase()
                              .includes(searchValue.toLowerCase()),
                      )
                    : data,
            )
        }
    }, [data, searchValue])

    const handleAddResult = async (result: any[]) => {
        const ids = result.map((item) => item.view_id)
        const res = await getDataRescListByOper({
            filter: {
                ids,
                type: 'data_view',
            },
        })
        const newResult = result.map((item) => {
            const current = res.entries?.find(
                (resItem) => resItem.id === item.view_id,
            )
            return {
                ...item,
                is_catalog: true,
                fields: current?.fields || [],
                description: current?.description || '',
            }
        })
        onChange?.('', OperateType.ADD, newResult)
    }

    const columns = useMemo(() => {
        const viewCols = [
            {
                title: __('数据目录名称（编码）'),
                dataIndex: 'catalog_name',
                key: 'catalog_name',
                render: (text: string, record: any) => {
                    return (
                        <div
                            className={styles['name-container']}
                            key={record.view_id}
                        >
                            <FontIcon
                                name="icon-shujumuluguanli1"
                                type={IconType.COLOREDICON}
                                className={styles['view-icon']}
                            />
                            <div className={styles['name-info']}>
                                <div
                                    className={styles['business-name']}
                                    title={record.catalog_name}
                                >
                                    {record.catalog_name}
                                </div>
                                <div
                                    className={styles['technical-name']}
                                    title={record.catalog_code}
                                >
                                    {record.catalog_code}
                                </div>
                            </div>
                        </div>
                    )
                },
            },
            {
                title: __('挂接数据资源名称（编码）'),
                dataIndex: 'view_busi_name',
                key: 'view_busi_name',
                render: (text: string, record: any) => {
                    return (
                        <div
                            className={styles['name-container']}
                            key={record.view_id}
                        >
                            <FontIcon
                                name="icon-shitusuanzi"
                                type={IconType.COLOREDICON}
                                className={styles['view-icon']}
                            />
                            <div className={styles['name-info']}>
                                <div
                                    className={styles['business-name']}
                                    title={record.view_busi_name}
                                >
                                    {record.view_busi_name}
                                </div>
                                <div
                                    className={styles['technical-name']}
                                    title={record.view_code}
                                >
                                    {record.view_code}
                                </div>
                            </div>
                        </div>
                    )
                },
            },
            {
                title: __('信息项'),
                dataIndex: 'columns',
                key: 'columns',
                render: (text: string, record: any) => {
                    const showFields = record.info_items || record.fields || []
                    const firstColumnName = showFields[0]?.name_cn
                    const columnsLen = showFields.length
                    return (
                        <div className={styles['column-list']}>
                            <div className={styles['column-item']}>
                                {firstColumnName}
                            </div>
                            {columnsLen > 1 && (
                                <div
                                    className={styles['column-more']}
                                    onClick={() => {
                                        setFieldDetailsOpen(true)
                                        setFieldsPre(showFields)
                                    }}
                                >
                                    +{columnsLen - 1}
                                </div>
                            )}
                        </div>
                    )
                },
            },
            {
                title: __('操作'),
                dataIndex: 'operation',
                key: 'operation',
                render: (text: string, record: any, index: number) => (
                    <Space size={16}>
                        <Button
                            type="link"
                            onClick={() => {
                                window.open(
                                    getActualUrl(
                                        `/dataService/dirContent?catlgId=${record.catalog_id}&name=${record.catalog_name}`,
                                    ),
                                    '_blank',
                                )
                            }}
                        >
                            {__('查看目录')}
                        </Button>
                        {record.data_push_id && (
                            <Button
                                type="link"
                                onClick={() => {
                                    window.open(
                                        getActualUrl(
                                            `/dataPush/manage?operate=detail&dataPushId=${record.data_push_id}`,
                                        ),
                                        '_blank',
                                    )
                                }}
                            >
                                {__('查看推送任务')}
                            </Button>
                        )}
                    </Space>
                ),
            },
        ]
        // catalog_id 存在 说明为已编目  否则为未编目的情况
        return data?.[0]?.catalog_id && isView
            ? viewCols
            : [
                  {
                      title: isView ? __('融合表名称') : __('数据资源名称'),
                      dataIndex: 'business_name',
                      key: 'business_name',
                      render: (text: string, record: any) => {
                          return (
                              <div
                                  className={styles['name-container']}
                                  key={record.view_id}
                              >
                                  <FontIcon
                                      name="icon-shitusuanzi"
                                      type={IconType.COLOREDICON}
                                      className={styles['view-icon']}
                                  />
                                  <div className={styles['name-info']}>
                                      <div
                                          className={styles['business-name']}
                                          title={record.business_name}
                                      >
                                          {record.business_name}
                                      </div>
                                      <div
                                          className={styles['technical-name']}
                                          title={record.technical_name}
                                      >
                                          {record.technical_name}
                                      </div>
                                  </div>
                              </div>
                          )
                      },
                  },
                  {
                      title: __('表字段'),
                      dataIndex: 'fields',
                      key: 'fields',
                      render: (fields: any[], record: any) => {
                          if (!fields || fields?.length === 0) {
                              return '--'
                          }
                          const firstColumnName = fields[0].business_name
                          const columnsLen = fields.length
                          return (
                              <div className={styles['column-list']}>
                                  <div className={styles['column-item']}>
                                      {firstColumnName}
                                  </div>
                                  {columnsLen > 1 && (
                                      <Tooltip
                                          color="#fff"
                                          getPopupContainer={(node) =>
                                              node.parentNode as HTMLElement
                                          }
                                          title={
                                              <Row
                                                  gutter={8}
                                                  className={
                                                      styles[
                                                          'column-list-tooltip'
                                                      ]
                                                  }
                                              >
                                                  {fields.map((column) => {
                                                      return (
                                                          <Col
                                                              span={11}
                                                              className={
                                                                  styles[
                                                                      'column-item'
                                                                  ]
                                                              }
                                                              title={
                                                                  column.business_name
                                                              }
                                                          >
                                                              {
                                                                  column.business_name
                                                              }
                                                          </Col>
                                                      )
                                                  })}
                                              </Row>
                                          }
                                      >
                                          <div
                                              className={styles['column-more']}
                                          >
                                              +{columnsLen - 1}
                                          </div>
                                      </Tooltip>
                                  )}
                              </div>
                          )
                      },
                  },
                  {
                      title: __('所属数据源'),
                      dataIndex: 'datasource_name',
                      key: 'datasource_name',
                  },
                  {
                      title: __('描述'),
                      dataIndex: 'description',
                      key: 'description',
                      render: (text: string, record: any) => text || '--',
                  },
                  {
                      title: __('需要编目'),
                      dataIndex: 'is_catalog',
                      key: 'is_catalog',
                      render: (isCatalog: boolean, record: any) => {
                          return isView ? (
                              isCatalog ? (
                                  __('是')
                              ) : (
                                  __('否')
                              )
                          ) : (
                              <Radio.Group
                                  value={isCatalog}
                                  onChange={(e) =>
                                      onChange?.(
                                          record.view_id,
                                          OperateType.EDIT,
                                          {
                                              is_catalog: e.target.value,
                                          },
                                      )
                                  }
                              >
                                  <Radio value>{__('是')}</Radio>
                                  <Radio value={false}>{__('否')}</Radio>
                              </Radio.Group>
                          )
                      },
                  },
                  {
                      title: __('操作'),
                      dataIndex: 'operation',
                      key: 'operation',
                      render: (text: string, record: any) => (
                          <Space size={16}>
                              <Button
                                  type="link"
                                  onClick={() => {
                                      const url = `/datasheet-view/detail?id=${record.view_id}&model=view`
                                      window.open(getActualUrl(url))
                                  }}
                              >
                                  {__('详情')}
                              </Button>
                              {!isView && (
                                  <Button
                                      type="link"
                                      onClick={() =>
                                          onChange?.(
                                              record.view_id,
                                              OperateType.DELETE,
                                          )
                                      }
                                  >
                                      {__('移除')}
                                  </Button>
                              )}
                          </Space>
                      ),
                  },
              ]
    }, [isView, data])

    return (
        <div className={styles['result-table']}>
            {(items.length > 0 || (items.length === 0 && searchValue)) && (
                <div className={styles['result-table-header']}>
                    {isView ? (
                        <div />
                    ) : (
                        <Space size={20}>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setAddResultOpen(true)}
                            >
                                {__('添加分析成果')}
                            </Button>
                        </Space>
                    )}
                    <SearchInput
                        placeholder={__('搜索数据资源名称')}
                        style={{ width: 280 }}
                        onKeyChange={(e) => setSearchValue(e)}
                    />
                </div>
            )}
            {items.length > 0 || (items.length === 0 && searchValue) ? (
                <Table
                    columns={columns}
                    dataSource={items}
                    pagination={{ hideOnSinglePage: true }}
                    rowKey="view_id"
                    locale={{ emptyText: <Empty /> }}
                />
            ) : isView ? (
                <Empty desc={__('暂无数据')} iconSrc={dataEmpty} />
            ) : (
                <div>
                    <Empty
                        iconSrc={dataEmpty}
                        desc={__('暂无数据，您可以进行以下操作')}
                        // btnText={__('添加分析成果')}
                        // onAdd={() => setAddResultOpen(true)}
                    />
                    <Space size={12} className={styles['operate-container']}>
                        <Button
                            type="primary"
                            onClick={() => setAddResultOpen(true)}
                            icon={<PlusOutlined />}
                        >
                            {__('添加分析成果')}
                        </Button>
                        <Button
                            icon={<PlusOutlined />}
                            onClick={() => {
                                window.open(
                                    getActualUrl('/tenantApply/list'),
                                    '_blank',
                                )
                            }}
                        >
                            {__('租户申请')}
                            <Tooltip
                                color="#fff"
                                getPopupContainer={(node) =>
                                    node.parentNode as HTMLElement
                                }
                                title={
                                    <div
                                        className={
                                            styles['tenant-apply-tooltip']
                                        }
                                    >
                                        {__(
                                            '如需要开通数据加工平台的账号权限，则需发起租户申请',
                                        )}
                                    </div>
                                }
                            >
                                <QuestionCircleOutlined
                                    className={styles['tenant-apply-icon']}
                                />
                            </Tooltip>
                        </Button>
                    </Space>
                </div>
            )}
            {addResultOpen && (
                <AddResult
                    open={addResultOpen}
                    onClose={() => setAddResultOpen(false)}
                    onOk={handleAddResult}
                    initData={items}
                />
            )}
            {fieldDetailsOpen && (
                <FieldDetails
                    fields={fieldsPre}
                    open={fieldDetailsOpen}
                    onClose={() => {
                        setFieldDetailsOpen(false)
                        setFieldsPre([])
                    }}
                />
            )}
        </div>
    )
}

export default ResultTable
