import React, { useState } from 'react';
import styles from './index.module.css'
import { GasType } from '@/app/page';
import { Button, Form, InputNumber } from 'antd';
import { fixNumberDecimal } from '@/utils/number-helper';


type CalCostBoxProps = {
    gas: GasType;
    btcPrice: number;
}

type FromType = {
    commit: number;
    reveal: number;
    gas: number;
    amount: number;
    mint: number;
}

const CalTotalBTCFunction = (value: FromType): number => {
    return fixNumberDecimal(((value.commit + value.reveal) * value.gas + value.amount) * value.mint * 0.00000001, 8);
}

const CalTotalBTCWithAmountFunction = (value: FromType): number => {
    return fixNumberDecimal(((value.commit + value.reveal) * value.gas) * value.mint * 0.00000001, 8);
}


const CalTotalUSDTFunction = (value: FromType, btcPrice: number): number => {
    return fixNumberDecimal(btcPrice * CalTotalBTCFunction(value));
}

const CalTotalUSDTWithAmountFunction = (value: FromType, btcPrice: number): number => {
    return fixNumberDecimal(btcPrice * CalTotalBTCWithAmountFunction(value));
}

const CalCostBox: React.FC<CalCostBoxProps> = ({ gas, btcPrice }) => {
    const initialValues: FromType = {
        commit: 154,
        reveal: 181,
        gas: gas.halfHourFee,
        amount: 100000,
        mint: 1,
    }

    const [formValue, setFormValue] = useState<FromType>(initialValues);


    const onFinish = (values: FromType) => {
        setFormValue(values)
        console.log('Success:', values);
    };

    const [form] = Form.useForm();

    const onReset = () => {
        form.resetFields();
    };



    return (
        <div className={styles.box}>
            <h1>BTC Cost Calculator</h1>
            <Form
                layout={"vertical"}
                form={form}
                initialValues={initialValues}
                className={styles.cost__form}
                onFinish={onFinish}
            >
                <Form.Item label="Commit Transaction Virtual Size (vB)" name={'commit'}>
                    <InputNumber min={0} step={"0.01"} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item label="Reveal Transaction Virtual Size (vB)" name={'reveal'}>
                    <InputNumber min={0} step={"0.01"} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item label="Gas Fee (sat/vB)" name={'gas'}>
                    <InputNumber min={0} step={"0.01"} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item label="Limit Mint Amount (sat)" name={'amount'}>
                    <InputNumber min={0} style={{ width: "100%" }}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    />
                </Form.Item>
                <Form.Item label="Number of Mint" name={"mint"}>
                    <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item>
                    <div className={styles["btn-group"]}>
                        <Button htmlType="button" onClick={onReset}>
                            Reset
                        </Button>
                        <Button type="primary" htmlType="submit">
                            calculate
                        </Button>
                    </div>
                </Form.Item>
            </Form>
            <div className={styles.formulae_box}>
                <h4>{`Formula: ((${formValue.commit} + ${formValue.reveal}) * ${formValue.gas} + ${formValue.amount}) * ${formValue.mint}`}</h4>
            </div>
            <div className={styles.result_box}>
                <span className={styles['rate-info']}>
                    <div>{"Total cost"}</div>
                    <div>{`BTC: ${CalTotalBTCFunction(formValue)}`}</div>
                    <div>{`USDT: ${CalTotalUSDTFunction(formValue, btcPrice)}`}</div>
                </span>
                <span className={styles.vertical_divider} />
                <span className={styles['rate-info']}>
                    <div>{"Total cost without Limit mint amount"}</div>
                    <div>{`BTC: ${CalTotalBTCWithAmountFunction(formValue)}`}</div>
                    <div>{`USDT: ${CalTotalUSDTWithAmountFunction(formValue, btcPrice)}`}</div>
                </span>
            </div>
        </div>
    )
}

export default CalCostBox;