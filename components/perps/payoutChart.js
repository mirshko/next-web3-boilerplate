import useTheme from '../../hooks/useTheme'
import annotationPlugin from 'chartjs-plugin-annotation';
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

const PayoutChart = ({direction, price, strike, step}) => {
  const theme = useTheme();
  var steps = []
  
  for (let k=-3+(strike<price?1:0); k<3+(strike<price?1:0); k++){
    steps.push( (parseFloat(strike) + k * step).toFixed(1))
  }
  var shift = 0;
  if (direction == 'Long' && strike < price) shift = strike - price
  else if (direction == 'Short' && strike > price ) shift = price - strike

  const options = {
    responsive: true,
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
        display: false,
      },
      
      annotation: {
        annotations: [
          {
          type: 'line',
          scaleID: 'x',
          value: 160,
          borderColor: 'white',
          borderWidth: 2,
          },
        ],
      },
    }
  };
  
  const data = {
    labels: steps,
    datasets: [
      {
        data: steps.map((s) => {
          var pnl = shift
          if (direction == 'Long' && s > strike ) pnl += s - strike;
          else if ( direction == 'Short' && s < strike ) pnl += strike - s
          return pnl
        }),
        borderColor: 'rgba(254, 73, 88, 0.7)',
        backgroundColor: 'rgba(255, 99, 132, 0)',
      },
    ],
  };
  
  return <Line options={options} data={data} />;
}

export default PayoutChart;