// client/src/components/Charts/MoodChart.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function MoodChart({ data }) {
  // Sort by date (oldest to newest)
  const sortedData = [...data]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((entry, index) => ({
      ...entry,
      date: new Date(entry.createdAt).toLocaleDateString(),
      mood: entry.mood,
      index // For x-axis
    }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={sortedData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#422062" />
        <XAxis 
          dataKey="date" 
          tick={{ fill: '#c7d2fe', fontSize: '0.8rem' }}
          axisLine={{ stroke: '#8b5cf6' }}
        />
        <YAxis 
          domain={[1, 5]} 
          ticks={[1, 2, 3, 4, 5]}
          tick={{ fill: '#c7d2fe', fontSize: '0.8rem' }}
          axisLine={{ stroke: '#8b5cf6' }}
          label={{ 
            value: 'Mood', 
            angle: -90, 
            position: 'insideLeft', 
            fill: '#c7d2fe',
            style: { textAnchor: 'middle' }
          }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(30, 15, 50, 0.9)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '8px',
            color: '#e0e7ff'
          }}
        />
        <Line
          type="monotone"
          dataKey="mood"
          stroke="#8b5cf6"
          strokeWidth={3}
          dot={{ r: 6, fill: '#8b5cf6', stroke: '#5a67d8' }}
          activeDot={{ r: 8, fill: '#a78bfa' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default MoodChart;