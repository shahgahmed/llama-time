'use client';

import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { TimeseriesData, TimeseriesConfig } from '@/types/dashboard';

interface TimeseriesWidgetProps {
  title: string;
  data?: TimeseriesData;
  config: TimeseriesConfig;
}

interface ChartDataPoint {
  time: number;
  [seriesName: string]: number;
}

export default function TimeseriesWidget({ title, data, config }: TimeseriesWidgetProps) {
  if (data?.loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Loading data...</span>
        </div>
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 bg-red-50 dark:bg-red-950 rounded-lg flex items-center justify-center mx-auto">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="text-sm font-medium text-red-600 dark:text-red-400">Failed to load data</div>
        </div>
      </div>
    );
  }

  if (!data?.series || data.series.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">No data available</div>
        </div>
      </div>
    );
  }

  // Transform data for Recharts
  const chartData = transformData(data.series);
  const ChartComponent = getChartComponent(config.lineType);
  const DataComponent = getDataComponent(config.lineType);

  return (
    <div className="h-full flex flex-col">
      {/* Widget Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
            {title}
          </h3>
          <div className="flex items-center gap-2">
            <div className="text-xs font-mono text-gray-500 dark:text-gray-400">
              {data.series.length} series
            </div>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 p-6">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={chartData}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="currentColor" 
              className="text-gray-200 dark:text-gray-800" 
              strokeWidth={0.5}
            />
            <XAxis 
              dataKey="time" 
              stroke="currentColor"
              className="text-gray-500 dark:text-gray-400"
              tick={{ fontSize: 11, fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}
              tickFormatter={(value) => format(new Date(value), 'HH:mm')}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke="currentColor"
              className="text-gray-500 dark:text-gray-400"
              tick={{ fontSize: 11, fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}
              label={{ 
                value: config.yAxisLabel || '', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fontSize: 11, fontFamily: 'ui-sans-serif, system-ui, sans-serif' }
              }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgb(17 17 17)', 
                border: '1px solid rgb(39 39 42)',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                fontSize: 12,
                fontFamily: 'ui-sans-serif, system-ui, sans-serif'
              }}
              labelStyle={{ 
                color: 'rgb(229 231 235)', 
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                fontSize: 11
              }}
              labelFormatter={(value) => format(new Date(value), 'MMM d, HH:mm:ss')}
            />
            {config.showLegend !== false && (
              <Legend 
                wrapperStyle={{ 
                  color: 'rgb(156 163 175)',
                  fontSize: 11,
                  fontFamily: 'ui-sans-serif, system-ui, sans-serif'
                }}
                iconType={config.lineType === 'bar' ? 'rect' : 'line'}
              />
            )}
            {data.series.map((series, index) => (
              <DataComponent
                key={series.name}
                dataKey={series.name}
                stroke={series.color || getDefaultColor(index)}
                fill={series.color || getDefaultColor(index)}
                strokeWidth={1.5}
                dot={false}
                name={series.name}
                fillOpacity={config.lineType === 'area' ? 0.1 : 1}
              />
            ))}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function transformData(series: TimeseriesData['series']): ChartDataPoint[] {
  // Combine all series data points by timestamp
  const dataMap = new Map<number, ChartDataPoint>();
  
  series.forEach(s => {
    s.data.forEach(point => {
      const time = point.timestamp; // Already a number now
      if (!dataMap.has(time)) {
        dataMap.set(time, { time });
      }
      const dataPoint = dataMap.get(time)!;
      dataPoint[s.name] = point.value;
    });
  });

  // Convert to array and sort by time
  return Array.from(dataMap.values()).sort((a, b) => a.time - b.time);
}

function getChartComponent(lineType?: 'line' | 'area' | 'bar') {
  switch (lineType) {
    case 'area':
      return AreaChart;
    case 'bar':
      return BarChart;
    default:
      return LineChart;
  }
}

function getDataComponent(lineType?: 'line' | 'area' | 'bar') {
  switch (lineType) {
    case 'area':
      return Area;
    case 'bar':
      return Bar;
    default:
      return Line;
  }
}

function getDefaultColor(index: number) {
  const colors = [
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#06b6d4', // cyan-500
    '#84cc16', // lime-500
  ];
  return colors[index % colors.length];
} 