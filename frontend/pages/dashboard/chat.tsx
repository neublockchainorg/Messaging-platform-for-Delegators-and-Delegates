import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi'
import { NextPage } from 'next';

import styles from "../../styles/Chat.module.css"

const Chat: NextPage = () => {

    const { isConnected } = useAccount()

    return (
        isConnected ?
        <div className={styles.chat}>
            Test
        </div> : <div className={styles.chat}>
            Please connect your wallet:
            <ConnectButton />
        </div>
    )
}

export default Chat