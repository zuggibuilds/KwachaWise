import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';

interface Item {
  categoryName: string;
  expense_ngwee: number;
}

export function CategoryPieChart({ items }: { items: Item[] }) {
  return (
    <Pie
      data={{
        labels: items.map((item) => `${item.categoryName}\nK${(item.expense_ngwee / 100).toFixed(0)}`),
        datasets: [
          {
            label: 'Expenses',
            data: items.map((item) => item.expense_ngwee / 100),
            backgroundColor: ['#1f7a4f', '#d19a2a', '#2f855a', '#0f766e', '#15803d', '#047857']
          }
        ]
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom' as const,
            labels: {
              font: {
                size: 12
              },
              padding: 15
            }
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                return 'K' + context.parsed.y.toFixed(0);
              }
            }
          }
        }
      }}
    />
  );
}
