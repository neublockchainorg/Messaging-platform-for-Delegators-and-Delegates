import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

import Dashboard from './dashboard/dashboard'

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Messaging Platform</title>
        <meta
          content="Created by NEU Blockchain with @rainbow-me/create-rainbowkit"
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <main className={styles.main}>
        <Dashboard />
      </main>
    </div>
  );
};

export default Home;
