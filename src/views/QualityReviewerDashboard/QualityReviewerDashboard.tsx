import React from 'react';
import './QualityReviewerDashboard.scss';

const QualityReviewerDashboard: React.FC<{ userName: string }> = ({ userName }) => (
  <main className="dashboard reviewer">
    <h2>Welcome to Nirvana, {userName}!</h2>
  </main>
);

export default QualityReviewerDashboard;
