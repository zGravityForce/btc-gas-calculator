import React, { useEffect, useState } from 'react';
import styles from './index.module.css'
import axios from 'axios';
import InputNumberBox from '../InputNumberBox';
import { GasType } from '@/app/page';
import { fixTwoDecimal } from '@/utils/number-helper';

const LIMITPERTXFEE = 160;


type TxType = {
    fee: number,
    weight: number,
}

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
  


type CalCPFPFeeType = {
    currentGas: number,
    btc: number,
    gasByvB: number,
}



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


type CalCPFPBoxProps = {
    gas?: GasType
}

const CalCPFPBox: React.FC<CalCPFPBoxProps> = ({ gas }) => {
    const [cpfp, setCPFP] = useState<cpfpType | undefined>(undefined);
    const [tx, setTx] = useState<TxType | undefined>(undefined);
    const [calCPFPFee, setCalCPFPFee] = useState<CalCPFPFeeType>();
    const [gasSelect, setGasSelect] = useState<number | undefined>();


    const handleUpdate = () => {

        if (gasSelect) {
            const feeData = cpfp 
            ? calCPFPFun(cpfp, gasSelect)
            : tx 
                ? calFeeFun(tx, gasSelect)
                : undefined;
    
            if (feeData) setCalCPFPFee(feeData);
        }

       
        
        // if (cpfp) {
        //     if (gasSelect) {
        //         const feeData = calCPFPFun(cpfp, gasSelect);
        //         setCalCPFPFee(feeData);
        //     }
        // } else {
        //     if (tx && gasSelect) {
        //         const feeData = calFeeFun(tx, gasSelect);
        //         setCalCPFPFee(feeData);
        //     }
        // }
    };

    useEffect(() => {
        handleUpdate()
    }, [cpfp, gasSelect, tx])


    const getTx = async (txId: string) => {
        try {
          const response = await axios.get('api/tx', { params: { txId } });
          return response.data; // Return the data directly
        } catch (error) {
          console.error('There was an error!', error);
          return undefined; // Return undefined in case of an error
        }
    };
      
    const getCPFT = async (txId: string) => {
        try {
            const response = await axios.get('api/cpfp', { params: { txId } });
            if (response.data && response.data.effectiveFeePerVsize) {
            return response.data; // Return the data directly
            }
            return undefined; // Return undefined if condition not met
        } catch (error) {
            console.error('There was an error!', error);
            return undefined;
        }
    };
      
    const fetchDataAndRender = async (txId: string) => {
        setGasSelect(gas?.fastestFee);

        const txData = await getTx(txId);
        setTx(txData); // Assuming setTx is a state setter
      
        const cpftData = await getCPFT(txId);
        setCPFP(cpftData); // Assuming setCPFP is a state setter

        // Now you can proceed to render the data as both API calls are completed
    };

    return (
        <div className={styles.box}>
          <h1>BTC CPFP Calculator</h1>
          {RenderInputText("Transaction Id:", (text) => {
            fetchDataAndRender(text)
          })}
          <div className={styles.tx_box}>
            {tx !== undefined && gas !== undefined ?
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
    ) 

}

export default CalCPFPBox;