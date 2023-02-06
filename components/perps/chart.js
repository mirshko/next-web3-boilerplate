import React, { useEffect, useState } from "react";
import { createChart } from "lightweight-charts";
import axios from 'axios';
import { theme, Card, Radio } from 'antd'
const { useToken } = theme;

const candlesColors = {
  upColor: '#55d17c',
  downColor: '#e57673',
  borderDownColor: '#e57673',
  borderUpColor: '#55d17c',
  wickDownColor: '#e57673',
  wickUpColor: '#55d17c',
}


function Chart({ohlcUrl, setPrice}) {
  const [ chart, setChart ] = useState()
  const [ cs, setCs ] = useState()
  const [ interval, setInterval ] = useState('1h')
  const [ candles, setCandles ] = useState()
  const { token } = useToken();
  const ref = React.useRef();
  const apiUrl = ohlcUrl + interval


  useEffect( () => {
    // get candles from geckoterminal
    async function getdata() {
      try {
        const data = await axios.get(apiUrl, {withCredentials: false,})
        let candles = []
        for (let c of data.data ) candles.push({time: c[0]/1000, open: c[1], high: c[2], low: c[3], close: c[4]})

        // push price up to main page
        setPrice( parseFloat(candles[candles.length-1].close) )
      
        var mycs = cs ?? chart.addCandlestickSeries(candlesColors);
        mycs.setData(candles);
        setCs(mycs)
      } catch(e) {console.log(e)}
    }
    if (chart) getdata()
  }, [apiUrl, chart])


  useEffect(() => {
    const chart1 = createChart(ref.current, {
      width: 800,
      height: 400,
      layout: {
        backgroundColor: 'rgba(0,0,0,0)',
        textColor: 'rgba(255, 255, 255, 0.9)',
      },
      grid: {
        vertLines: {
          color: 'rgba(197, 203, 206, 0.2)',
        },
        horzLines: {
          color: 'rgba(197, 203, 206, 0.2)',
        },
      },
      crosshair: {
      },
      rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 0.8)',
      },
      timeScale: {
        borderColor: 'rgba(197, 203, 206, 0.8)',
      },
    });
    setChart(chart1)
  }, []);

  return (
    <Card>
    <Radio.Group value={interval} onChange={(e) => setInterval(e.target.value)} style={{ marginBottom: 0, backgroundColor: token.colorBgContainer, zIndex: 3 }}
      className='intervalButtons'
    >
      <Radio.Button value="15m">15m</Radio.Button>
      <Radio.Button value="1h">1h</Radio.Button>
      <Radio.Button value="4h">4h</Radio.Button>
      <Radio.Button value="1d">1d</Radio.Button>
    </Radio.Group>
    <div ref={ref} style={{marginTop: '-20px'}} />
    </Card>
  );
}

export default Chart;