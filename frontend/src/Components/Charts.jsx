import React from 'react';
import './Charts.css';

// Simple Bar Chart Component
export const BarChart = ({ data, title }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="chart-container">
      {title && <h4 className="chart-title">{title}</h4>}
      <div className="bar-chart">
        {data.map((item, index) => (
          <div key={index} className="bar-chart-item">
            <div className="bar-chart-bar-container">
              <div
                className="bar-chart-bar"
                style={{
                  height: `${(item.value / maxValue) * 100}%`,
                  background: item.color || 'linear-gradient(180deg, #2563eb, #1d4ed8)'
                }}
                data-value={item.value}
              >
                <span className="bar-chart-value">{item.value}</span>
              </div>
            </div>
            <span className="bar-chart-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple Line Chart Component (using CSS and divs)
export const LineChart = ({ data, title }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  
  return (
    <div className="chart-container">
      {title && <h4 className="chart-title">{title}</h4>}
      <div className="line-chart">
        <div className="line-chart-grid">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="line-chart-grid-line" />
          ))}
        </div>
        <div className="line-chart-line-container">
          {data.map((item, index) => {
            const height = ((item.value - minValue) / range) * 100;
            const nextItem = data[index + 1];
            
            return (
              <React.Fragment key={index}>
                <div
                  className="line-chart-point"
                  style={{
                    left: `${(index / (data.length - 1)) * 100}%`,
                    bottom: `${height}%`
                  }}
                  data-value={item.value}
                >
                  <span className="line-chart-point-tooltip">
                    {item.label}: {item.value}
                  </span>
                </div>
                {nextItem && (
                  <div
                    className="line-chart-segment"
                    style={{
                      left: `${(index / (data.length - 1)) * 100}%`,
                      bottom: `${height}%`,
                      width: `${(1 / (data.length - 1)) * 100}%`,
                      transform: `rotate(${Math.atan2(
                        ((nextItem.value - minValue) / range) * 100 - height,
                        (1 / (data.length - 1)) * 100
                      )}rad)`
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <div className="line-chart-labels">
          {data.map((item, index) => (
            <span
              key={index}
              className="line-chart-label"
              style={{ left: `${(index / (data.length - 1)) * 100}%` }}
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Donut Chart Component
export const DonutChart = ({ data, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercent = 0;
  
  return (
    <div className="chart-container">
      {title && <h4 className="chart-title">{title}</h4>}
      <div className="donut-chart-wrapper">
        <svg className="donut-chart" viewBox="0 0 42 42">
          <circle className="donut-chart-background" cx="21" cy="21" r="15.91549430918954" />
          {data.map((item, index) => {
            const percent = (item.value / total) * 100;
            const offset = cumulativePercent;
            cumulativePercent += percent;
            
            return (
              <circle
                key={index}
                className="donut-chart-segment"
                cx="21"
                cy="21"
                r="15.91549430918954"
                fill="transparent"
                stroke={item.color || `hsl(${index * 60}, 70%, 50%)`}
                strokeWidth="4"
                strokeDasharray={`${percent} ${100 - percent}`}
                strokeDashoffset={-offset}
                style={{ animation: `donutFill 1s ease-out ${index * 0.1}s both` }}
              />
            );
          })}
          <text x="21" y="21" className="donut-chart-center-text">
            <tspan className="donut-chart-total">{total}</tspan>
            <tspan x="21" dy="1.2em" className="donut-chart-label">Total</tspan>
          </text>
        </svg>
        <div className="donut-chart-legend">
          {data.map((item, index) => (
            <div key={index} className="donut-chart-legend-item">
              <span
                className="donut-chart-legend-color"
                style={{ background: item.color || `hsl(${index * 60}, 70%, 50%)` }}
              />
              <span className="donut-chart-legend-label">{item.label}</span>
              <span className="donut-chart-legend-value">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Progress Ring Component
export const ProgressRing = ({ value, max = 100, label, color = '#2563eb', size = 120 }) => {
  const percentage = (value / max) * 100;
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="progress-ring-container">
      <svg width={size} height={size} className="progress-ring">
        <circle
          className="progress-ring-background"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        <circle
          className="progress-ring-circle"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ animation: 'progressRing 1.5s ease-out both' }}
        />
        <text
          x="50%"
          y="50%"
          className="progress-ring-text"
          dominantBaseline="middle"
          textAnchor="middle"
        >
          <tspan className="progress-ring-value">{Math.round(percentage)}%</tspan>
          {label && <tspan x="50%" dy="1.5em" className="progress-ring-label">{label}</tspan>}
        </text>
      </svg>
    </div>
  );
};

// Stat Comparison Component
export const StatComparison = ({ current, previous, label, format = 'number' }) => {
  const diff = current - previous;
  const percentChange = previous !== 0 ? ((diff / previous) * 100).toFixed(1) : 0;
  const isPositive = diff >= 0;
  
  return (
    <div className="stat-comparison">
      <div className="stat-comparison-current">
        <span className="stat-comparison-value">
          {format === 'currency' ? `$${current.toLocaleString()}` : current.toLocaleString()}
        </span>
        <span className="stat-comparison-label">{label}</span>
      </div>
      <div className={`stat-comparison-change ${isPositive ? 'positive' : 'negative'}`}>
        <span className="stat-comparison-arrow">{isPositive ? '↑' : '↓'}</span>
        <span className="stat-comparison-percent">{Math.abs(percentChange)}%</span>
        <span className="stat-comparison-diff">
          {isPositive ? '+' : ''}{diff.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

// Heatmap Component (simplified version)
export const Heatmap = ({ data, title }) => {
  const maxValue = Math.max(...data.flat().map(d => d.value));
  
  return (
    <div className="chart-container">
      {title && <h4 className="chart-title">{title}</h4>}
      <div className="heatmap">
        {data.map((row, rowIndex) => (
          <div key={rowIndex} className="heatmap-row">
            {row.map((cell, cellIndex) => {
              const intensity = cell.value / maxValue;
              return (
                <div
                  key={cellIndex}
                  className="heatmap-cell"
                  style={{
                    background: `rgba(37, 99, 235, ${intensity})`,
                  }}
                  title={`${cell.label}: ${cell.value}`}
                >
                  <span className="heatmap-cell-value">{cell.value}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default {
  BarChart,
  LineChart,
  DonutChart,
  ProgressRing,
  StatComparison,
  Heatmap
};
