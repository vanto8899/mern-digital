// YAxis.js
import React from 'react';
import { YAxis as RechartsYAxis } from 'recharts';

const YAxis = ({ tickCount = 5, yAxisId = 'yAxis1', ...props }) => {
    return <RechartsYAxis tickCount={tickCount} yAxisId={yAxisId} {...props} />;
};

export default YAxis;
