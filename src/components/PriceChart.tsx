import React, { useEffect, useRef, useState } from 'react';
import { createChart, Time } from 'lightweight-charts';
import { CandleData } from '../types/trading';

interface PriceChartProps {
  containerWidth?: number;
  containerHeight?: number;
  onCandleUpdate?: (currentCandle: CandleData, nextCandle: CandleData | null) => void;
}

const CRYPTO_COMPARE_API = 'https://min-api.cryptocompare.com/data/v2';

const TRADING_PAIRS = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'BNB', name: 'Binance Coin' },
  { symbol: 'SOL', name: 'Solana' },
];

const TIMEFRAMES = [
  { value: 'minute', name: '1 мин' },
  { value: 'minute5', name: '5 мин' },
  { value: 'minute15', name: '15 мин' },
  { value: 'hour', name: '1 час' },
];

const SPEEDS = [
  { value: 100, name: '0.1с' },
  { value: 500, name: '0.5с' },
  { value: 1000, name: '1с' },
  { value: 2000, name: '2с' },
];

const PriceChart: React.FC<PriceChartProps> = ({ 
  containerWidth = 1200, 
  containerHeight = 600,
  onCandleUpdate
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candlestickSeriesRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);
  const currentIndexRef = useRef(10);
  const allCandlesRef = useRef<CandleData[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedPair, setSelectedPair] = useState('BTC');
  const [selectedTimeframe, setSelectedTimeframe] = useState('minute');
  const [selectedSpeed, setSelectedSpeed] = useState(500);
  const [currentPrice, setCurrentPrice] = useState<string>('');

  // Создаем график только при монтировании компонента
  useEffect(() => {
    if (!chartContainerRef.current || chartRef.current) return;

    isActiveRef.current = true;
    
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

    chartRef.current = chart;

    // Создаем серию свечей
    candlestickSeriesRef.current = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    return () => {
      isActiveRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        candlestickSeriesRef.current = null;
      }
    };
  }, []); // Пустой массив зависимостей - эффект выполнится только при монтировании

  // Обновляем размеры графика при изменении контейнера
  useEffect(() => {
    if (!chartRef.current) return;
    
    chartRef.current.applyOptions({
      width: containerWidth,
      height: containerHeight,
    });
  }, [containerWidth, containerHeight]);

  // Загружаем и обновляем данные
  useEffect(() => {
    const loadData = async () => {
      if (!isActiveRef.current || !candlestickSeriesRef.current) return;

      try {
        setIsLoading(true);
        const limit = 1000;
        const response = await fetch(
          `${CRYPTO_COMPARE_API}/histominute?fsym=${selectedPair}&tsym=USD&limit=${limit}&aggregate=${
            selectedTimeframe === 'minute' ? 1 :
            selectedTimeframe === 'minute5' ? 5 :
            selectedTimeframe === 'minute15' ? 15 : 60
          }`
        );
        const data = await response.json();
        
        if (!isActiveRef.current) return;

        if (data.Response === 'Success' && data.Data.Data) {
          allCandlesRef.current = data.Data.Data.map((candle: any) => ({
            time: candle.time,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close
          }));

          currentIndexRef.current = 10;

          if (candlestickSeriesRef.current) {
            candlestickSeriesRef.current.setData(allCandlesRef.current.slice(0, 10));
            
            const lastCandle = allCandlesRef.current[allCandlesRef.current.length - 1];
            setCurrentPrice(lastCandle.close.toFixed(2));
            if (onCandleUpdate) {
              onCandleUpdate(lastCandle, null);
            }
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedPair, selectedTimeframe]);

  // Управляем интервалом обновления
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isPaused && isActiveRef.current && candlestickSeriesRef.current) {
      intervalRef.current = setInterval(() => {
        if (!isActiveRef.current || !candlestickSeriesRef.current) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return;
        }

        if (currentIndexRef.current < allCandlesRef.current.length) {
          candlestickSeriesRef.current.setData(
            allCandlesRef.current.slice(0, currentIndexRef.current + 1)
          );
          if (onCandleUpdate) {
            const currentCandle = allCandlesRef.current[currentIndexRef.current];
            const nextCandle = currentIndexRef.current + 1 < allCandlesRef.current.length 
              ? allCandlesRef.current[currentIndexRef.current + 1] 
              : null;
            onCandleUpdate(currentCandle, nextCandle);
          }
          currentIndexRef.current++;
        } else {
          currentIndexRef.current = 10;
          candlestickSeriesRef.current.setData(allCandlesRef.current.slice(0, 10));
        }
      }, selectedSpeed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused, selectedSpeed, onCandleUpdate]);

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
  };

  const handlePairChange = (pair: string) => {
    setSelectedPair(pair);
    currentIndexRef.current = 10;
  };

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
    currentIndexRef.current = 10;
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