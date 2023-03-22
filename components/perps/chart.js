import React, { useEffect, useState } from "react";
import { createChart } from "lightweight-charts";
import { theme, Card, Radio, Spin } from 'antd'
const { useToken } = theme;

const candlesColors = {
  upColor: '#55d17c',
  downColor: '#e57673',
  borderDownColor: '#e57673',
  borderUpColor: '#55d17c',
  wickDownColor: '#e57673',
  wickUpColor: '#55d17c',
}


function Chart({setPrice, width, height, interval, setInterval, positions, candles}) {
  const [ chart, setChart ] = useState()
  const [ cs, setCs ] = useState()
  const [drawn, setDrawn] = useState([])
  const [lines, setLines] = useState([])
  const [isSpinning, setSpinning] = useState(true)
  const { token } = useToken();
  const ref = React.useRef();


  useEffect( () => {
    // get candles from geckoterminal
    async function displayData() {
      try {
        var mycs = cs ?? chart.addCandlestickSeries(candlesColors);
        mycs.setData(candles);
        setCs(mycs)
        setSpinning(false)
      } catch(e) {console.log(e)}
    }
    if (chart && candles && candles.length > 0) displayData()
  }, [chart, candles])


  useEffect(()=>{
    if (chart && cs){
      let nlines = []
      // remove previous lines
      for (let ln of lines){
        cs.removePriceLine(ln)
      }
      for (let pos of positions){
        const myPriceLine = {
          price: pos.price,
          color: '#3179F5',
          lineWidth: 1,
          lineStyle: 2, // LineStyle.Dashed
          axisLabelVisible: true,
          //title: 'S',
        };   
        let pl = cs.createPriceLine(myPriceLine);
        nlines.push(pl)
      }
      setLines(nlines)
    }
  }, [positions])



  useEffect(() => {
    const chart1 = createChart(ref.current, {
      width: width ?? 800,
      height: height ?? 400,
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
        mode: 0
      },
      rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 0.8)',
      },
      timeScale: {
        borderColor: 'rgba(197, 203, 206, 0.8)',
        timeVisible: true,
      },
    });
    setChart(chart1)
  }, []);

  //console.log(chart)


  return (
    <Card>
    <Radio.Group value={interval} onChange={(e) => setInterval(e.target.value)} style={{ marginBottom: 0, backgroundColor: 'rgba(54, 54, 58, 1)', zIndex: 3 }}
      className='intervalButtons'
    >
      <Radio.Button value="15m">15m</Radio.Button>
      <Radio.Button value="1h">1h</Radio.Button>
      <Radio.Button value="4h">4h</Radio.Button>
      <Radio.Button value="1d">1d</Radio.Button>
      { isSpinning? <Spin style={{marginLeft: 24, marginBottom: 6}}/> : null }
    </Radio.Group>
    <div ref={ref} style={{marginTop: '-20px'}} />
    </Card>
  );
}

export default Chart;