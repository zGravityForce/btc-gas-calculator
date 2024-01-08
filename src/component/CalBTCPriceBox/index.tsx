import React, { useEffect, useState, useMemo } from 'react';
import styles from './index.module.css'
import axios from 'axios';
import { fixNumberDecimal } from '@/utils/number-helper';
import { InputNumber } from 'antd';


type CalBTCPriceBoxProps = {
    onFresh: (btcFee: number) => void;
  };

const CalBTCPriceBox: React.FC<CalBTCPriceBoxProps> = ({ onFresh }) => {
    const [btcUsd, setBtcUsd] = useState({ btc: 1, usd: 0 });
    const [btcPrice, setBtcPrice] = useState<number>(0);

    const getBTCPrice = async () => {
        try {
            const response = await axios.get('api/price', { params: { symbol: "BTCUSDT" } });
            if (response.data.price) {
                const _btcPrice = Number(response.data.price);
                setBtcPrice(_btcPrice);
                onFresh(_btcPrice);
            }
        } catch (error) {
            console.error('There was an error!', error);
        }
    };

    const usdPerBtc = useMemo(() => btcPrice, [btcPrice]);

    const getUsd = (btc: number | null) => {
      if (btc !== null) {
        setBtcUsd({ btc, usd: fixNumberDecimal(btc * usdPerBtc) });
      }
  };
  
  const getBtc = (usd: number | null) => {
      if (usd !== null) {
        setBtcUsd({ btc: fixNumberDecimal(usd / usdPerBtc, 8), usd });
      }
  };

    useEffect(() => {
      getBTCPrice();

      const timer = setInterval(() => {
        getBTCPrice();
      }, 10000);
      return () => clearInterval(timer);
    }, [])

    useEffect(() => {
        if (btcPrice > 0) {
            setBtcUsd(prev => ({ ...prev, usd: fixNumberDecimal(prev.btc * btcPrice) }));
        }
    }, [btcPrice]);

    return (
        <div className={styles.box}>
            <h1>Convert BTC/USDT</h1>
            <div className={styles.gas__box}>
                <span className={styles['rate-info']}>
                    <InputNumber addonAfter="BTC" value={btcUsd.btc} onChange={getUsd} min={0} defaultValue={0}/>
                </span>
                <span className={styles['rate-info']}>
                    <InputNumber addonAfter="USDT" value={btcUsd.usd} onChange={getBtc} min={0} defaultValue={0}/>
                </span>
            </div>
        </div>
    );
};

export default CalBTCPriceBox;
