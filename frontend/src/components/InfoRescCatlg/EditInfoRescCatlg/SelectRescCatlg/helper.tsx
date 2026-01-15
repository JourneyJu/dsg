import { UpOutlined, DownOutlined } from '@ant-design/icons'
import { Typography, Tag, Button } from 'antd'
import { useState, useEffect } from 'react'
import { noop } from 'lodash'
import { IformItem, SearchType } from '@/ui/LightweightSearch/const'
import styles from './styles.module.less'
import __ from './locale'
import { CloseOutlined } from '@/icons'
import { mountTypeOptions } from '@/components/ResourcesDir/const'

export const catlgSourceTypeList = []

export const searchFormData: IformItem[] = [
    {
        label: __('类型'),
        key: 'mount_type',
        options: [
            {
                label: __('不限'),
                value: '',
            },
            ...mountTypeOptions,
        ],
        type: SearchType.Radio,
        initLabel: __('类型不限'),
    },
]

/**
 * 带展开收起的标签组件
 * @param param0
 * @returns
 */
export const SelRescTags = ({
    initValue,
    valueKey,
    minRow = 3,
    maxTextLength = 15,
    onDelete = noop,
}: {
    initValue: Array<any>
    valueKey: string
    minRow?: number
    maxTextLength?: number
    onDelete?: (value: any) => void
}) => {
    const [ellipsis, setEllipsis] = useState<boolean>(false)
    const [visible, setVisible] = useState<boolean>(false) // 是否全部展示
    const { Paragraph, Text } = Typography

    useEffect(() => {
        setVisible(false)
    }, [initValue])

    return (
        <div className={styles.selRescTagTextView}>
            {/* <div
                style={{
                    maxHeight: '132px',
                    overflowY: 'auto',
                    flex: '1',
                }}
            > */}
            {/* <Paragraph
                    ellipsis={
                        visible
                            ? false
                            : {
                                  rows: minRow,
                                  expandable: true,
                                  onEllipsis: (status) => {
                                      setEllipsis(status)
                                  },
                                  symbol: (
                                      <span style={{ visibility: 'hidden' }}>
                                          Expand
                                      </span>
                                  ),
                              }
                    }
                > */}
            {initValue && initValue.length
                ? initValue.map((value, index) => (
                      <Tag
                          className={styles.checkedTag}
                          title={valueKey ? value[valueKey] : value}
                          key={index}
                      >
                          {/* {valueKey
                                      ? value[valueKey].length > maxTextLength
                                          ? `${value[valueKey].slice(
                                                0,
                                                maxTextLength,
                                            )}...`
                                          : value[valueKey]
                                      : value.length > maxTextLength
                                      ? `${value.slice(0, maxTextLength)}...`
                                      : value} */}
                          <div
                              className={styles.tagName}
                              title={value[valueKey]}
                          >
                              {value[valueKey]}
                          </div>
                          {value.is_auto_related ? (
                              <div className={styles.relateTag}>
                                  {__('自动关联')}
                              </div>
                          ) : (
                              <CloseOutlined
                                  className={styles.closeIcon}
                                  style={{
                                      fontSize: 16,
                                  }}
                                  onClick={(e) => {
                                      e.stopPropagation()
                                      e.preventDefault()
                                      onDelete(value)
                                  }}
                              />
                          )}
                      </Tag>
                  ))
                : '--'}
            {/* </Paragraph> */}
            {/* </div> */}
            {/* {ellipsis && (
                <div className={styles.btn}>
                    {visible ? (
                        <Button
                            type="link"
                            onClick={() => {
                                setVisible(false)
                            }}
                            style={{
                                fontSize: '12px',
                            }}
                        >
                            {__('收起')}
                            <UpOutlined />
                        </Button>
                    ) : (
                        <Button
                            type="link"
                            onClick={() => setVisible(true)}
                            style={{
                                visibility: ellipsis ? 'visible' : 'hidden',
                                fontSize: '12px',
                            }}
                        >
                            {__('展开')}
                            <DownOutlined />
                        </Button>
                    )}
                </div>
            )} */}
        </div>
    )
}

export enum SubmitActionType {
    // 暂存
    SAVE = 'save',
    // 提交发布
    SUBMIT = 'submit',
}

// 以下是测试数据
export const delRescCatlgData = [
    {
        id: '151bcb65-48ce-4b62-973f-0bb6685f9cb8',
        name: '组织结构组织结构组织结构组织结构组织结构组织结构组织结构组织结构组织结构',
        is_auto_related: true,
    },
    {
        id: 'ee5b77fc-9b3c-11ef-a661-123822610600',
        name: '长沙ee5b77fc-9b3c-11ef-a661-123822610600ee5b77fc-9b3c-11ef-a661-123822610600',
        is_auto_related: true,
    },
    {
        id: '128b33ba-99a3-11ef-9a89-ce9dc4e1dd39',
        name: '爱数128b33ba-99a3-11ef-9a89-ce9dc4e1dd39128b33ba-99a3-11ef-9a89-ce9dc4e1dd39128b33ba-99a3-11ef-9a89-ce9dc4e1dd39',
    },
    {
        id: '00000000-0000-0000-0000-000000000000',
        name: '未分类00000000-0000-0000-0000-00000000000000000000-0000-0000-0000-000000000000',
    },
    {
        id: '151bcb65-48ce-4b62-973f-0bb6685f9cb8',
        name: '组织结构组织结构组织结构组织结构组织结构组织结构组织结构组织结构组织结构',
    },
    {
        id: 'ee5b77fc-9b3c-11ef-a661-123822610600',
        name: '长沙ee5b77fc-9b3c-11ef-a661-123822610600ee5b77fc-9b3c-11ef-a661-123822610600',
    },
    {
        id: '128b33ba-99a3-11ef-9a89-ce9dc4e1dd39',
        name: '爱数128b33ba-99a3-11ef-9a89-ce9dc4e1dd39128b33ba-99a3-11ef-9a89-ce9dc4e1dd39128b33ba-99a3-11ef-9a89-ce9dc4e1dd39',
    },
    {
        id: '00000000-0000-0000-0000-000000000000',
        name: '未分类00000000-0000-0000-0000-00000000000000000000-0000-0000-0000-000000000000',
    },
    {
        id: '151bcb65-48ce-4b62-973f-0bb6685f9cb8',
        name: '组织结构组织结构组织结构组织结构组织结构组织结构组织结构组织结构组织结构',
    },
    {
        id: 'ee5b77fc-9b3c-11ef-a661-123822610600',
        name: '长沙ee5b77fc-9b3c-11ef-a661-123822610600ee5b77fc-9b3c-11ef-a661-123822610600',
    },
    {
        id: '128b33ba-99a3-11ef-9a89-ce9dc4e1dd39',
        name: '爱数128b33ba-99a3-11ef-9a89-ce9dc4e1dd39128b33ba-99a3-11ef-9a89-ce9dc4e1dd39128b33ba-99a3-11ef-9a89-ce9dc4e1dd39',
    },
    {
        id: '00000000-0000-0000-0000-000000000000',
        name: '未分类00000000-0000-0000-0000-00000000000000000000-0000-0000-0000-000000000000',
    },
]

export const delInfoCatlgData = [
    {
        id: '151bcb65-48ce-4b62-973f-0bb6685f9cb8',
        name: '组织结构',
    },
    {
        id: 'ee5b77fc-9b3c-11ef-a661-123822610600',
        name: '长沙',
    },
    {
        id: '128b33ba-99a3-11ef-9a89-ce9dc4e1dd39',
        name: '爱数',
    },
    {
        id: '00000000-0000-0000-0000-000000000000',
        name: '未分类',
    },
]
