import React, { useState, useEffect, useCallback } from 'react';
import { evaluate } from 'mathjs';

export const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [newNumber, setNewNumber] = useState(true);
  const [memory, setMemory] = useState<number>(0);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [scientificMode, setScientificMode] = useState(false);

  const handleNumber = useCallback((num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' && num !== '.' ? num : display + num);
    }
  }, [display, newNumber]);

  const handleOperator = useCallback((op: string) => {
    setExpression(display + op);
    setNewNumber(true);
  }, [display]);

  const handleCalculate = useCallback(() => {
    try {
      // Handle scientific functions replacement for mathjs
      let evalExpr = (expression + display)
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'pi')
        .replace(/√/g, 'sqrt');

      const result = evaluate(evalExpr);
      const resultStr = parseFloat(result.toFixed(10)).toString(); // Avoid floating point errors
      
      setHistory(prev => [`${expression}${display} = ${resultStr}`, ...prev.slice(0, 9)]);
      setDisplay(resultStr);
      setExpression('');
      setNewNumber(true);
    } catch (e) {
      setDisplay('Error');
      setNewNumber(true);
    }
  }, [display, expression]);

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
    setNewNumber(true);
  };

  const handleFunction = (func: string) => {
    try {
      let val = parseFloat(display);
      let res = 0;
      switch (func) {
        case 'sin': res = Math.sin(val); break;
        case 'cos': res = Math.cos(val); break;
        case 'tan': res = Math.tan(val); break;
        case 'log': res = Math.log10(val); break;
        case 'ln': res = Math.log(val); break;
        case 'sqrt': res = Math.sqrt(val); break;
        case 'sq': res = Math.pow(val, 2); break;
        case 'cube': res = Math.pow(val, 3); break;
        case '1/x': res = 1 / val; break;
        case '%': res = val / 100; break;
        case '+/-': res = val * -1; break;
        default: return;
      }
      setDisplay(parseFloat(res.toFixed(10)).toString());
      setNewNumber(true);
    } catch (e) {
      setDisplay('Error');
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (/[0-9.]/.test(key)) handleNumber(key);
      if (['+', '-', '*', '/'].includes(key)) handleOperator(key === '*' ? '×' : key === '/' ? '÷' : key);
      if (key === 'Enter' || key === '=') handleCalculate();
      if (key === 'Escape') handleClear();
      if (key === 'Backspace') {
        if (!newNumber) {
            setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNumber, handleOperator, handleCalculate, newNumber]);

  const toggleScientific = () => setScientificMode(!scientificMode);

  return (
    <div className="h-full bg-[#1c1c1e] flex flex-col text-white select-none">
      {/* Display */}
      <div className="h-32 flex flex-col justify-end items-end px-6 pb-4 bg-black/20">
        <div className="text-gray-400 text-sm h-6">{expression.replace('*', '×').replace('/', '÷')}</div>
        <div className={`font-light tabular-nums break-all transition-all duration-200 ${display.length > 10 ? 'text-4xl' : 'text-6xl'}`}>
          {display}
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="h-8 flex items-center px-4 gap-2 bg-[#2c2c2e]">
        <button onClick={toggleScientific} className="p-1 rounded hover:bg-white/10 text-xs text-gray-400">
           {scientificMode ? 'Basic' : 'Scientific'}
        </button>
        <button onClick={() => setShowHistory(!showHistory)} className="p-1 rounded hover:bg-white/10 text-xs text-gray-400 ml-auto">
           History
        </button>
      </div>

      {/* History Panel Overlay */}
      {showHistory && (
        <div className="absolute top-40 left-0 right-0 bottom-0 bg-black/90 z-10 p-4 overflow-y-auto backdrop-blur-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-400 font-medium">History</h3>
                <button onClick={() => setHistory([])} className="text-red-400 text-xs">Clear</button>
            </div>
            {history.length === 0 && <div className="text-gray-600 text-center mt-10">No history</div>}
            {history.map((item, i) => (
                <div key={i} className="py-2 border-b border-gray-800 text-right font-mono text-sm text-gray-300">
                    {item}
                </div>
            ))}
        </div>
      )}

      {/* Buttons Grid */}
      <div className={`flex-1 grid gap-px bg-black p-px ${scientificMode ? 'grid-cols-5' : 'grid-cols-4'}`}>
        
        {/* Scientific Column */}
        {scientificMode && (
          <>
            <Btn label="(" onClick={() => {}} bg="bg-[#2c2c2e]" />
            <Btn label=")" onClick={() => {}} bg="bg-[#2c2c2e]" />
            <Btn label="mc" onClick={() => setMemory(0)} bg="bg-[#2c2c2e]" text="text-xs" />
            <Btn label="m+" onClick={() => setMemory(memory + parseFloat(display))} bg="bg-[#2c2c2e]" text="text-xs" />
            <Btn label="m-" onClick={() => setMemory(memory - parseFloat(display))} bg="bg-[#2c2c2e]" text="text-xs" />
            <Btn label="mr" onClick={() => setDisplay(memory.toString())} bg="bg-[#2c2c2e]" text="text-xs" />
          </>
        )}

        {/* Row 1 */}
        {scientificMode && <Btn label="2nd" onClick={() => {}} bg="bg-[#2c2c2e]" text="text-xs" />}
        <Btn label={display === '0' ? 'AC' : 'C'} onClick={handleClear} bg="bg-[#3a3a3c]" text="text-black" />
        <Btn label="+/-" onClick={() => handleFunction('+/-')} bg="bg-[#3a3a3c]" text="text-black" />
        <Btn label="%" onClick={() => handleFunction('%')} bg="bg-[#3a3a3c]" text="text-black" />
        <Btn label="÷" onClick={() => handleOperator('/')} bg="bg-[#ff9f0a]" />

        {/* Row 2 */}
        {scientificMode && <Btn label="x²" onClick={() => handleFunction('sq')} bg="bg-[#2c2c2e]" />}
        <Btn label="7" onClick={() => handleNumber('7')} />
        <Btn label="8" onClick={() => handleNumber('8')} />
        <Btn label="9" onClick={() => handleNumber('9')} />
        <Btn label="×" onClick={() => handleOperator('*')} bg="bg-[#ff9f0a]" />

        {/* Row 3 */}
        {scientificMode && <Btn label="x³" onClick={() => handleFunction('cube')} bg="bg-[#2c2c2e]" />}
        <Btn label="4" onClick={() => handleNumber('4')} />
        <Btn label="5" onClick={() => handleNumber('5')} />
        <Btn label="6" onClick={() => handleNumber('6')} />
        <Btn label="-" onClick={() => handleOperator('-')} bg="bg-[#ff9f0a]" />

        {/* Row 4 */}
        {scientificMode && <Btn label="eˣ" onClick={() => {}} bg="bg-[#2c2c2e]" />}
        <Btn label="1" onClick={() => handleNumber('1')} />
        <Btn label="2" onClick={() => handleNumber('2')} />
        <Btn label="3" onClick={() => handleNumber('3')} />
        <Btn label="+" onClick={() => handleOperator('+')} bg="bg-[#ff9f0a]" />

        {/* Row 5 */}
        {scientificMode && <Btn label="1/x" onClick={() => handleFunction('1/x')} bg="bg-[#2c2c2e]" />}
        <Btn label="0" onClick={() => handleNumber('0')} wide={!scientificMode} />
        <Btn label="." onClick={() => handleNumber('.')} />
        <Btn label="=" onClick={handleCalculate} bg="bg-[#ff9f0a]" />
      </div>
    </div>
  );
};

const Btn: React.FC<{ label: string; onClick: () => void; bg?: string; text?: string; wide?: boolean }> = ({ 
    label, onClick, bg = 'bg-[#505050]', text = 'text-white', wide = false 
}) => (
  <button
    onClick={onClick}
    className={`
      flex items-center justify-center text-xl active:brightness-125 transition-all
      ${bg} ${text} ${wide ? 'col-span-2 pl-8 justify-start' : ''}
    `}
  >
    {label}
  </button>
);
