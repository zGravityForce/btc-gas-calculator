/* eslint-disable react/no-unescaped-entities */
"use client";


import styles from './page.module.css'
import { useEffect, useState } from 'react'
import axios from 'axios';
import DisplayGasBox from '@/component/DisplayGasBox';
import CalCPFPBox from '@/component/CalCPFPBox';


export type GasType = {
  fastestFee: number,
  halfHourFee: number,
  hourFee: number,
  economyFee: number,
  minimumFee: number
}



export default function Home() {

  const [gas, setGas] = useState<GasType|undefined>(undefined);
  // const [gas, setGas] = useState<number | undefined>(undefined);


  const handleGasSelect = (gasFee: GasType) => {
    setGas(gasFee);
  }

  
  const getBTCPrice = () => {
    // FeesMempoolBlocks
    axios.get('api/price', {params: {
      symbol: "BTCUSDT"
    }}).then(response => {
      console.log(response.data)
    }).catch(error => {
      console.error('There was an error!', error);
  })};



  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     if (timeLeft === initialTime) {
  //       getBTCPrice();
  //       getGas();
  //     }
  //     // console.log(txCPFP)
  //     setTimeLeft((prev) => (prev > 0? prev -1 : initialTime));
  //   }, 1000);

  //   return () => clearInterval(timer);
  // }, [timeLeft])

  //881754dd81da7043581378721d183a3944030f9587de5ac9c47bb4102c250c40


  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <DisplayGasBox onFresh={handleGasSelect} />
        {gas? <>
          <CalCPFPBox gas={gas} />
        </> : null}
      </div>
    </main>
  )
}
