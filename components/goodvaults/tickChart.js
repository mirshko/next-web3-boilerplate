import useTheme from '../../hooks/useTheme';
import useGoodStats from '../../hooks/useGoodStats';
import annotationPlugin from 'chartjs-plugin-annotation';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const TickChart = ({vault, gevault}) => {
  const theme = useTheme();
  const goodStats = useGoodStats();

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: 'left'
      },
      title: {
        display: true,
        text: 'Underlying Assets Repartition',
      },
    },
  };
  
  const labels = vault.ticks ? vault.ticks.map(i => i.price) : [];
  const values = vault.ticks ? vault.ticks.map(i => {
    try {
      return Math.round(goodStats["7d"][gevault.address]["underlyingRepartition"][i.address].value / 1e8)
    }
    catch
    {
      return 0
    }
  }) : [];

 const data = {
  labels,
  datasets: [
    {
      label: 'Tick TVL',
      data: values,
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    },
  ],
};

  
  return (
    <div style={{ position: 'relative', height: 150 }}>
      <Bar options={options} data={data} height={130} />
    </div>
  )
}

export default TickChart;