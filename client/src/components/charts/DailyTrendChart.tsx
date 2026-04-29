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
            backgroundColor: 'rgba(31,122,79,0.2)'
          },
          {
            label: 'Expense (ZMW)',
            data: items.map((item) => item.expense_ngwee / 100),
            borderColor: '#d19a2a',
            backgroundColor: 'rgba(209,154,42,0.2)'
          }
        ]
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false
      }}
    />
  );
}
