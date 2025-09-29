import React, { useState } from 'react';
import {
  Layout,
  Card,
  Select,
  Switch,
  Button,
  List,
  InputNumber,
  DatePicker,
  Popconfirm,
  Typography,
  Space,
  Divider,
  Badge,
  Tooltip,
  Slider
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  DownloadOutlined,
  PlayCircleOutlined,
  ExperimentOutlined,
  InfoCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { Point, AppMode, ObjectType } from '../types';
import dayjs from 'dayjs';

const { Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

interface SidebarProps {
  mode: AppMode;
  selectedObjectType: string;
  noiseLevel: number;
  points: Point[];
  isLoading: boolean;
  collapsed: boolean;
  highlightedPoint: string | null;
  jumpToPointEnabled: boolean;
  onCollapseChange: (collapsed: boolean) => void;
  onModeChange: (mode: AppMode) => void;
  onObjectTypeChange: (objectType: string) => void;
  onNoiseLevelChange: (noiseLevel: number) => void;
  onPointUpdate: (pointId: string, updates: Partial<Point>) => void;
  onPointDelete: (pointId: string) => void;
  onPointHover: (pointId: string | null) => void;
  onPointClick: (pointId: string) => void;
  onSave: () => void;
  onExport: () => void;
}

const objectTypes: { value: ObjectType; label: string; color: string }[] = [
  { value: 'drone', label: 'Drone', color: '#1890ff' },
  { value: 'plane', label: 'Plane', color: '#52c41a' },
  { value: 'bird', label: 'Bird', color: '#faad14' },
  { value: 'storm', label: 'Storm', color: '#8c8c8c' },
];

const Sidebar: React.FC<SidebarProps> = ({
  mode,
  selectedObjectType,
  noiseLevel,
  points,
  isLoading,
  collapsed,
  highlightedPoint,
  jumpToPointEnabled,
  onCollapseChange,
  onModeChange,
  onObjectTypeChange,
  onNoiseLevelChange,
  onPointUpdate,
  onPointDelete,
  onPointHover,
  onPointClick,
  onSave,
  onExport,
}) => {
  const [editingPoint, setEditingPoint] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Point>>({});

  const handleEditStart = (point: Point) => {
    setEditingPoint(point.point_id);
    setEditValues({
      altitude: point.altitude,
      timestamp: point.timestamp,
    });
  };

  const handleEditSave = (pointId: string) => {
    onPointUpdate(pointId, editValues);
    setEditingPoint(null);
    setEditValues({});
  };

  const handleEditCancel = () => {
    setEditingPoint(null);
    setEditValues({});
  };

  const sortedPoints = [...points].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  ).reverse();

  const getModeIcon = (currentMode: AppMode) => {
    return currentMode === 'training' ? <ExperimentOutlined /> : <PlayCircleOutlined />;
  };

  const getModeColor = (currentMode: AppMode) => {
    return currentMode === 'training' ? '#52c41a' : '#1890ff';
  };

  return (
    <>
      {/* Collapse/Expand Button - Fixed position */}
      <Button
        type="primary"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => onCollapseChange(!collapsed)}
        style={{
          position: 'fixed',
          top: '16px',
          left: collapsed ? '50px' : '300px',
          zIndex: 1001,
          transition: 'left 0.3s ease',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      />

      <Sider
        width={350}
        collapsed={collapsed}
        collapsedWidth={0}
        style={{
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
          height: '100vh',
          overflow: 'auto',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 1000,
          transition: 'all 0.3s ease',
        }}
      >
        <div style={{ padding: collapsed ? '0' : '16px', paddingTop: collapsed ? '0' : '60px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            Ground Truth Data Creator
          </Title>
          <Text type="secondary">XGBoost Training Data</Text>
        </div>

        {/* Mode Switch */}
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text strong>Mode</Text>
              <Tooltip title={mode === 'training' ? 'Switch to Testing Mode' : 'Switch to Training Mode'}>
                <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
              </Tooltip>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Badge color={getModeColor('training')} />
              <Text>Training</Text>
              <Switch
                style={{backgroundColor: mode === 'testing' ? '#1890ff' : '#434343'}}
                checked={mode === 'testing'}
                onChange={(checked) => onModeChange(checked ? 'testing' : 'training')}
                loading={isLoading}
              />
              <Text>Testing</Text>
              <Badge color={getModeColor('testing')} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
              {getModeIcon(mode)}
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {mode === 'training' ? 'Create new labeled courses' : 'Identify object types'}
              </Text>
            </div>
          </Space>
        </Card>

        {/* Object Type Selector */}
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>
              {mode === 'training' ? 'Object Type' : 'What object type is this?'}
            </Text>
            <Select
              value={selectedObjectType}
              onChange={onObjectTypeChange}
              style={{ width: '100%' }}
              size="large"
              disabled={isLoading}
            >
            {objectTypes.map((type) => (
              <Option key={type.value} value={type.value}>
                <Space>
                  <Badge color={type.color} />
                  {type.label}
                </Space>
              </Option>
            ))}
          </Select>
        </Space>
      </Card>

      {/* Noise Level Control */}
      {mode === 'training' && (
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>Noise Level (%)</Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Slider
                min={0}
                max={100}
                value={noiseLevel}
                onChange={onNoiseLevelChange}
                style={{ flex: 1 }}
                tooltip={{ formatter: (value) => `${value}%` }}
                disabled={isLoading}
              />
              <InputNumber
                min={0}
                max={100}
                value={noiseLevel}
                onChange={(value) => onNoiseLevelChange(value || 0)}
                style={{ width: '60px' }}
                size="small"
                disabled={isLoading}
                formatter={(value) => `${value}%`}
                parser={(value) => parseInt(value?.replace('%', '') || '0')}
              />
            </div>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Percentage of measurement noise in the data
            </Text>
          </Space>
        </Card>
      )}

        {/* Points List */}
        <Card
          size="small"
          title={
            <Space>
              <Text strong>Points</Text>
              <Badge count={points.length} style={{ backgroundColor: '#52c41a' }} />
            </Space>
          }
          style={{ marginBottom: '16px' }}
        >
          {points.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Text type="secondary">
                {mode === 'training' 
                  ? 'Click on the map to add points' 
                  : 'Course points will appear here'
                }
              </Text>
            </div>
          ) : (
            <List
              size="small"
              dataSource={sortedPoints}
              renderItem={(point, index) => (
                <List.Item
                  key={point.point_id}
                  onMouseEnter={() => onPointHover(point.point_id)}
                  onMouseLeave={() => onPointHover(null)}
                  onClick={() => onPointClick(point.point_id)}
                  style={{
                    backgroundColor: 'transparent',
                    borderRadius: '4px',
                    margin: '2px 0',
                    cursor: jumpToPointEnabled ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                    border: highlightedPoint === point.point_id ? '1px solid #1890ff' : '1px solid transparent',
                    transform: highlightedPoint === point.point_id ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: highlightedPoint === point.point_id ? '0 2px 8px rgba(24, 144, 255, 0.2)' : 'none',
                  }}
                  actions={
                    mode === 'training'
                      ? [
                          <Tooltip title="Edit point">
                            <Button
                              type="text"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => handleEditStart(point)}
                            />
                          </Tooltip>,
                          <Popconfirm
                            title="Delete this point?"
                            onConfirm={() => onPointDelete(point.point_id)}
                          >
                            <Tooltip title="Delete point">
                              <Button
                                type="text"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                              />
                            </Tooltip>
                          </Popconfirm>,
                        ]
                      : []
                  }
                >
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong>
                        Point {index + 1} {index === 0 && '(End)'} {index === points.length - 1 && '(Start)'}
                      </Text>
                    </div>
                    
                    {editingPoint === point.point_id ? (
                      <div style={{ marginTop: '8px' }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div>
                            <Text style={{ fontSize: '12px' }}>Altitude (m):</Text>
                            <InputNumber
                              size="small"
                              value={editValues.altitude}
                              onChange={(value) => setEditValues({ ...editValues, altitude: value || 0 })}
                              style={{ width: '100%' }}
                              min={0}
                              max={10000}
                            />
                          </div>
                          <div>
                            <Text style={{ fontSize: '12px' }}>Time:</Text>
                            <DatePicker
                              size="small"
                              showTime
                              value={editValues.timestamp ? dayjs(editValues.timestamp) : dayjs()}
                              onChange={(date) => setEditValues({ ...editValues, timestamp: date?.toDate() })}
                              style={{ width: '100%' }}
                            />
                          </div>
                          <Space>
                            <Button size="small" type="primary" onClick={() => handleEditSave(point.point_id)}>
                              Save
                            </Button>
                            <Button size="small" onClick={handleEditCancel}>
                              Cancel
                            </Button>
                          </Space>
                        </Space>
                      </div>
                    ) : (
                      <div style={{ marginTop: '4px' }}>
                        <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                          Lat: {point.lat.toFixed(6)}, Lng: {point.lon.toFixed(6)}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                          Alt: {point.altitude}m
                        </Text>
                        <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                          Time: {new Date(point.timestamp).toLocaleTimeString()}
                        </Text>
                      </div>
                    )}
                  </div>
                </List.Item>
              )}
            />
          )}
        </Card>

        {/* Action Buttons */}
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            onClick={onSave}
            loading={isLoading}
            disabled={mode === 'training' && points.length < 2}
            block
          >
            {mode === 'training' ? 'Save Course' : 'Submit Answer'}
          </Button>

          {mode === 'training' && (
            <Button
              type="default"
              size="large"
              icon={<DownloadOutlined />}
              onClick={onExport}
              loading={isLoading}
              block
            >
              Export Data
            </Button>
          )}
        </Space>

        {/* Instructions */}
        <Divider />
        <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
          <Text style={{ fontSize: '12px', color: '#52c41a' }}>
            <strong>Instructions:</strong><br />
            {mode === 'training' ? (
              <>
                • Click on map to add points<br />
                • Drag points to adjust position<br />
                • Edit altitude and time for each point<br />
                • Select object type and save course
              </>
            ) : (
              <>
                • Study the course path on the map<br />
                • Analyze the movement pattern<br />
                • Select what you think the object type is<br />
                • Submit your answer to see if correct
              </>
            )}
          </Text>
        </Card>
        </div>
      </Sider>
    </>
  );
};

export default Sidebar;
