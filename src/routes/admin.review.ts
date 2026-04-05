import express from 'express';
import controller from '../controllers/review';
import { Schemas, ValidateJoi } from '../middleware/joi';
import { requireAdmin } from '../middleware/auth';

const router = express.Router();

// TODO: Add admin review routes here

export default router;
