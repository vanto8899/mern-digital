// XAxis.js
import React from 'react';
import { XAxis as RechartsXAxis } from 'recharts';

const XAxis = ({ dataKey = 'defaultDataKey', xAxisId = 'xAxis1', ...props }) => {
    return <RechartsXAxis dataKey={dataKey} xAxisId={xAxisId} {...props} />;
};

export default XAxis;
