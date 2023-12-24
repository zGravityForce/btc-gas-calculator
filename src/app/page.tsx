/* eslint-disable react/no-unescaped-entities */
"use client";


import styles from './page.module.css'
import { useEffect, useState } from 'react'
import axios from 'axios';
const LIMITPERTXFEE = 160;


function RenderInputText(label: string, onChange: (text: string) => void) {
  return (
    <div className={styles.input__box}>
      <label>
        {label}
      </label>
      <input onChange={(e) => {
        onChange(e.target.value)
      }} />
    </div>
  );
}

function RenderInputNumber(label: string, defaultValue: number, onChange: (number: number| undefined) => void) {
  return (
    <div className={styles["input-number__box"]}>
      <label>
        {label}
      </label>
      <input defaultValue={defaultValue} type='number' onChange={(e) => {
        onChange(Number(e.target.value))
      }} />
    </div>
  );
}


// type TxType = {
//   fee: number;
//   txid: string;
//   weight: number
// }

// type TxCPFPType = {
//   ancestors: any[] | [],
//   descendants: any[] | [],
//   effectiveFeePerVsize: number,
// }

type TxType = {
  fee: number,
  weight: number,
}


type GasType = {
  fastestFee: number,
  halfHourFee: number,
  hourFee: number,
  economyFee: number,
  minimumFee: number
}

type CalCPFPFeeType = {
  btc: number,
  gasByvB: number,
}

function fixTwoDecimal(num: number) {
  return parseFloat(num.toFixed(2))
}

// function calCPFPFeeFun(tx: TxCPFPType, speedUpGas: number): CalCPFPFeeType {
//   const currentGas: number = tx.effectiveFeePerVsize;

//   const descendantSize = tx.descendants.reduce((sum, tx) => sum + tx.weight, 0);
//   const ancestorsSize = tx.ancestors.reduce((sum, tx) => sum + tx.weight, 0);

//   const speedUpGasByBtc = LIMITPERTXFEE * speedUpGas + (descendantSize + ancestorsSize) * (speedUpGas - currentGas);

//   console.log(descendantSize,ancestorsSize,  speedUpGasByBtc);

//   return {
//     btc: fixTwoDecimal(speedUpGasByBtc),
//     gasByvB: fixTwoDecimal(speedUpGasByBtc/LIMITPERTXFEE),
//   }
// }

function calCPFPFeeFun(tx: TxType, speedUpGas: number): CalCPFPFeeType {
  const currentVb: number = tx.weight / 4;
  const currentGas: number = tx.fee /  currentVb;

  // const descendantSize = tx.descendants.reduce((sum, tx) => sum + tx.weight, 0);
  // const ancestorsSize = tx.ancestors.reduce((sum, tx) => sum + tx.weight, 0);

  const speedUpGasByBtc = LIMITPERTXFEE * speedUpGas + currentVb * (speedUpGas - currentGas);


  return {
    btc: fixTwoDecimal(speedUpGasByBtc),
    gasByvB: fixTwoDecimal(speedUpGasByBtc/LIMITPERTXFEE),
  }
}




export default function Home() {

  const [txCPFP, setTxCPFP] = useState<TxType | undefined>(undefined);
  const initialTime = 60;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [gas, setGas] = useState<GasType|undefined>(undefined);
  const [calCPFPFee, setCalCPFPFee] = useState<CalCPFPFeeType>();

  const getGas = () => {
    axios.get('api/gas').then(response => {
      // console.log(response.data);
      setGas(response.data)
    }).catch(error => {
      setGas(undefined)
      // console.error('There was an error!', error);
    })
  }

  const getTx = (txId: string) => {
    axios.get('api/tx', {params: {
      txId: txId
    }}).then(response => {
      if (response && response.data) {
        const data = response.data;
        // console.log(data);
        setTxCPFP(data);
        setCalCPFPFee(calCPFPFeeFun(response.data, gas?.fastestFee ?? 100));
      }}).catch(error => {
        setTxCPFP(undefined);
        console.error('There was an error!', error);
  })};



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

  //881754dd81da7043581378721d183a3944030f9587de5ac9c47bb4102c250c40

  return (
    <main className={styles.main}>
      <div className={styles.description}>
         <div className={styles.box}>
          <h1>BTC CPFP Calculator</h1>
          <div className={styles.gas__box}>
            <span className={styles['rate-info']}>{`Slow: ${gas?.hourFee} sat/vB`}</span>
            <span className={styles['rate-info']}>{`Avg: ${gas?.halfHourFee} sat/vB`}</span>
            <span className={styles['rate-info']}>{`Fast: ${gas?.fastestFee} sat/vB`}</span>
            <span className={styles['rate-info']}>{`Fresh time: ${timeLeft}`}</span>
          </div>  
          {RenderInputText("Transaction Id:", (text) => {
            getTx(text)
          })}
          <div className={styles.tx_box}>
            {txCPFP !== undefined ?
              <div style={{width: '100%'}}>
                <h3>
                  {`Your tx current fee: ${fixTwoDecimal(txCPFP.fee / (txCPFP.weight / 4))} sat/vb`}
                </h3>
                {RenderInputNumber("Increased Gas Speed:", gas?.fastestFee || 100,  (number) => {
                  const speedUpGas = number ?? gas?.fastestFee ?? 100;
                  setCalCPFPFee(calCPFPFeeFun(txCPFP, speedUpGas));
                  
                })}
                <h3>
                  {`Your CPFP may require approximately ${calCPFPFee?.gasByvB} sat/vB or ${calCPFPFee?.btc} BTC to increase the speed!`}
                </h3>
              </div> : 
              <div>{"Please Check Input Your Tx Id Current"}</div>
            }
          </div>
          
         </div>
      </div>
    </main>
  )
}
