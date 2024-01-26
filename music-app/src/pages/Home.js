import React from 'react';
import '../css/styles.css';
import HomePart1 from '../components/HomePart1';
import HomePart2 from '../components/HomePart2';

function Home() {
  return (
    <div className="main-container">
      <HomePart1></HomePart1>
      <HomePart2></HomePart2>
    </div>
  );
}

export default Home;
