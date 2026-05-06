import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

interface Item {
  date: string;
  income_ngwee: number;
  expense_ngwee: number;
}

export function DailyTrendChart({ items }: { items: Item[] }) {
  return (
    <Line
      data={{
        labels: items.map((item) => item.date),
        datasets: [
          {
            label: 'Income (ZMW)',
            data: items.map((item) => item.income_ngwee / 100),
            borderColor: '#1f7a4f',
            backgroundColor: 'rgba(31,122,79,0.2)',
            pointRadius: 5,
            pointBackgroundColor: '#1f7a4f',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          },
          {
            label: 'Expense (ZMW)',
            data: items.map((item) => item.expense_ngwee / 100),
            borderColor: '#d19a2a',
            backgroundColor: 'rgba(209,154,42,0.2)',
            pointRadius: 5,
            pointBackgroundColor: '#d19a2a',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          }
        ]
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: 8,
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#555',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                const value = context.parsed.y;
                return `${context.dataset.label}: K${value?.toFixed(0) || '0'}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return 'K' + value;
              }
            }
          }
        }
      }}
    />
  );
}
