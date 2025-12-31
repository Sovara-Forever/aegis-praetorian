import React from 'react'
import Chart from 'react-apexcharts'

function ModelDistribution({ distribution }) {
  if (!distribution || distribution.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Distribution</h3>
        <p className="text-gray-600">No distribution data available</p>
      </div>
    )
  }

  // Prepare chart data
  const chartData = {
    series: [{
      name: 'Vehicles',
      data: distribution.map(d => d.count)
    }],
    options: {
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          borderRadius: 8,
          horizontal: true,
          distributed: true
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val
        }
      },
      xaxis: {
        categories: distribution.map(d => `${d.make} ${d.model}`),
        title: {
          text: 'Number of Vehicles'
        }
      },
      yaxis: {
        title: {
          text: 'Model'
        }
      },
      colors: ['#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e', '#7dd3fc', '#38bdf8', '#bae6fd'],
      legend: {
        show: false
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + ' vehicles'
          }
        }
      }
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Model Distribution</h3>
        <span className="text-sm text-gray-600">{distribution.length} models</span>
      </div>
      <Chart
        options={chartData.options}
        series={chartData.series}
        type="bar"
        height={350}
      />
    </div>
  )
}

export default ModelDistribution
