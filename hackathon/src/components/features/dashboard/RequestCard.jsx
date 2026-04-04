import React from 'react';

const RequestCard = ({ request }) => {
  return (
    <div className="card">
      <h4>{request?.location || 'Unknown Location'}</h4>
      <p>Items: {request?.items || 'None'}</p>
    </div>
  );
};

export default RequestCard;