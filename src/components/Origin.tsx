import React, { memo } from 'react';

const Origin = () => {
  return (
    <svg width="10" height="10">
      <line x1="0" y1="0" x2="10" y2="0" stroke="red" stroke-width="2" />
      <line x1="0" y1="0" x2="0" y2="10" stroke="green" stroke-width="2" />
    </svg>
  );
};

const MemoizedOrigin = memo(Origin);
export default MemoizedOrigin;
