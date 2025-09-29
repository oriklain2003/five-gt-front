import React, { useState, useEffect } from 'react';
import { Card, InputNumber, Button, Select, Switch, Tooltip, TimePicker } from 'antd';
import dayjs from 'dayjs';
import { 
  PlayCircleOutlined, 
  PlusOutlined, 
  MinusOutlined, 
  FastForwardOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';

const { Option } = Select;

interface TimeControlProps {
  currentTime: Date;
  onTimeChange: (time: Date) => void;
  autoIncrement: boolean;
  onAutoIncrementChange: (enabled: boolean) => void;
  darkMode: boolean;
  onIncrementSettingsChange: (unit: 'minutes' | 'seconds' | 'milliseconds', value: number) => void;
  points: Array<{ timestamp: Date }>;
}

const TimeControl: React.FC<TimeControlProps> = ({
  currentTime,
  onTimeChange,
  autoIncrement,
  onAutoIncrementChange,
  darkMode,
  onIncrementSettingsChange,
  points,
}) => {
  const [timeUnit, setTimeUnit] = useState<'minutes' | 'seconds' | 'milliseconds'>('seconds');
  const [incrementValue, setIncrementValue] = useState<number>(1);

  // Notify parent when increment settings change
  useEffect(() => {
    onIncrementSettingsChange(timeUnit, incrementValue);
  }, [timeUnit, incrementValue, onIncrementSettingsChange]);

  // Check if current time would cause validation error
  const isTimeValid = () => {
    if (points.length === 0) return true;
    
    const sortedPoints = [...points].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    const latestPoint = sortedPoints[sortedPoints.length - 1];
    const latestTimestamp = new Date(latestPoint.timestamp);
    
    return currentTime.getTime() > latestTimestamp.getTime();
  };

  // Format time display
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
    
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  };

  // Increment time by specified amount
  const incrementTime = (amount: number) => {
    const newTime = new Date(currentTime);
    
    switch (timeUnit) {
      case 'minutes':
        newTime.setMinutes(newTime.getMinutes() + amount);
        break;
      case 'seconds':
        newTime.setSeconds(newTime.getSeconds() + amount);
        break;
      case 'milliseconds':
        newTime.setMilliseconds(newTime.getMilliseconds() + amount);
        break;
    }
    
    onTimeChange(newTime);
  };

  // Jump by increment value
  const jumpTime = () => {
    incrementTime(incrementValue);
  };

  // Decrease time
  const decreaseTime = () => {
    incrementTime(-1);
  };

  // Increase time
  const increaseTime = () => {
    incrementTime(1);
  };

  // Handle manual time change
  const handleManualTimeChange = (time: dayjs.Dayjs | null) => {
    if (time) {
      const newDate = new Date(currentTime);
      newDate.setHours(time.hour(), time.minute(), time.second(), time.millisecond());
      onTimeChange(newDate);
    }
  };

  return (
    <Card
      size="small"
      style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1001,
        background: darkMode ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        borderRadius: '12px',
        border: darkMode ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(0,0,0,0.1)',
        minWidth: '500px',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {/* Clock Display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ClockCircleOutlined style={{ color: darkMode ? '#1890ff' : '#1890ff' }} />
          <Tooltip title={!isTimeValid() ? 'Warning: This time is not later than the previous point' : 'Current time for new points'}>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '16px',
                fontWeight: 'bold',
                color: !isTimeValid() ? '#ff4d4f' : (darkMode ? 'white' : '#1890ff'),
                minWidth: '140px',
                textAlign: 'center',
                padding: '4px 8px',
                backgroundColor: !isTimeValid() ? 'rgba(255, 77, 79, 0.1)' : (darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(24, 144, 255, 0.1)'),
                borderRadius: '6px',
                border: !isTimeValid() ? '1px solid rgba(255, 77, 79, 0.5)' : (darkMode ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(24, 144, 255, 0.2)'),
                transition: 'all 0.3s ease',
              }}
            >
              {formatTime(currentTime)}
            </div>
          </Tooltip>
        </div>

        {/* Manual Time Picker */}
        <Tooltip title="Set time manually">
          <TimePicker
            value={dayjs(currentTime)}
            onChange={handleManualTimeChange}
            format="HH:mm:ss"
            size="small"
            showNow={false}
            style={{ width: '100px' }}
          />
        </Tooltip>

        {/* Time Unit Selector */}
        <Select
          value={timeUnit}
          onChange={setTimeUnit}
          size="small"
          style={{ width: '100px' }}
        >
          <Option value="minutes">Minutes</Option>
          <Option value="seconds">Seconds</Option>
          <Option value="milliseconds">Ms</Option>
        </Select>

        {/* Increment Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Tooltip title="Decrease by 1">
            <Button
              size="small"
              icon={<MinusOutlined />}
              onClick={decreaseTime}
              style={{
                backgroundColor: darkMode ? '#333333' : undefined,
                borderColor: darkMode ? '#555555' : undefined,
                color: darkMode ? 'white' : undefined,
              }}
            />
          </Tooltip>
          
          <Tooltip title="Increase by 1">
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={increaseTime}
              style={{
                backgroundColor: darkMode ? '#333333' : undefined,
                borderColor: darkMode ? '#555555' : undefined,
                color: darkMode ? 'white' : undefined,
              }}
            />
          </Tooltip>
        </div>

        {/* Jump Amount Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <InputNumber
            size="small"
            value={incrementValue}
            onChange={(value) => setIncrementValue(value || 1)}
            min={1}
            max={999}
            style={{ width: '60px' }}
          />
          
          <Tooltip title={`Jump by ${incrementValue} ${timeUnit}`}>
            <Button
              size="small"
              icon={<FastForwardOutlined />}
              onClick={jumpTime}
              type="primary"
              style={{
                backgroundColor: darkMode ? 'white' : '#1890ff',
                borderColor: darkMode ? 'white' : '#1890ff',
                color: darkMode ? '#000000' : 'white',
              }}
            />
          </Tooltip>
        </div>

        {/* Auto Increment Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PlayCircleOutlined 
            style={{ 
              color: autoIncrement ? '#52c41a' : '#8c8c8c',
              fontSize: '14px'
            }} 
          />
          <Tooltip title={autoIncrement ? `Auto-increment by ${incrementValue} ${timeUnit} on each point` : 'Manual time control'}>
            <Switch
              size="small"
              checked={autoIncrement}
              onChange={onAutoIncrementChange}
              className={autoIncrement ? 'dark-switch-green' : ''}
            />
          </Tooltip>
          <span style={{ 
            fontSize: '11px', 
            color: autoIncrement ? (darkMode ? 'white' : '#52c41a') : '#8c8c8c',
            fontWeight: 500
          }}>
            Auto
          </span>
        </div>
      </div>
    </Card>
  );
};

export default TimeControl;
