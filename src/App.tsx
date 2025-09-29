import React, { useState, useEffect } from 'react';
import { Layout, message } from 'antd';
import MapComponent from './components/MapComponent';
import Sidebar from './components/Sidebar';
import SettingsPanel from './components/SettingsPanel';
import TimeControl from './components/TimeControl';
import { Course, Point, AppMode } from './types';
import { courseService } from './services/courseService';
import 'leaflet/dist/leaflet.css';
import 'antd/dist/reset.css';
import './styles/index.css';

const { Content } = Layout;

function App() {
  const [mode, setMode] = useState<AppMode>('training');
  const [selectedObjectType, setSelectedObjectType] = useState<string>('drone');
  const [noiseLevel, setNoiseLevel] = useState<number>(0);
  const [points, setPoints] = useState<Point[]>([]);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [autoZoomEnabled, setAutoZoomEnabled] = useState(false);
  const [jumpToPointEnabled, setJumpToPointEnabled] = useState(true);
  const [highlightedPoint, setHighlightedPoint] = useState<string | null>(null);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([32.0853, 34.7818]);
  const [mapZoom, setMapZoom] = useState(10);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [autoIncrementTime, setAutoIncrementTime] = useState(true);
  const [incrementUnit, setIncrementUnit] = useState<'minutes' | 'seconds' | 'milliseconds'>('seconds');
  const [incrementValue, setIncrementValue] = useState<number>(1);

  // Load random course for testing mode
  const loadTestingCourse = async () => {
    try {
      setIsLoading(true);
      const course = await courseService.getRandomTestingCourse();
      setCurrentCourse(course);
      setPoints(course.points || []);
      message.info('Testing course loaded. Identify the object type!');
    } catch (error) {
      message.error('Failed to load testing course');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle mode change
  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    if (newMode === 'testing') {
      loadTestingCourse();
    } else {
      // Reset for training mode
      setPoints([]);
      setCurrentCourse(null);
      setSelectedObjectType('drone');
      setNoiseLevel(0);
    }
  };

  // Validate timestamp against existing points
  const validateTimestamp = (newTimestamp: Date): boolean => {
    if (points.length === 0) return true;
    
    // Sort points by timestamp to find the latest one
    const sortedPoints = [...points].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    const latestPoint = sortedPoints[sortedPoints.length - 1];
    const latestTimestamp = new Date(latestPoint.timestamp);
    
    return newTimestamp.getTime() > latestTimestamp.getTime();
  };

  // Add point to map
  const handleAddPoint = (lat: number, lng: number) => {
    if (mode === 'testing') {
      message.warning('Cannot add points in testing mode');
      return;
    }

    // Validate timestamp
    if (!validateTimestamp(currentTime)) {
      message.error('Cannot add point: timestamp must be later than the previous point');
      return;
    }
    if (autoIncrementTime) {
      autoIncrementCurrentTime();
    }
    const newPoint: Point = {
      point_id: `p${points.length + 1}`,
      lat,
      lon: lng,
      altitude: 100, // Default altitude
      timestamp: new Date(currentTime)
    };

    setPoints([...points, newPoint]);


  };

  // Validate timestamp for point updates
  const validateTimestampForUpdate = (pointId: string, newTimestamp: Date): boolean => {
    const otherPoints = points.filter(p => p.point_id !== pointId);
    if (otherPoints.length === 0) return true;
    
    // Check if new timestamp conflicts with any existing point
    return !otherPoints.some(point => 
      new Date(point.timestamp).getTime() === newTimestamp.getTime()
    );
  };

  // Update point
  const handleUpdatePoint = (pointId: string, updates: Partial<Point>) => {
    if (mode === 'testing') {
      message.warning('Cannot modify points in testing mode');
      return;
    }

    // Validate timestamp if it's being updated
    if (updates.timestamp && !validateTimestampForUpdate(pointId, updates.timestamp)) {
      message.error('Cannot update point: timestamp conflicts with another point');
      return;
    }

    setPoints(points.map(point => 
      point.point_id === pointId ? { ...point, ...updates } : point
    ));
  };

  // Delete point
  const handleDeletePoint = (pointId: string) => {
    if (mode === 'testing') {
      message.warning('Cannot delete points in testing mode');
      return;
    }

    setPoints(points.filter(point => point.point_id !== pointId));
  };

  // Save course
  const handleSaveCourse = async () => {
    if (points.length < 2) {
      message.error('Please add at least 2 points to create a course');
      return;
    }

    try {
      setIsLoading(true);
      
      if (mode === 'training') {
        const courseData = {
          object_type: selectedObjectType,
          mode: 'training' as const,
          created_by: 'user',
          noise_level: noiseLevel,
          points: points.map(({ point_id, ...point }) => point)
        };

        const savedCourse = await courseService.createCourse(courseData);
        setCurrentCourse(savedCourse);
        message.success('Course saved successfully!');
      } else {
        // Testing mode - submit answer
        if (!currentCourse) {
          message.error('No course loaded for testing');
          return;
        }

        const result = await courseService.submitTestingResult(
          currentCourse.id!,
          selectedObjectType,
          (currentCourse as any).correct_object_type
        );

        if (result.is_correct) {
          message.success('Correct! Well done!');
        } else {
          message.error(`Incorrect. The correct answer was: ${(currentCourse as any).correct_object_type}`);
        }

        // Load next testing course
        setTimeout(() => {
          loadTestingCourse();
        }, 2000);
      }
    } catch (error) {
      message.error('Failed to save course');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle increment settings change
  const handleIncrementSettingsChange = (unit: 'minutes' | 'seconds' | 'milliseconds', value: number) => {
    setIncrementUnit(unit);
    setIncrementValue(value);
  };

  // Auto-increment time based on user settings
  const autoIncrementCurrentTime = () => {
    const newTime = new Date(currentTime);
    switch (incrementUnit) {
      case 'minutes':
        newTime.setMinutes(newTime.getMinutes() + incrementValue);
        break;
      case 'seconds':
        newTime.setSeconds(newTime.getSeconds() + incrementValue);
        break;
      case 'milliseconds':
        newTime.setMilliseconds(newTime.getMilliseconds() + incrementValue);
        break;
    }
    
    setCurrentTime(newTime);
  };

  // Jump to specific point on map
  const handleJumpToPoint = (pointId: string) => {
    if (!jumpToPointEnabled) return;
    
    const point = points.find(p => p.point_id === pointId);
    if (point) {
      setMapCenter([point.lat, point.lon]);
      setMapZoom(12); // Zoom in closer when jumping to a specific point
      setHighlightedPoint(pointId);
      
      // Clear highlight after 3 seconds
      setTimeout(() => {
        setHighlightedPoint(null);
      }, 3000);
    }
  };

  // Export data
  const handleExport = async () => {
    try {
      setIsLoading(true);
      const result = await courseService.exportCSV();
      
      // Download files
      for (const file of result.files) {
        const link = document.createElement('a');
        link.href = `http://localhost:5000${file.download_url}`;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      message.success(`Exported ${result.stats.total_courses} courses and ${result.stats.total_points} points`);
    } catch (error) {
      message.error('Failed to export data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className={darkMode ? 'dark-mode' : 'light-mode'}
      style={{ height: '100vh', width: '100vw', position: 'relative', overflow: 'hidden' }}
    >
      {/* Time Control - Top Center */}
      <TimeControl
        currentTime={currentTime}
        onTimeChange={setCurrentTime}
        autoIncrement={autoIncrementTime}
        onAutoIncrementChange={setAutoIncrementTime}
        darkMode={darkMode}
        onIncrementSettingsChange={handleIncrementSettingsChange}
        points={points}
      />

      {/* Settings Panel - Top Right */}
      <SettingsPanel
        autoZoomEnabled={autoZoomEnabled}
        jumpToPointEnabled={jumpToPointEnabled}
        settingsExpanded={settingsExpanded}
        darkMode={darkMode}
        autoIncrementTime={autoIncrementTime}
        onAutoZoomChange={setAutoZoomEnabled}
        onJumpToPointChange={setJumpToPointEnabled}
        onExpandedChange={setSettingsExpanded}
        onDarkModeChange={setDarkMode}
        onAutoIncrementTimeChange={setAutoIncrementTime}
      />

      <Sidebar
        mode={mode}
        selectedObjectType={selectedObjectType}
        noiseLevel={noiseLevel}
        points={points}
        isLoading={isLoading}
        collapsed={sidebarCollapsed}
        highlightedPoint={highlightedPoint}
        jumpToPointEnabled={jumpToPointEnabled}
        onCollapseChange={setSidebarCollapsed}
        onModeChange={handleModeChange}
        onObjectTypeChange={setSelectedObjectType}
        onNoiseLevelChange={setNoiseLevel}
        onPointUpdate={handleUpdatePoint}
        onPointDelete={handleDeletePoint}
        onPointHover={setHighlightedPoint}
        onPointClick={handleJumpToPoint}
        onSave={handleSaveCourse}
        onExport={handleExport}
      />
      <div 
        style={{ 
          height: '100vh', 
          width: '100vw',
          marginLeft: sidebarCollapsed ? '0' : '350px',
          transition: 'margin-left 0.3s ease',
          position: 'relative'
        }}
      >
        <MapComponent
          points={points}
          onAddPoint={handleAddPoint}
          onPointDrag={handleUpdatePoint}
          onPointHover={setHighlightedPoint}
          mode={mode}
          autoZoomEnabled={autoZoomEnabled}
          jumpToPointEnabled={jumpToPointEnabled}
          highlightedPoint={highlightedPoint}
          mapCenter={mapCenter}
          mapZoom={mapZoom}
        />
      </div>
    </div>
  );
}

export default App;
