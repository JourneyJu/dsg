import { pick } from 'lodash'
import { Table } from 'antd'
import { PolicyActionEnum, SortDirection, SortType } from '@/core'
import __ from './locale'
import styles from './styles.module.less'

/**
 * 审计日志类型
 */
export enum AuditLogType {
    // 管理日志
    ManagementLog = 'Management',
    // 操作日志
    OperationLog = 'Operation',
}

/**
 * 日志级别
 */
export enum LogLevel {
    // 信息
    INFO = 'Info',
    // 警告
    WARN = 'Warn',
}

/**
 * 日志分类 tab
 */
export const tabItems = [
    {
        label: __('管理日志'),
        key: AuditLogType.ManagementLog,
        children: '',
    },
    {
        label: __('操作日志'),
        key: AuditLogType.OperationLog,
        children: '',
    },
]

/**
 * 排序菜单
 */
export const menus = [
    {
        sort: SortDirection.DESC,
        key: 'timestamp',
        label: __('按操作时间排序'),
    },
]

const ActionText = {
    [PolicyActionEnum.View]: __('查看'),
    [PolicyActionEnum.Read]: __('读取'),
    [PolicyActionEnum.Download]: __('下载'),
}

/**
 * 详情信息字段映射
 */
export const fieldsMap = (cs: boolean) => ({
    id: { label: __('唯一标识') },
    api: { label: __('唯一标识') },
    name: { label: __('名称') },
    business_name: { label: __('业务名称') },
    technical_name: { label: __('技术名称') },
    subject_path: { label: __('所属主题') },
    subject_domain_name_path: { label: __('所属主题') },
    department_path: { label: __('所属部门') },
    department_name_path: { label: __('所属部门') },
    subject_domain_path: { label: __('所属业务领域') },
    business_process_name: {
        label: cs ? __('关联主干业务') : __('关联业务流程'),
    },
    owner_name: { label: __('数据Owner') },
    form_view_id: { label: cs ? __('库表唯一标识') : __('逻辑视图唯一标识') },
    logic_view_id: { label: cs ? __('库表唯一标识') : __('逻辑视图唯一标识') },
    download_task_id: { label: __('下载唯一标识') },
    data_source_id: { label: __('数据源唯一标识') },
    logic_view_name: { label: __('名称') },
    logic_view_policies: {
        label: __('权限'),
        render: (data: any) =>
            data.map((item: any) => (
                <div className={styles.logPolicy}>
                    <span
                        className={styles.logPolicy_name}
                        title={item?.subject?.name}
                    >
                        {item?.subject?.name}
                    </span>
                    ：
                    <span className={styles.logPolicy_action}>
                        {item?.actions?.map((v) => ActionText[v]).join('/')}
                    </span>
                </div>
            )),
    },
    sub_view_policies: {
        label: __('行/列规则权限'),
        render: (data: any) =>
            data.map((item: any) => (
                <>
                    <div className={styles.sub_view_name}>
                        {item?.object?.name}
                    </div>
                    {item.subject_policies?.map((it: any) => (
                        <div className={styles.logPolicy}>
                            <span
                                className={styles.logPolicy_name}
                                title={it?.subject?.name}
                            >
                                {it?.subject?.name}
                            </span>
                            ：
                            <span className={styles.logPolicy_action}>
                                {it?.actions
                                    ?.map((v) => ActionText[v])
                                    .join('/')}
                            </span>
                        </div>
                    ))}
                </>
            )),
    },
    policies: {
        label: __('权限'),
        render: (data: any) =>
            data.map((item: any) => (
                <div className={styles.logPolicy}>
                    <span
                        className={styles.logPolicy_name}
                        title={item?.subject?.name}
                    >
                        {item?.subject?.name}
                    </span>
                    ：
                    <span className={styles.logPolicy_action}>
                        {item?.actions?.map((v) => ActionText[v]).join('/')}
                    </span>
                </div>
            )),
    },
})

/**
 * 日志类型名称映射
 */
export const namesMap = (cs: boolean) => [
    {
        keys: [
            'create_business_domain_group',
            'update_business_domain_group',
            'delete_business_domain_group',
        ],
        label: __('业务领域分组'),
    },
    {
        keys: [
            'create_business_domain',
            'update_business_domain',
            'delete_business_domain',
        ],
        label: __('业务领域'),
    },
    {
        keys: [
            'create_business_process',
            'update_business_process',
            'delete_business_process',
        ],
        label: cs ? __('主干业务') : __('业务流程'),
    },
    {
        keys: [
            'create_business_model',
            'update_business_model',
            'delete_business_model',
        ],
        label: __('业务模型'),
    },
    {
        keys: [
            'create_business_form',
            'update_business_form',
            'update_business_form_content',
            'delete_business_form',
        ],
        label: __('业务表'),
    },
    {
        keys: [
            'create_data_form',
            'update_data_form',
            'update_data_form_content',
            'delete_data_form',
        ],
        label: __('数据表'),
    },
    {
        keys: [
            'create_data_indicator',
            'update_data_indicator',
            'delete_data_indicator',
        ],
        label: __('数据指标'),
    },
    {
        keys: [
            'create_business_flowcharts',
            'update_business_flowcharts',
            'update_business_flowcharts_content',
            'export_business_flowcharts',
            'delete_business_flowcharts',
        ],
        label: __('流程图'),
    },
    {
        keys: [
            'create_business_indicator',
            'update_business_indicator',
            'delete_business_indicator',
        ],
        label: __('业务指标'),
    },
    {
        keys: [
            'create_subject_domain_group',
            'update_subject_domain_group',
            'delete_subject_domain_group',
        ],
        label: __('主题域分组'),
    },
    {
        keys: [
            'create_subject_domain',
            'update_subject_domain',
            'delete_subject_domain',
        ],
        label: __('主题域'),
    },
    {
        keys: [
            'create_business_object',
            'update_business_object',
            'update_business_object_content',
            'delete_business_object',
        ],
        label: __('业务对象'),
    },
    {
        keys: [
            'create_business_activity',
            'update_business_activity',
            'update_business_activity_content',
            'delete_business_activity',
        ],
        label: __('业务活动'),
    },
    {
        keys: [
            'create_dataelement_api',
            'update_dataelement_api',
            'batch_delete_dataelement_api',
        ],
        label: __('数据元'),
    },
    {
        keys: ['create_dict_api', 'update_dict_api', 'batch_delete_dict_api'],
        label: __('码表'),
    },
    {
        keys: ['create_rule_api', 'update_rule_api', 'batch_delete_rule_api'],
        label: __('编码规则'),
    },
    {
        keys: [
            'std_create_file_api',
            'std_update_file_api',
            'batch_std_delete_file_api',
        ],
        label: __('标准文件'),
    },
    {
        keys: [
            'create_logic_view',
            'update_logic_view',
            'delete_logic_view',
            'online_logic_view',
            'offline_logic_view',
            'publish_logic_view',
            'create_data_download_task',
            'delete_data_download_task',
            'data_download',
            'data_preview',
            'request_data_view_authorization',
            'authorize_data_view',
        ],
        label: cs ? __('库表') : __('逻辑视图'),
    },
    {
        keys: [
            'create_dimension_model',
            'update_dimension_model_basic_info',
            'update_dimension_model_config_info',
            'delete_dimension_model',
        ],
        label: __('维度模型'),
    },
    {
        keys: [
            'create_indicator',
            'update_indicator',
            'delete_indicator',
            'query_indicator',
            'request_indicator_authorization',
            'authorize_indicator',
        ],
        label: __('指标'),
    },
    {
        keys: [
            'generate_api',
            'register_api',
            'update_api',
            'public_api',
            'delete_api',
            'request_api_authorization',
            'authorize_api',
            'up_api',
            'down_api',
        ],
        label: __('接口'),
    },
]

/**
 * 日志相关操作
 */
export const logOption = (cs: boolean) => ({
    [AuditLogType.ManagementLog]: {
        options: [
            {
                label: cs ? __('库表') : __('逻辑视图'),
                options: [
                    {
                        value: 'scan_data_source',
                        label: __('扫描数据源'),
                        detailsList: ['data_source_id'],
                    },
                    {
                        value: 'create_logic_view',
                        label: __('新建逻辑视图'),
                        detailsList: [
                            'form_view_id',
                            'business_name',
                            'technical_name',
                            'subject_path',
                            'department_path',
                            'owner_name',
                        ],
                    },
                    {
                        value: 'update_logic_view',
                        label: cs ? __('修改库表') : __('修改逻辑视图'),
                        detailsList: [
                            'form_view_id',
                            'business_name',
                            'technical_name',
                            'subject_path',
                            'department_path',
                            'owner_name',
                        ],
                    },
                    {
                        value: 'delete_logic_view',
                        label: cs ? __('删除库表') : __('删除逻辑视图'),
                        detailsList: ['form_view_id'],
                    },
                    {
                        value: 'publish_logic_view',
                        label: cs ? __('发布库表') : __('发布逻辑视图'),
                        detailsList: ['form_view_id'],
                    },
                    {
                        value: 'online_logic_view',
                        label: __('上线库表'),
                        detailsList: ['form_view_id'],
                    },
                    {
                        value: 'offline_logic_view',
                        label: __('下线库表'),
                        detailsList: ['form_view_id'],
                    },
                ].filter(
                    (item) =>
                        !cs ||
                        ![
                            'create_logic_view',
                            'online_logic_view',
                            'offline_logic_view',
                        ].includes(item.value),
                ),
            },
            {
                label: __('维度模型'),
                options: [
                    {
                        value: 'create_dimension_model',
                        label: __('新建维度模型'),
                        detailsList: ['id', 'name'],
                    },
                    {
                        value: 'update_dimension_model_basic_info',
                        label: __('修改维度模型基本信息'),
                        detailsList: ['id', 'name'],
                    },
                    {
                        value: 'update_dimension_model_config_info',
                        label: __('修改维度模型配置信息'),
                        detailsList: ['id'],
                    },
                    {
                        value: 'delete_dimension_model',
                        label: __('删除维度模型'),
                        detailsList: ['id'],
                    },
                ],
            },
            {
                label: __('指标'),
                options: [
                    {
                        value: 'create_indicator',
                        label: __('新建指标'),
                        detailsList: [
                            'id',
                            'name',
                            'subject_path',
                            'department_name_path',
                            'subject_domain_name_path',
                            'owner_name',
                        ],
                    },
                    {
                        value: 'update_indicator',
                        label: __('修改指标'),
                        detailsList: [
                            'id',
                            'name',
                            'subject_path',
                            'department_name_path',
                            'subject_domain_name_path',
                            'owner_name',
                        ],
                    },
                    {
                        value: 'delete_indicator',
                        label: __('删除指标'),
                        detailsList: ['id'],
                    },
                ],
            },
            {
                label: __('接口'),
                options: [
                    {
                        value: 'generate_api',
                        label: __('生成接口'),
                        detailsList: [
                            'id',
                            'name',
                            'subject_path',
                            'department_path',
                            'owner_name',
                        ],
                    },
                    {
                        value: 'register_api',
                        label: __('注册接口'),
                        detailsList: [
                            'id',
                            'name',
                            'subject_path',
                            'department_path',
                            'owner_name',
                        ],
                    },
                    {
                        value: 'update_api',
                        label: __('修改接口'),
                        detailsList: [
                            'id',
                            'name',
                            'subject_path',
                            'department_path',
                            'owner_name',
                        ],
                    },
                    {
                        value: 'delete_api',
                        label: __('删除接口'),
                        detailsList: ['id'],
                    },
                    {
                        value: 'public_api',
                        label: __('发布接口'),
                        detailsList: ['id'],
                    },
                    {
                        value: 'up_api',
                        label: __('上线接口'),
                        detailsList: ['id'],
                    },
                    {
                        value: 'down_api',
                        label: __('下线接口'),
                        detailsList: ['id'],
                    },
                ],
            },
            {
                label: __('业务架构'),
                options: [
                    {
                        value: 'create_business_domain_group',
                        label: __('新建业务领域分组'),
                        detailsList: ['id', 'name'],
                    },
                    {
                        value: 'update_business_domain_group',
                        label: __('修改业务领域分组'),
                        detailsList: ['id', 'name'],
                    },
                    {
                        value: 'delete_business_domain_group',
                        label: __('删除业务领域分组'),
                        detailsList: ['id'],
                    },
                    {
                        value: 'create_business_domain',
                        label: __('新建业务领域'),
                        detailsList: ['id', 'name'],
                    },
                    {
                        value: 'update_business_domain',
                        label: __('修改业务领域'),
                        detailsList: ['id', 'name'],
                    },
                    {
                        value: 'delete_business_domain',
                        label: __('删除业务领域'),
                        detailsList: ['id'],
                    },
                    {
                        value: 'create_business_process',
                        label: cs ? __('新建主干业务') : __('新建业务流程'),
                        detailsList: [
                            'id',
                            'name',
                            'subject_domain_path',
                            'department_path',
                        ],
                    },
                    {
                        value: 'update_business_process',
                        label: cs ? __('修改主干业务') : __('修改业务流程'),
                        detailsList: [
                            'id',
                            'name',
                            'subject_domain_path',
                            'department_path',
                        ],
                    },
                    {
                        value: 'delete_business_process',
                        label: cs ? __('删除主干业务') : __('删除业务流程'),
                        detailsList: ['id'],
                    },
                ],
            },
            {
                label: __('业务建模'),
                options: [
                    {
                        value: 'create_business_model',
                        label: __('新建业务模型'),
                        detailsList: ['id', 'name', 'business_process_name'],
                    },
                    {
                        value: 'update_business_model',
                        label: __('修改业务模型'),
                        detailsList: ['id', 'name', 'business_process_name'],
                    },
                    {
                        value: 'delete_business_model',
                        label: __('删除业务模型'),
                        detailsList: ['id'],
                    },
                    {
                        value: 'create_business_form',
                        label: __('新建业务表'),
                        detailsList: ['id', 'name'],
                    },
                    {
                        value: 'update_business_form',
                        label: __('修改业务表基本信息'),
                        detailsList: ['id', 'name'],
                    },
                    {
                        value: 'update_business_form_content',
                        label: __('修改业务表表结构'),
                        detailsList: ['id'],
                    },
                    {
                        value: 'delete_business_form',
                        label: __('删除业务表'),
                        detailsList: ['id'],
                    },
                    {
                        value: 'create_business_flowcharts',
                        label: __('新建流程图'),
                        detailsList: ['id', 'name'],
                    },
                    {
                        value: 'update_business_flowcharts',
                        label: __('修改流程图基本信息'),
                        detailsList: ['id', 'name'],
                    },
                    {
                        value: 'export_business_flowcharts',
                        label: __('导出流程图'),
                        detailsList: ['id', 'name'],
                    },
                    {
                        value: 'update_business_flowcharts_content',
                        label: __('修改流程图内容'),
                        detailsList: ['id'],
                    },
                    {
                        value: 'delete_business_flowcharts',
                        label: __('删除流程图'),
                        detailsList: ['id'],
                    },
                    {
                        value: 'create_business_indicator',
                        label: __('新建业务指标'),
                        detailsList: ['id', 'name'],
                    },
                    {
                        value: 'update_business_indicator',
                        label: __('修改业务指标'),
                        detailsList: ['id', 'name'],
                    },
                    {
                        value: 'delete_business_indicator',
                        label: __('删除业务指标'),
                        detailsList: ['id'],
                    },
                ],
            },
            {
                label: __('数据模型'),
                options: [
                    {
                        value: 'create_data_model',
                        label: __('新建数据模型'),
                        detailsList: ['id', 'name', 'business_process_name'],
                    },
                    {
                        value: 'update_data_model',
                        label: __('修改数据模型'),
                        detailsList: ['id', 'name', 'business_process_name'],
                    },
                    {
                        value: 'delete_data_model',
                        label: __('删除数据模型'),
                        detailsList: ['id'],
                    },
                    {
                        value: 'create_data_form',
                        label: __('新建数据表'),
                        detailsList: ['id', 'name'],
                    },
                    {
                        value: 'update_data_form',
                        label: __('修改数据表基本信息'),
                        detailsList: ['id', 'name'],
                    },
                    {
                        value: 'update_data_form_content',
                        label: __('修改数据表表结构'),
                        detailsList: ['id'],
                    },
                    {
                        value: 'delete_data_form',
                        label: __('删除数据表'),
                        detailsList: ['id'],
                    },
                    {
                        value: 'create_data_indicator',
                        label: __('新建数据指标'),
                        detailsList: ['id', 'name'],
                    },
                    {
                        value: 'update_business_indicator',
                        label: __('修改数据指标'),
                        detailsList: ['id', 'name'],
                    },
                    {
                        value: 'delete_data_indicator',
                        label: __('删除数据指标'),
                        detailsList: ['id'],
                    },
                ],
            },
            {
                label: __('主题定义'),
                options: [
                    {
                        value: 'create_subject_domain_group',
                        label: __('新建主题域分组'),
                        detailsList: ['id', 'name'],
                    },
                    {
                        value: 'update_subject_domain_group',
                        label: __('修改主题域分组'),
                        detailsList: ['id', 'name'],
                    },
                    {
                        value: 'delete_subject_domain_group',
                        label: __('删除主题域分组'),
                        detailsList: ['id'],
                    },
                    {
                        value: 'create_subject_domain',
                        label: __('新建主题域'),
                        detailsList: ['id', 'name', 'owner_name'],
                    },
                    {
                        value: 'update_subject_domain',
                        label: __('修改主题域'),
                        detailsList: ['id', 'name', 'owner_name'],
                    },
                    {
                        value: 'delete_subject_domain',
                        label: __('删除主题域'),
                        detailsList: ['id'],
                    },
                    {
                        value: 'create_business_object',
                        label: __('新建业务对象'),
                        detailsList: ['id', 'name', 'owner_name'],
                    },
                    {
                        value: 'update_business_object',
                        label: __('修改业务对象基本信息'),
                        detailsList: ['id', 'name', 'owner_name'],
                    },
                    {
                        value: 'update_business_object_content',
                        label: __('修改业务对象内容'),
                        detailsList: ['id'],
                    },
                    {
                        value: 'delete_business_object',
                        label: __('删除业务对象'),
                        detailsList: ['id'],
                    },
                    {
                        value: 'create_business_activity',
                        label: __('新建业务活动'),
                        detailsList: ['id', 'name', 'owner_name'],
                    },
                    {
                        value: 'update_business_activity',
                        label: __('修改业务活动基本信息'),
                        detailsList: ['id', 'name', 'owner_name'],
                    },
                    {
                        value: 'update_business_activity_content',
                        label: __('修改业务活动内容'),
                        detailsList: ['id'],
                    },
                    {
                        value: 'delete_business_activity',
                        label: __('删除业务活动'),
                        detailsList: ['id'],
                    },
                ],
            },
            {
                label: __('数据标准'),
                options: [
                    {
                        value: 'create_dataelement_api',
                        label: __('新建数据元'),
                        detailsList: ['id', 'name'],
                    },
                    {
                        value: 'update_dataelement_api',
                        label: __('修改数据元'),
                        detailsList: ['id', 'name'],
                    },
                    {
                        value: 'batch_delete_dataelement_api',
                        label: __('批量删除数据元'),
                        detailsList: ['id'],
                    },
                    {
                        value: 'create_dict_api',
                        label: __('新建码表'),
                        detailsList: ['id', 'name'],
                    },
                    {
                        value: 'update_dict_api',
                        label: __('修改码表'),
                        detailsList: ['id', 'name'],
                    },
                    {
                        value: 'batch_delete_dict_api',
                        label: __('批量删除码表'),
                        detailsList: ['id'],
                    },
                    {
                        value: 'create_rule_api',
                        label: __('新建编码规则'),
                        detailsList: ['id', 'name'],
                    },
                    {
                        value: 'update_rule_api',
                        label: __('修改编码规则'),
                        detailsList: ['id', 'name'],
                    },
                    {
                        value: 'batch_delete_rule_api',
                        label: __('批量删除编码规则'),
                        detailsList: ['id'],
                    },
                    {
                        value: 'std_create_file_api',
                        label: __('新建标准文件'),
                        detailsList: ['id', 'name'],
                    },
                    {
                        value: 'std_update_file_api',
                        label: __('修改标准文件'),
                        detailsList: ['id', 'name'],
                    },
                    {
                        value: 'batch_std_delete_file_api',
                        label: __('批量删除标准文件'),
                        detailsList: ['id'],
                    },
                ],
            },
        ],
    },
    [AuditLogType.OperationLog]: {
        options: [
            {
                label: cs ? __('库表') : __('逻辑视图'),
                options: [
                    {
                        value: 'create_data_download_task',
                        label: cs
                            ? __('新建库表下载任务')
                            : __('新建逻辑视图下载任务'),
                        detailsList: ['form_view_id', 'download_task_id'],
                    },
                    {
                        value: 'delete_data_download_task',
                        label: cs
                            ? __('删除库表下载任务')
                            : __('删除逻辑视图下载任务'),
                        detailsList: ['form_view_id', 'download_task_id'],
                    },
                    {
                        value: 'data_download',
                        label: cs ? __('下载库表') : __('下载逻辑视图'),
                        detailsList: ['form_view_id', 'download_task_id'],
                    },
                    {
                        value: 'data_preview',
                        label: cs ? __('预览库表数据') : __('预览逻辑视图数据'),
                        detailsList: ['form_view_id'],
                    },
                    {
                        value: 'request_data_view_authorization',
                        label: cs ? __('申请库表权限') : __('申请逻辑视图权限'),
                        detailsList: [
                            'logic_view_id',
                            'logic_view_name',
                            'logic_view_policies',
                            'sub_view_policies',
                        ],
                    },
                    {
                        value: 'authorize_data_view',
                        label: cs ? __('授权库表权限') : __('授权逻辑视图权限'),
                        detailsList: [
                            'logic_view_id',
                            'logic_view_name',
                            'logic_view_policies',
                            'sub_view_policies',
                        ],
                    },
                ],
            },
            {
                label: __('指标'),
                options: [
                    {
                        value: 'query_indicator',
                        label: __('查看指标数据'),
                        detailsList: ['id'],
                    },
                    {
                        value: 'request_indicator_authorization',
                        label: __('申请指标权限'),
                        detailsList: ['api', 'name', 'policies'],
                    },
                    {
                        value: 'authorize_indicator',
                        label: __('授权指标权限'),
                        detailsList: ['api', 'name', 'policies'],
                    },
                ],
            },
            {
                label: __('接口'),
                options: [
                    {
                        value: 'request_api_authorization',
                        label: __('申请接口权限'),
                        detailsList: ['api', 'name', 'policies'],
                    },
                    {
                        value: 'authorize_api',
                        label: __('授权接口权限'),
                        detailsList: ['api', 'name', 'policies'],
                    },
                ],
            },
        ],
    },
})

/**
 * 所有操作类型
 */
export const logOptionAll = (cs: boolean): any[] => {
    const op1 = logOption(cs)
        [AuditLogType.ManagementLog].options.map((item) => item.options)
        .flat()
    const op2 = logOption(cs)
        [AuditLogType.OperationLog].options.map((item) => item.options)
        .flat()
    return [...op1, ...op2]
}

/**
 * 日志级别标签
 * @value 级别
 */
export const LogLevelTag = ({ value }: { value: LogLevel }) => {
    switch (value) {
        case LogLevel.INFO:
            return <div className={styles.logLevelTag}>{__('信息')}</div>
        case LogLevel.WARN:
            return (
                <div
                    className={styles.logLevelTag}
                    style={{
                        color: '#FF4D4F',
                        background: 'rgba(255,77,79,0.07)',
                    }}
                >
                    {__('警告')}
                </div>
            )
        default:
            return null
    }
}
