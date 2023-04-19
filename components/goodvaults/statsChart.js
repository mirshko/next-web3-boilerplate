import { useEffect, useState } from "react";
import useTheme from "../../hooks/useTheme";
import axios from "axios";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const StatsChart = ({vault}) => {
  const [geData, setGeData] = useState([])
  const theme = useTheme();

  useEffect(() => {
    const getData = async () => {
      try {
        const histData = await axios.get("https://roe.nicodeva.xyz/stats/arbitrum/history.json");
        console.log(histData)
        if (histData.data && histData.data[vault.geVault]){
          console.log(histData.data[vault.geVault])
          setGeData(histData.data[vault.geVault])
        }
      } catch(e){
        console.log("Fetch historical data", e)
      }
    }
    if (vault && vault.geVault) getData()
  }, [vault.geVault])
  
  const options = {
      maintainAspectRatio: false,
      indexAxis: 'x',
      scales: {
        y: {
           display: true,
        },
        x: {
            display: true,
        }
      },
    plugins: {
      legend: {
        position: 'top' ,
        display: true,
      },
      title: {
        display: true,
        text: 'Historical Performance',
      },
    }
  };
  
  const data = {
    labels: geData.map(item => { return (new Date(item.date*1000)).toLocaleDateString('en-GB').substring(0, 5)}),
    datasets: [
      {
        label: 'Supply APR',
        data: geData.map(item => item.supplyRate),
        borderColor: 'rgba(254, 73, 88, 0.7)',
        backgroundColor: 'rgba(255, 99, 132, 0)',
      },
      {
        label: 'Fees APR',
        data: geData.map(item => item.feesRate),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Total APR',
        data: geData.map(item => {return item.feesRate+item.supplyRate}),
        borderColor: 'rgba(14, 192, 82)',
        backgroundColor: 'rgba(14, 192, 82, 0.5)',
      },
    ],
  };
  
  return (
    <div style={{ position: 'relative', height: 280 }}>
      <Line height={300} options={options} data={data} />
    </div>
  )
}

export default StatsChart;