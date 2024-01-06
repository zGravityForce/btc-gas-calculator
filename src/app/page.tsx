/* eslint-disable react/no-unescaped-entities */
"use client";


import styles from './page.module.css'
import { useState } from 'react'
import DisplayGasBox from '@/component/DisplayGasBox';
import CalCPFPBox from '@/component/CalCPFPBox';
import CalBTCPriceBox from '@/component/CalBTCPriceBox';



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

  //881754dd81da7043581378721d183a3944030f9587de5ac9c47bb4102c250c40


  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <DisplayGasBox onFresh={handleGasSelect} />
        {gas? <>
          <CalCPFPBox gas={gas} />
          <CalBTCPriceBox />
        </> : null}
      </div>
    </main>
  )
}
