import React, { useState } from 'react';
import { evaluate } from 'mathjs';

export const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    setExpression(display + op);
    setNewNumber(true);
  };

  const handleCalculate = () => {
    try {
      const result = evaluate(expression + display);
      setDisplay(result.toString());
      setExpression('');
      setNewNumber(true);
    } catch (e) {
      setDisplay('Error');
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
    setNewNumber(true);
  };

  const handlePercent = () => {
    try {
      const result = parseFloat(display) / 100;
      setDisplay(result.toString());
    } catch (e) {
      setDisplay('Error');
    }
  };

  const handleSign = () => {
    try {
      const result = parseFloat(display) * -1;
      setDisplay(result.toString());
    } catch (e) {
      setDisplay('Error');
    }
  };

  const buttons = [
    { label: 'AC', onClick: handleClear, type: 'func' },
    { label: '+/-', onClick: handleSign, type: 'func' },
    { label: '%', onClick: handlePercent, type: 'func' },
    { label: '÷', onClick: () => handleOperator('/'), type: 'op' },
    { label: '7', onClick: () => handleNumber('7'), type: 'num' },
    { label: '8', onClick: () => handleNumber('8'), type: 'num' },
    { label: '9', onClick: () => handleNumber('9'), type: 'num' },
    { label: '×', onClick: () => handleOperator('*'), type: 'op' },
    { label: '4', onClick: () => handleNumber('4'), type: 'num' },
    { label: '5', onClick: () => handleNumber('5'), type: 'num' },
    { label: '6', onClick: () => handleNumber('6'), type: 'num' },
    { label: '-', onClick: () => handleOperator('-'), type: 'op' },
    { label: '1', onClick: () => handleNumber('1'), type: 'num' },
    { label: '2', onClick: () => handleNumber('2'), type: 'num' },
    { label: '3', onClick: () => handleNumber('3'), type: 'num' },
    { label: '+', onClick: () => handleOperator('+'), type: 'op' },
    { label: '0', onClick: () => handleNumber('0'), type: 'num', wide: true },
    { label: '.', onClick: () => handleNumber('.'), type: 'num' },
    { label: '=', onClick: handleCalculate, type: 'op' },
  ];

  return (
    <div className="h-full bg-black flex flex-col p-1 text-white">
      <div className="flex-1 flex items-end justify-end px-4 pb-2 text-5xl font-light tabular-nums break-all">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-px bg-black">
        {buttons.map((btn) => (
          <button
            key={btn.label}
            onClick={btn.onClick}
            className={`
              h-16 flex items-center justify-center text-2xl active:opacity-70
              ${btn.wide ? 'col-span-2 pl-6 justify-start' : ''}
              ${btn.type === 'op' ? 'bg-[#ff9f0a] text-white' : btn.type === 'func' ? 'bg-[#a5a5a5] text-black' : 'bg-[#333333] text-white'}
              ${btn.wide ? 'rounded-full' : 'rounded-full w-16 h-16 m-1'}
            `}
            style={btn.wide ? { width: 'calc(100% - 8px)', margin: '4px' } : {}}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};
