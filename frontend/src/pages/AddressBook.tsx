import styles from './styles.module.less'
import AddressBook from '@/components/AddressBook'
import __ from './locale'

function AddressBookPage() {
    return (
        <div className={styles.useRoleWrapper}>
            <AddressBook />
        </div>
    )
}

export default AddressBookPage
