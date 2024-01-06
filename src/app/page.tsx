/* eslint-disable react/no-unescaped-entities */
"use client";


import styles from './page.module.css'
import { useEffect, useState } from 'react'
import axios from 'axios';
import InputNumberBox from '@/component/InputNumberBox';
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

// // {label: string, defaultValue: number, onChange: (number: number| undefined) => void}
// const InputNumberBox = ({label: string, defaultValue: number, onChange: (number: number| undefined) => void}) => {
//   const [value, setValue] = useState(defaultValue);

//     // Update the state and call the onChange prop function
//     const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//       const newValue = Number(e.target.value);
//       setValue(newValue);
//       onChange(newValue);
//     };

//   return (
//     <div className={styles["input-number__box"]}>
//       <label>
//         {label}
//       </label>
//       <input value={value} type='number' onChange={handleChange} />
//     </div>
//   );
// }


type adType = {
  fee: number;
  txid: string;
  weight: number
}

type cpfpType = {
  ancestors: adType[] | [],
  descendants: adType[] | [],
  adjustedVsize: number,
  effectiveFeePerVsize: number,
}

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
  currentGas: number,
  btc: number,
  gasByvB: number,
}

function fixTwoDecimal(num: number, fixNumber: number = 2) {
  return parseFloat(num.toFixed(fixNumber))
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

function calFeeFun(tx: TxType, speedUpGas: number): CalCPFPFeeType {
  const currentVb: number = tx.weight / 4;
  const currentGas: number = tx.fee /  currentVb;


  const speedUpGasByBtc = LIMITPERTXFEE * speedUpGas + currentVb * (speedUpGas - currentGas);


  return {
    currentGas: fixTwoDecimal(currentGas),
    btc: speedUpGasByBtc/100000000,
    gasByvB: fixTwoDecimal(speedUpGasByBtc/LIMITPERTXFEE),
  }
}

// Helper function to calculate total weight
function getTotalWeight(transactions: adType[]) {
  if (!transactions) return 0;
  return transactions.reduce((sum, tx) => sum + tx.weight / 4, 0);
}

function calCPFPFun(cpfp: cpfpType,  speedUpGas: number):  CalCPFPFeeType {
    const currentGas: number = cpfp.effectiveFeePerVsize;

    const descendantSize = getTotalWeight(cpfp.descendants);
    const ancestorsSize = getTotalWeight(cpfp.ancestors);
    const currentSize = cpfp.adjustedVsize ? cpfp.adjustedVsize : 0;

    const speedUpGasByBtc = LIMITPERTXFEE * speedUpGas + (descendantSize + ancestorsSize + currentSize) * (speedUpGas - currentGas);

    return {
      currentGas: fixTwoDecimal(currentGas),
      btc: fixTwoDecimal(speedUpGasByBtc/100000000, 8),
      gasByvB: fixTwoDecimal(speedUpGasByBtc/LIMITPERTXFEE),
    }

}




export default function Home() {

  const [tx, setTx] = useState<TxType | undefined>(undefined);
  const [cpfp, setCPFP] = useState<cpfpType | undefined>(undefined);
  const initialTime = 60;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [gas, setGas] = useState<GasType|undefined>(undefined);
  const [gasSelect, setGasSelect] = useState<number | undefined>(undefined);
  const [calCPFPFee, setCalCPFPFee] = useState<CalCPFPFeeType>();


  const getGas = () => {
    axios.get('api/gas').then(response => {
      // console.log(response.data);
      setGas(response.data)
      setGasSelect(response.data.fastestFee)
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
        setTx(data);
      }}).catch(error => {
        setTx(undefined);
        console.error('There was an error!', error);
  })};


  const getCPFT = (txId: string) => {
    // FeesMempoolBlocks
    axios.get('api/cpfp', {params: {
      txId: txId
    }}).then(response => {
      if (response && response.data) {
        const data = response.data;
        if (data.effectiveFeePerVsize) {
          setCPFP(data);
        }
      }}).catch(error => {
        setCPFP(undefined);
        console.error('There was an error!', error);
  })};


  const getBTCPrice = () => {
    // FeesMempoolBlocks
    axios.get('api/price', {params: {
      symbol: "BTCUSDT"
    }}).then(response => {
      console.log(response.data)
    }).catch(error => {
      console.error('There was an error!', error);
  })};

  useEffect(() => {
    // 
    if (cpfp) {
      if ( gasSelect) {
        setCalCPFPFee(calCPFPFun(cpfp, gasSelect));
      }
    } else {
      if (tx && gasSelect) {
        setCalCPFPFee(calFeeFun(tx, gasSelect));

      }
    }
    
  }, [cpfp, gasSelect, tx])


  useEffect(() => {
    const timer = setInterval(() => {
      if (timeLeft === initialTime) {
        getBTCPrice();
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
            getTx(text);
            getCPFT(text);
          })}
          <div className={styles.tx_box}>
            {tx !== undefined ?
              <div style={{width: '100%'}}>
                <h3>
                  {`Your tx current fee: ${calCPFPFee?.currentGas} sat/vb`}
                </h3>
                <InputNumberBox label='Increased Gas Speed:' defaultValue={gas?.fastestFee || 100} onChange={(number) => {
                  setGasSelect(number ?? gas?.fastestFee)
                }}/>
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
