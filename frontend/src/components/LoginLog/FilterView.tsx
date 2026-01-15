import React, { useRef, useState } from 'react'
import { Button, DatePicker, Form, Radio, Select, Space } from 'antd'
import { EventEmitter } from 'ahooks/lib/useEventEmitter'
import moment from 'moment'
import { keys, omit } from 'lodash'
import styles from './styles.module.less'
import __ from './locale'
import DepartmentMutiSelected from '../AuditLog/DepartmentMutiSelected'
import { logOption } from './helper'
import UserSelect from '../AuditLog/UserSelected'

const { RangePicker } = DatePicker

interface IFilterView {
    condition$: EventEmitter<any>
}

/**
 * 日志筛选条件
 */
const FilterView: React.FC<IFilterView> = ({ condition$ }) => {
    const [form] = Form.useForm()
    const ownersRef = useRef<any>(null)
    const departmentsRef = useRef<any>(null)

    const [opSearchValue, setOpSearchValue] = useState<string>('')

    // 重置
    const handleReset = () => {
        form.resetFields()
        form.scrollToField('level')
    }

    // 查询
    const handleSearch = () => {
        try {
            form.validateFields()
            const values = form.getFieldsValue()
            const { time, time_range, levels, operator_names } = values
            let timeRange: any = {
                start: moment(Date.now()).startOf('day').unix() * 1000,
                end: moment(Date.now()).endOf('day').unix() * 1000,
            }
            switch (time) {
                case 1:
                    timeRange = {
                        ...timeRange,
                        start: moment(Date.now()).startOf('day').unix() * 1000,
                    }
                    break
                case 2:
                    timeRange = {
                        ...timeRange,
                        start: moment(Date.now()).startOf('week').unix() * 1000,
                    }
                    break
                case 3:
                    timeRange = {
                        ...timeRange,
                        start:
                            moment(Date.now()).startOf('month').unix() * 1000,
                    }
                    break
                case 4:
                    timeRange = {
                        start: time_range[0].startOf('day').unix() * 1000,
                        end: time_range[1].endOf('day').unix() * 1000,
                    }
                    break
                default:
                    timeRange = undefined
                    break
            }
            const allValues = {
                ...omit(values, 'time', 'time_range'),
                operator_names: ownersRef?.current?.selectedData,
                operator_departments:
                    departmentsRef?.current?.selectedData?.map((dp) => {
                        if (dp === '未分类') {
                            return '00000000-0000-0000-0000-000000000000'
                        }
                        return dp
                    }),
            }
            const params = {}
            keys(allValues).forEach((k) => {
                if (allValues[k] && allValues[k].length > 0) {
                    params[k] = allValues[k]
                }
            })
            condition$.emit({
                ...params,
                time_range: timeRange,
            })
        } catch (e) {
            // console.log(e)
        }
    }

    // 时间选项
    const timeOptions = [
        { value: 0, label: __('全部') },
        { value: 1, label: __('今天') },
        { value: 2, label: __('本周') },
        { value: 3, label: __('本月') },
        { value: 4, label: __('自定义') },
    ]

    return (
        <div className={styles.logFilter}>
            <div className={styles['logFilter-top']}>
                <span>{__('筛选条件')}</span>
                <Space size={8}>
                    <Button onClick={() => handleReset()}> {__('重置')}</Button>
                    <Button onClick={() => handleSearch()}>{__('查询')}</Button>
                </Space>
            </div>
            <div className={styles['logFilter-content']}>
                <Form
                    form={form}
                    layout="vertical"
                    autoComplete="off"
                    initialValues={{ levels: 0, time: 0 }}
                >
                    <Form.Item label={__('用户名')} name="operator_names">
                        <UserSelect ref={ownersRef} />
                    </Form.Item>
                    <Form.Item
                        label={__('所属部门')}
                        name="operator_departments"
                    >
                        <DepartmentMutiSelected ref={departmentsRef} />
                    </Form.Item>
                    <Form.Item label={__('操作类型')} name="operations">
                        <Select
                            mode="multiple"
                            placeholder={__('请选择操作类型')}
                            showArrow
                            allowClear
                            optionFilterProp="label"
                            filterOption={(input, option) =>
                                (option?.label as string)
                                    ?.toLowerCase()
                                    .includes(input.trim().toLowerCase())
                            }
                            searchValue={opSearchValue}
                            onSearch={(val) => setOpSearchValue(val)}
                            onDropdownVisibleChange={(open) => {
                                if (!open) {
                                    setOpSearchValue('')
                                }
                            }}
                            options={logOption}
                            getPopupContainer={(n) => n.parentElement || n}
                            className={styles.optionWrap}
                            notFoundContent={
                                <span>{__('抱歉，没有找到相关内容')}</span>
                            }
                        />
                    </Form.Item>
                    <Form.Item label={__('描述')} name="descriptions">
                        <Select
                            mode="tags"
                            placeholder={__('请输入描述')}
                            allowClear
                            getPopupContainer={(n) => n.parentElement || n}
                            notFoundContent={null}
                            open={false}
                        />
                    </Form.Item>
                    <Form.Item label={__('IP')} name="operator_agent_ips">
                        <Select
                            mode="tags"
                            placeholder={__('请输入IP')}
                            allowClear
                            getPopupContainer={(n) => n.parentElement || n}
                            notFoundContent={null}
                            open={false}
                        />
                    </Form.Item>
                    {/* <Form.Item label={__('详情')} name="details">
                        <Select
                            mode="tags"
                            placeholder={__('请输入详情')}
                            allowClear
                            getPopupContainer={(n) => n.parentElement || n}
                            notFoundContent={null}
                            open={false}
                        />
                    </Form.Item> */}
                    <Form.Item
                        label={__('操作时间')}
                        name="time"
                        style={{ marginBottom: 0 }}
                    >
                        <Radio.Group>
                            <div className={styles.radioWrap}>
                                {timeOptions.map((item) => (
                                    <Radio
                                        value={item.value}
                                        key={item.value}
                                        className={styles.radio}
                                    >
                                        {item.label}
                                    </Radio>
                                ))}
                            </div>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item
                        noStyle
                        shouldUpdate={(pre, cur) => pre.time !== cur.time}
                    >
                        {({ getFieldValue, setFields }) => {
                            const timeOption = getFieldValue('time')
                            if (timeOption !== 4) {
                                setFields([{ name: 'time_range', errors: [] }])
                            }
                            return (
                                <Form.Item
                                    name="time_range"
                                    rules={[
                                        {
                                            required: timeOption === 4,
                                            message: __('请选择时间范围'),
                                        },
                                    ]}
                                >
                                    <RangePicker
                                        style={{ width: '100%' }}
                                        allowClear={false}
                                        inputReadOnly
                                        disabled={timeOption !== 4}
                                        disabledDate={(current) => {
                                            return (
                                                current > moment().endOf('day')
                                            )
                                        }}
                                        placeholder={[
                                            __('开始日期'),
                                            __('结束日期'),
                                        ]}
                                    />
                                </Form.Item>
                            )
                        }}
                    </Form.Item>
                </Form>
            </div>
        </div>
    )
}

export default FilterView
