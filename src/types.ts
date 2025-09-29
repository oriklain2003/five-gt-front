export interface Point {
  point_id: string;
  lat: number;
  lon: number;
  altitude: number;
  timestamp: Date;
}

export interface Course {
  id?: string;
  object_type: string;
  mode: 'training' | 'testing';
  created_by?: string;
  noise_level: number; // Percentage of noise (0-100)
  total_distance: number;
  avg_speed: number;
  total_speed_changes: number;
  total_direction_changes: number;
  total_altitude_changes: number;
  starting_point: {
    lat: number;
    lon: number;
  };
  ending_point: {
    lat: number;
    lon: number;
  };
  created_at?: Date;
  updated_at?: Date;
  points?: Point[];
}

export interface CreateCourseRequest {
  object_type: string;
  mode: 'training' | 'testing';
  created_by?: string;
  noise_level: number; // Percentage of noise (0-100)
  points: Omit<Point, 'point_id'>[];
}

export interface ExportResponse {
  message: string;
  files: {
    name: string;
    download_url: string;
  }[];
  stats: {
    total_courses: number;
    total_points: number;
  };
}

export interface TestingResult {
  course_id: string;
  selected_object_type: string;
  correct_object_type: string;
  is_correct: boolean;
  answered_at: Date;
  message: string;
}

export type AppMode = 'training' | 'testing';

export type ObjectType = 'drone' | 'plane' | 'bird' | 'storm';
