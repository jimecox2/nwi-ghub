// lib/helpers/routehelper.js

/**
 * Minimal route configuration for PPM application
 * Contains only essential routes for current functionality
 */
import { FRONTEND_URL } from '@/config/index';

// Base URLs from environment variables
export const BASE_URLS = {
  API: process.env.API_URL || 'http://localhost:1337',
  FRONTEND: FRONTEND_URL || 'http://localhost:3000',
};

// API Routes (Internal Next.js API routes)
export const API_ROUTES = {
  NOTIFICATIONS: {
    PUSHOVER: '/api/notifications/automated',
  },
};

// External API Endpoints
export const EXTERNAL_API_ENDPOINTS = {
  PUSHOVER: {
    MESSAGES: 'https://api.pushover.net/1/messages.json',
  },
};

// Default export for convenience
export default {
  BASE_URLS,
  API_ROUTES,
  EXTERNAL_API_ENDPOINTS,
};