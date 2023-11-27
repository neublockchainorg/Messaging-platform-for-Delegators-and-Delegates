import { NextPage } from "next"
import styles from '../../styles/Dashboard.module.css';
import Chat from "./chat"

const Dashboard: NextPage = () => {
    return (
        <div className={styles.container}>
            <nav className={styles.dashboard}>
                <h1 className={styles.h1}>Messaging Platform</h1>
                <ul className={styles.ul}>
                    <li><div>Delegators</div></li>
                    <li><div>Delegates</div></li>
                    <li className={styles.settings}><div>Settings</div></li>
                </ul>
            </nav>
            <Chat />
        </div>
    )
}

export default Dashboard