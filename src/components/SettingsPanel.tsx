import React from 'react';
import { Card, Switch, Tooltip } from 'antd';
import { AimOutlined, EnvironmentOutlined, SettingOutlined, UpOutlined, DownOutlined, BulbOutlined, ClockCircleOutlined } from '@ant-design/icons';

interface SettingsPanelProps {
  autoZoomEnabled: boolean;
  jumpToPointEnabled: boolean;
  settingsExpanded: boolean;
  darkMode: boolean;
  autoIncrementTime: boolean;
  onAutoZoomChange: (enabled: boolean) => void;
  onJumpToPointChange: (enabled: boolean) => void;
  onExpandedChange: (expanded: boolean) => void;
  onDarkModeChange: (enabled: boolean) => void;
  onAutoIncrementTimeChange: (enabled: boolean) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  autoZoomEnabled,
  jumpToPointEnabled,
  settingsExpanded,
  darkMode,
  autoIncrementTime,
  onAutoZoomChange,
  onJumpToPointChange,
  onExpandedChange,
  onDarkModeChange,
  onAutoIncrementTimeChange,
}) => {
  return (
    <Card
      size="small"
      className="settings-panel"
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 1001,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.2)',
        minWidth: '200px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
    >
      {/* Settings Header */}
      <div 
        className="settings-header"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: settingsExpanded ? '12px' : '0',
          padding: '4px',
          borderRadius: '6px',
        }}
        onClick={() => onExpandedChange(!settingsExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SettingOutlined style={{ color: darkMode ? 'white' : '#1890ff' }} />
          <span style={{ fontWeight: 600, color: darkMode ? 'white' : '#1890ff', fontSize: '14px' }}>
            Settings
          </span>
        </div>
        {settingsExpanded ? (
          <UpOutlined style={{ color: '#8c8c8c', fontSize: '12px' }} />
        ) : (
          <DownOutlined style={{ color: '#8c8c8c', fontSize: '12px' }} />
        )}
      </div>

      {/* Settings Content */}
      {settingsExpanded && (
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px',
            animation: 'slideDown 0.3s ease-out'
          }}
        >
          {/* Dark Mode Setting */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BulbOutlined style={{ color: darkMode ? '#faad14' : '#8c8c8c' }} />
              <span style={{ fontSize: '13px', color: darkMode ? 'white' : '#8c8c8c' }}>
                Dark Mode
              </span>
            </div>
            <Tooltip title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
                <Switch
                  size="small"
                  checked={darkMode}
                  onChange={onDarkModeChange}
                  className={darkMode ? 'dark-switch-yellow' : ''}
                />
            </Tooltip>
          </div>

          {/* Auto Zoom Setting */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AimOutlined style={{ color: autoZoomEnabled ? (darkMode ? '#1890ff' : '#1890ff') : '#8c8c8c' }} />
              <span style={{ fontSize: '13px', color: autoZoomEnabled ? (darkMode ? 'white' : '#1890ff') : '#8c8c8c' }}>
                Auto Zoom
              </span>
            </div>
              <Tooltip title={autoZoomEnabled ? 'Map adjusts when adding points' : 'Map stays fixed when adding points'}>
                <Switch
                  size="small"
                  checked={autoZoomEnabled}
                  onChange={onAutoZoomChange}
                  className={autoZoomEnabled && darkMode ? 'dark-switch-blue' : ''}
                />
              </Tooltip>
          </div>

          {/* Jump to Point Setting */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <EnvironmentOutlined style={{ color: jumpToPointEnabled ? '#52c41a' : '#8c8c8c' }} />
              <span style={{ fontSize: '13px', color: jumpToPointEnabled ? (darkMode ? 'white' : '#52c41a') : '#8c8c8c' }}>
                Jump to Point
              </span>
            </div>
              <Tooltip title={jumpToPointEnabled ? 'Click point cards to center map' : 'Point cards won\'t move map'}>
                <Switch
                  size="small"
                  checked={jumpToPointEnabled}
                  onChange={onJumpToPointChange}
                  className={jumpToPointEnabled ? 'dark-switch-green' : ''}
                />
              </Tooltip>
          </div>

          {/* Auto Increment Time Setting */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClockCircleOutlined style={{ color: autoIncrementTime ? '#722ed1' : '#8c8c8c' }} />
              <span style={{ fontSize: '13px', color: autoIncrementTime ? (darkMode ? 'white' : '#722ed1') : '#8c8c8c' }}>
                Auto Time
              </span>
            </div>
              <Tooltip title={autoIncrementTime ? 'Time increments automatically when adding points' : 'Time stays fixed when adding points'}>
                <Switch
                  size="small"
                  checked={autoIncrementTime}
                  onChange={onAutoIncrementTimeChange}
                  className={autoIncrementTime ? 'dark-switch-purple' : ''}
                />
              </Tooltip>
          </div>
        </div>
      )}
    </Card>
  );
};

export default SettingsPanel;
