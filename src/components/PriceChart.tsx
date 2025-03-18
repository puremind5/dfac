import React, { useEffect, useRef, useState } from 'react';
import { createChart, Time } from 'lightweight-charts';

interface PriceChartProps {
  containerWidth?: number;
  containerHeight?: number;
}

interface CandleData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

const TRADING_PAIRS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin' },
  { symbol: 'ETHUSDT', name: 'Ethereum' },
  { symbol: 'BNBUSDT', name: 'Binance Coin' },
  { symbol: 'SOLUSDT', name: 'Solana' },
];

const TIMEFRAMES = [
  { value: '1m', name: '1 мин' },
  { value: '5m', name: '5 мин' },
  { value: '15m', name: '15 мин' },
  { value: '1h', name: '1 час' },
];

const SPEEDS = [
  { value: 100, name: '0.1с' },
  { value: 500, name: '0.5с' },
  { value: 1000, name: '1с' },
  { value: 2000, name: '2с' },
];

const PriceChart: React.FC<PriceChartProps> = ({ 
  containerWidth = 1200, 
  containerHeight = 600 
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedPair, setSelectedPair] = useState('BTCUSDT');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1m');
  const [selectedSpeed, setSelectedSpeed] = useState(500);
  const [currentPrice, setCurrentPrice] = useState<string>('');

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Создаем график
    const chart = createChart(chartContainerRef.current, {
      width: containerWidth,
      height: containerHeight,
      layout: {
        background: { color: '#1a0b2e' },
        textColor: '#00f0ff',
        fontSize: 12,
      },
      grid: {
        vertLines: { color: '#2c1b4d' },
        horzLines: { color: '#2c1b4d' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: '#2c1b4d',
        fixLeftEdge: false,
        fixRightEdge: false,
        minBarSpacing: 10,
        rightOffset: 12,
        barSpacing: 12,
      },
      rightPriceScale: {
        borderColor: '#2c1b4d',
        scaleMargins: {
          top: 0.2,
          bottom: 0.2,
        },
        autoScale: true,
      },
      crosshair: {
        vertLine: {
          color: '#00f0ff',
          width: 1,
          style: 3,
        },
        horzLine: {
          color: '#00f0ff',
          width: 1,
          style: 3,
        },
      },
    });

    // Создаем серию свечей
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    let allCandles: CandleData[] = [];
    let currentIndex = 0;
    let interval: NodeJS.Timeout | null = null;

    // Функция для загрузки данных
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Загружаем данные с Binance API
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${selectedPair}&interval=${selectedTimeframe}&limit=1000`);
        const data = await response.json();
        
        // Преобразуем данные в нужный формат
        allCandles = data.map((candle: any[]) => ({
          time: candle[0] as Time,
          open: parseFloat(candle[1]),
          high: parseFloat(candle[2]),
          low: parseFloat(candle[3]),
          close: parseFloat(candle[4])
        }));

        // Показываем первые 10 свечей
        candlestickSeries.setData(allCandles.slice(0, 10));
        currentIndex = 10;
        
        // Обновляем текущую цену
        setCurrentPrice(allCandles[allCandles.length - 1].close.toFixed(2));
        
        // Очищаем предыдущий интервал
        if (interval) {
          clearInterval(interval);
        }
        
        // Запускаем проигрывание только если не на паузе
        if (!isPaused) {
          interval = setInterval(() => {
            if (currentIndex < allCandles.length) {
              candlestickSeries.setData(allCandles.slice(0, currentIndex + 1));
              currentIndex++;
            } else {
              currentIndex = 10;
              candlestickSeries.setData(allCandles.slice(0, 10));
            }
          }, selectedSpeed);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Загружаем данные при изменении пары или таймфрейма
    loadData();

    // Очистка
    return () => {
      if (interval) {
        clearInterval(interval);
      }
      chart.remove();
    };
  }, [containerWidth, containerHeight, selectedPair, selectedTimeframe, selectedSpeed, isPaused]);

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
  };

  const handlePairChange = (pair: string) => {
    setSelectedPair(pair);
    currentIndex = 10;
  };

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
    currentIndex = 10;
  };

  const handleSpeedChange = (speed: number) => {
    setSelectedSpeed(speed);
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#1a0b2e', 
        borderBottom: '1px solid #2c1b4d',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={handlePauseToggle}
          style={{
            padding: '8px 16px',
            backgroundColor: isPaused ? '#26a69a' : '#ef5350',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {isPaused ? 'Продолжить' : 'Пауза'}
        </button>

        <div style={{ display: 'flex', gap: '5px' }}>
          {TRADING_PAIRS.map(pair => (
            <button
              key={pair.symbol}
              onClick={() => handlePairChange(pair.symbol)}
              style={{
                padding: '8px 16px',
                backgroundColor: selectedPair === pair.symbol ? '#00f0ff' : '#2c1b4d',
                color: selectedPair === pair.symbol ? '#1a0b2e' : '#00f0ff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {pair.name}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '5px' }}>
          {TIMEFRAMES.map(tf => (
            <button
              key={tf.value}
              onClick={() => handleTimeframeChange(tf.value)}
              style={{
                padding: '8px 16px',
                backgroundColor: selectedTimeframe === tf.value ? '#00f0ff' : '#2c1b4d',
                color: selectedTimeframe === tf.value ? '#1a0b2e' : '#00f0ff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {tf.name}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '5px' }}>
          {SPEEDS.map(speed => (
            <button
              key={speed.value}
              onClick={() => handleSpeedChange(speed.value)}
              style={{
                padding: '8px 16px',
                backgroundColor: selectedSpeed === speed.value ? '#00f0ff' : '#2c1b4d',
                color: selectedSpeed === speed.value ? '#1a0b2e' : '#00f0ff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {speed.name}
            </button>
          ))}
        </div>

        <div style={{ 
          marginLeft: 'auto',
          color: '#00f0ff',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          {currentPrice} USDT
        </div>
      </div>

      <div 
        ref={chartContainerRef} 
        style={{ 
          flex: 1,
          position: 'relative'
        }} 
      >
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#00f0ff',
            fontSize: '16px'
          }}>
            Загрузка данных...
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceChart;