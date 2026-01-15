import moment from 'moment'

/**
 * 模拟列表其他信息
 * @returns
 */
export const mockListOtherInfo = () => {
    return {
        updated_at: moment().valueOf(),
        updated_by: 'l1',
        created_at: moment().valueOf(),
        created_by: 'l1',
    }
}
