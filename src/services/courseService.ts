import axios from 'axios';
import { Course, CreateCourseRequest, ExportResponse, TestingResult } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const courseService = {
  // Get all courses
  async getCourses(params?: { mode?: string; object_type?: string; limit?: number }) {
    const response = await api.get('/courses', { params });
    return response.data;
  },

  // Get course by ID
  async getCourseById(id: string): Promise<Course> {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  // Create new course
  async createCourse(courseData: CreateCourseRequest): Promise<Course> {
    const response = await api.post('/courses', courseData);
    return response.data;
  },

  // Update course
  async updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
    const response = await api.put(`/courses/${id}`, updates);
    return response.data;
  },

  // Delete course
  async deleteCourse(id: string): Promise<void> {
    await api.delete(`/courses/${id}`);
  },

  // Get random course for testing
  async getRandomTestingCourse(): Promise<Course & { correct_object_type: string }> {
    const response = await api.get('/courses/random/testing');
    return response.data;
  },

  // Submit testing result
  async submitTestingResult(
    courseId: string, 
    selectedObjectType: string, 
    correctObjectType: string
  ): Promise<TestingResult> {
    const response = await api.post('/export/testing-session', {
      course_id: courseId,
      selected_object_type: selectedObjectType,
      correct_object_type: correctObjectType,
    });
    return response.data;
  },

  // Export data as CSV
  async exportCSV(format: 'courses' | 'points' | 'both' = 'both'): Promise<ExportResponse> {
    const response = await api.get('/export/csv', { params: { format } });
    return response.data;
  },

  // Get testing statistics
  async getTestingStats() {
    const response = await api.get('/export/testing-stats');
    return response.data;
  },
};

// Point service for individual point operations
export const pointService = {
  // Get points for a course
  async getPointsForCourse(courseId: string) {
    const response = await api.get(`/points/course/${courseId}`);
    return response.data;
  },

  // Add point to course
  async addPointToCourse(courseId: string, pointData: any) {
    const response = await api.post(`/points/course/${courseId}`, pointData);
    return response.data;
  },

  // Update point
  async updatePoint(courseId: string, pointId: string, updates: any) {
    const response = await api.put(`/points/course/${courseId}/${pointId}`, updates);
    return response.data;
  },

  // Delete point
  async deletePoint(courseId: string, pointId: string) {
    await api.delete(`/points/course/${courseId}/${pointId}`);
  },
};
