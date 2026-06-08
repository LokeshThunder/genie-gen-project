import express from 'express';

const router = express.Router();

// Temporary mock data to serve until a real database is connected
const mockJobs = [
  {
    id: 'job_1',
    title: 'Warehouse Associate',
    company: 'Logistics Pro',
    location: { lat: 40.7128, lng: -74.0060, address: 'New York, NY' },
    pay: 20,
    type: 'part-time',
    status: 'Active'
  },
  {
    id: 'job_2',
    title: 'Delivery Driver',
    company: 'FastDash',
    location: { lat: 34.0522, lng: -118.2437, address: 'Los Angeles, CA' },
    pay: 25,
    type: 'gig',
    status: 'Active'
  }
];

// GET /api/jobs
router.get('/', (req, res) => {
  res.json(mockJobs);
});

// GET /api/jobs/applications
router.get('/applications', (req, res) => {
  // Placeholder for user applications
  res.json([]);
});

export default router;
