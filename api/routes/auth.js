'use strict';

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const DEMO_STUDENT = {
  id: 'std_101',
  name: 'Aarav Sharma',
  email: 'student@codenova.edu',
  rollNumber: 'CN-2024-CSE-042',
  college: 'CodeNova Institute of Technology',
  branch: 'Computer Science & Engineering',
  year: '3rd Year',
};

// ─── POST /api/auth/login ────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email')
      .trim()
      .notEmpty().withMessage('Email address or student ID is required')
      .isEmail().withMessage('Please provide a valid email address'),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }

    const { email, password } = req.body;

    // Check demo credentials or accept valid student account
    let studentName = 'Aarav Sharma';
    let rollNo = 'CN-2024-CSE-042';

    if (email.toLowerCase() === DEMO_STUDENT.email.toLowerCase()) {
      if (password !== 'student123') {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. For demo, use password: student123',
        });
      }
    } else {
      // Derive name from email for realistic login
      const prefix = email.split('@')[0];
      studentName = prefix.charAt(0).toUpperCase() + prefix.slice(1).replace(/[._]/g, ' ');
      rollNo = `CN-2024-${Math.floor(100 + Math.random() * 900)}`;
    }

    const user = {
      id: `std_${Date.now()}`,
      name: studentName,
      email: email.toLowerCase(),
      rollNumber: rollNo,
      college: 'CodeNova Institute of Technology',
      branch: 'Computer Science & Engineering',
      year: '3rd Year',
    };

    const token = `token_${Buffer.from(`${user.email}:${Date.now()}`).toString('base64')}`;

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user,
    });
  }
);

// ─── POST /api/auth/register ─────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Full name is required'),
    body('email').trim().isEmail().withMessage('Valid college email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }

    const { name, email } = req.body;
    const user = {
      id: `std_${Date.now()}`,
      name,
      email: email.toLowerCase(),
      rollNumber: `CN-2024-${Math.floor(100 + Math.random() * 900)}`,
      college: 'CodeNova Institute of Technology',
      branch: 'Engineering & Technology',
      year: 'Student',
    };

    const token = `token_${Buffer.from(`${user.email}:${Date.now()}`).toString('base64')}`;

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user,
    });
  }
);

// ─── GET /api/auth/demo ──────────────────────────────────────────────────────
router.get('/demo', (req, res) => {
  return res.json({
    success: true,
    demoAccount: {
      email: DEMO_STUDENT.email,
      password: 'student123',
      name: DEMO_STUDENT.name,
    },
  });
});

module.exports = router;
