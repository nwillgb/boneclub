import React from 'react';

const Dot = ({ color = 'white' }) => <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>;

const Face1 = ({ dotColor }) => <div className="flex justify-center items-center h-full"><Dot color={dotColor} /></div>;

const Face2 = ({ dotColor }) => (
  <div className="flex flex-col justify-between h-full p-2">
    <div className="flex justify-start self-start"><Dot color={dotColor} /></div>
    <div className="flex justify-end self-end"><Dot color={dotColor} /></div>
  </div>
);

const Face3 = ({ dotColor }) => (
  <div className="flex flex-col justify-between h-full p-2">
    <div className="flex justify-start self-start"><Dot color={dotColor} /></div>
    <div className="flex justify-center self-center"><Dot color={dotColor} /></div>
    <div className="flex justify-end self-end"><Dot color={dotColor} /></div>
  </div>
);

const Face4 = ({ dotColor }) => (
  <div className="flex flex-col justify-between h-full p-2">
    <div className="flex justify-between"><Dot color={dotColor} /><Dot color={dotColor} /></div>
    <div className="flex justify-between"><Dot color={dotColor} /><Dot color={dotColor} /></div>
  </div>
);

const Face5 = ({ dotColor }) => (
  <div className="flex flex-col justify-between h-full p-2">
    <div className="flex justify-between"><Dot color={dotColor} /><Dot color={dotColor} /></div>
    <div className="flex justify-center"><Dot color={dotColor} /></div>
    <div className="flex justify-between"><Dot color={dotColor} /><Dot color={dotColor} /></div>
  </div>
);

const Face6 = ({ dotColor }) => (
  <div className="flex flex-col justify-between h-full p-2">
    <div className="flex justify-between"><Dot color={dotColor} /><Dot color={dotColor} /></div>
    <div className="flex justify-between"><Dot color={dotColor} /><Dot color={dotColor} /></div>
    <div className="flex justify-between"><Dot color={dotColor} /><Dot color={dotColor} /></div>
  </div>
);

const DiceFace = ({ value, playerColor = 'white', isUsed = false }) => {
  const faces = {
    1: <Face1 dotColor={playerColor === 'white' ? '#5a3217' : '#e5e4cd'} />,
    2: <Face2 dotColor={playerColor === 'white' ? '#5a3217' : '#e5e4cd'} />,
    3: <Face3 dotColor={playerColor === 'white' ? '#5a3217' : '#e5e4cd'} />,
    4: <Face4 dotColor={playerColor === 'white' ? '#5a3217' : '#e5e4cd'} />,
    5: <Face5 dotColor={playerColor === 'white' ? '#5a3217' : '#e5e4cd'} />,
    6: <Face6 dotColor={playerColor === 'white' ? '#5a3217' : '#e5e4cd'} />,
  };

  const diceBackgroundColor = playerColor === 'white' ? '#e5e4cd' : '#007e81';
  const opacity = isUsed ? 0.3 : 1;

  return (
    <div 
      className="w-12 h-12 rounded-lg transition-opacity duration-300" 
      style={{ 
        backgroundColor: diceBackgroundColor,
        opacity: opacity
      }}
    >
      {faces[value]}
    </div>
  );
};

export default DiceFace;