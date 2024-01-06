import React, { useState, ChangeEvent, useEffect } from 'react';
import styles from './index.module.css'
import { GasType } from '@/app/page';
import axios from 'axios';

// Define a type for the component's props
type DisplayGasBoxProps = {
  onFresh: (gasSelect: number) => void;
};

const DisplayGasBox: React.FC<DisplayGasBoxProps> = ({ onFresh }) => {

    const initialTime = 60;
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [gas, setGas] = useState<GasType|undefined>(undefined);
   
    const getGas = () => {
        axios.get('api/gas').then(response => {
            // console.log(response.data);
            setGas(response.data)
            onFresh(response.data.fastestFee)
        }).catch(error => {
            setGas(undefined)
            // console.error('There was an error!', error);
        })
    }

   useEffect(() => {
    const timer = setInterval(() => {
      if (timeLeft === initialTime) {
        getGas();
      }
      // console.log(txCPFP)
      setTimeLeft((prev) => (prev > 0? prev -1 : initialTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft])


  return (
    <div className={styles.box}>
          <h1>BTC TRANSACTION FEES</h1>
          <div className={styles.gas__box}>
            <span className={styles['rate-info']}>{`Slow: ${gas?.hourFee} sat/vB`}</span>
            <span className={styles['rate-info']}>{`Avg: ${gas?.halfHourFee} sat/vB`}</span>
            <span className={styles['rate-info']}>{`Fast: ${gas?.fastestFee} sat/vB`}</span>
            <span className={styles['rate-info']}>{`Fresh time: ${timeLeft}`}</span>
          </div>
    </div>
  );
};

export default DisplayGasBox;
