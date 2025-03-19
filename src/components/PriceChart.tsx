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
    <div className="flex flex-col gap-4">
      {/* График */}
      <div ref={chartContainerRef} className="w-full" />

      {/* Панель управления */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1a0b2e] border-t border-[#2c1b4d] p-2 sm:p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center items-center">
            {/* Пауза */}
            <button
              onClick={handlePauseToggle}
              className={`px-4 py-2 rounded-lg font-bold ${
                isPaused
                  ? 'bg-gradient-to-r from-red-500 to-[#ff1f8f] text-white'
                  : 'bg-gradient-to-r from-green-500 to-[#00f0ff] text-white'
              }`}
            >
              {isPaused ? 'Пауза' : 'Старт'}
            </button>

            {/* Криптовалюты */}
            {TRADING_PAIRS.map(pair => (
              <button
                key={pair.symbol}
                onClick={() => handlePairChange(pair.symbol)}
                className={`px-4 py-2 rounded-lg font-bold ${
                  selectedPair === pair.symbol
                    ? 'bg-[#00f0ff] text-[#1a0b2e]'
                    : 'bg-[#2c1b4d] text-[#00f0ff] hover:bg-[#3d2b5e]'
                }`}
              >
                {pair.name}
              </button>
            ))}

            {/* Таймфреймы */}
            {TIMEFRAMES.map(tf => (
              <button
                key={tf.value}
                onClick={() => handleTimeframeChange(tf.value)}
                className={`px-4 py-2 rounded-lg font-bold ${
                  selectedTimeframe === tf.value
                    ? 'bg-[#00f0ff] text-[#1a0b2e]'
                    : 'bg-[#2c1b4d] text-[#00f0ff] hover:bg-[#3d2b5e]'
                }`}
              >
                {tf.name}
              </button>
            ))}

            {/* Скорость */}
            {SPEEDS.map(speed => (
              <button
                key={speed.value}
                onClick={() => handleSpeedChange(speed.value)}
                className={`px-4 py-2 rounded-lg font-bold ${
                  selectedSpeed === speed.value
                    ? 'bg-[#00f0ff] text-[#1a0b2e]'
                    : 'bg-[#2c1b4d] text-[#00f0ff] hover:bg-[#3d2b5e]'
                }`}
              >
                {speed.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceChart;