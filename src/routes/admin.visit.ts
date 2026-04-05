import express from 'express';
import controller from '../controllers/visit';
import { Schemas, ValidateJoi } from '../middleware/joi';
import { requireAdmin } from '../middleware/auth';

const router = express.Router();

// TODO: Add admin visit routes here

export default router;