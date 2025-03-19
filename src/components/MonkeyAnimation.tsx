import React, { useState, useEffect } from 'react';
import bananaImage from '../assets/images/Banana Anim 1.png';
import monkeyImage from '../assets/images/Monkey Idle 1.png';
import treeImage from '../assets/images/Big Tree 2.png';

interface MonkeyAnimationProps {
  onCorrectPrediction?: boolean;
}

const MonkeyAnimation: React.FC<MonkeyAnimationProps> = ({ onCorrectPrediction }) => {
  const [bananas, setBananas] = useState<{ id: number; fallen: boolean }[]>([]);
  const [nextBananaId, setNextBananaId] = useState(0);

  useEffect(() => {
    if (onCorrectPrediction) {
      const newBanana = { id: nextBananaId, fallen: false };
      setBananas(prev => [...prev, newBanana]);
      setNextBananaId(prev => prev + 1);
      
      setTimeout(() => {
        setBananas(prev => 
          prev.map(b => b.id === newBanana.id ? { ...b, fallen: true } : b)
        );
      }, 500);
    }
  }, [onCorrectPrediction]);

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 mb-4">
      <div className="relative w-40 h-48">
        {/* Дерево */}
        <div className="absolute left-1/2 top-0 transform -translate-x-1/2 translate-x-[70px] h-full">
          <img 
            src={treeImage} 
            alt="tree"
            style={{
              height: '100%',
              width: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Мартышка */}
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 translate-x-[1px]">
          <img 
            src={monkeyImage} 
            alt="monkey"
            style={{
              width: '100px',
              height: '120px',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Бананы */}
        {bananas.map(banana => (
          <div
            key={banana.id}
            className={`absolute left-1/2 ${banana.fallen ? '' : 'animate-dropBanana'}`}
            style={{
              transform: 'translateX(-50%) translateX(80px)',
              bottom: banana.fallen ? '35px' : 'auto',
              top: banana.fallen ? 'auto' : '-20px',
              zIndex: banana.fallen ? 1 : 2
            }}
          >
            <img 
              src={bananaImage} 
              alt="banana"
              style={{
                width: '30px',
                height: '15px',
                objectFit: 'contain'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonkeyAnimation; 