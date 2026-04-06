require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const User = require('../models/User');
const Client = require('../models/Client');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Invoice = require('../models/Invoice');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}), Client.deleteMany({}),
    Project.deleteMany({}), Task.deleteMany({}), Invoice.deleteMany({}),
  ]);

  // Create demo user
  const user = await User.create({
    name: 'Alex Johnson', email: 'demo@freelanceos.com', password: 'password123',
    plan: 'pro', settings: { currency: 'USD', hourlyRate: 120, businessName: 'AJ Creative Studio' },
  });
  console.log('✅ User created: demo@freelanceos.com / password123');

  // Create clients
  const clients = await Client.insertMany([
    {
      user: user._id, name: 'Sarah Chen', company: 'TechFlow Inc.', email: 'sarah@techflow.com',
      phone: '+1 415 555 0101', status: 'Won', tags: ['web', 'react', 'saas'],
      totalRevenue: 24500, source: 'Referral',
      notes: [{ content: 'Long-term client. Prefers weekly status updates. Decision maker.', createdBy: user._id }],
    },
    {
      user: user._id, name: 'Marcus Rivera', company: 'Rivera Brands', email: 'marcus@riverabrands.com',
      phone: '+1 310 555 0202', status: 'Proposal Sent', tags: ['branding', 'design'],
      totalRevenue: 0, source: 'LinkedIn',
      notes: [{ content: 'Interested in full brand refresh. Budget around $15k.', createdBy: user._id }],
    },
    {
      user: user._id, name: 'Priya Kapoor', company: 'StartupLab', email: 'priya@startuplab.io',
      phone: '+1 650 555 0303', status: 'Lead', tags: ['mobile', 'startup', 'mvp'],
      totalRevenue: 0, source: 'Upwork',
    },
    {
      user: user._id, name: 'James Wright', company: 'Wright & Associates', email: 'j.wright@wrightlaw.com',
      status: 'Contacted', tags: ['web', 'legal'], totalRevenue: 8000, source: 'Website',
    },
  ]);

  // Create projects
  const projects = await Project.insertMany([
    {
      user: user._id, client: clients[0]._id, name: 'TechFlow SaaS Dashboard',
      description: 'Complete rebuild of analytics dashboard with real-time data and mobile support.',
      status: 'In Progress', priority: 'High', budget: 14500, currency: 'USD',
      startDate: new Date(Date.now() - 20 * 86400000), deadline: new Date(Date.now() + 25 * 86400000),
      rawRequirement: 'Rebuild analytics dashboard with React, add real-time WebSocket data, mobile responsive, dark mode.',
      structuredRequirement: {
        features: ['Real-time analytics', 'Mobile responsive', 'Dark mode', 'CSV export'],
        missing: ['Error tracking integration details', 'Data retention policy'],
        risks: ['WebSocket complexity', 'Performance with large datasets'],
        modules: ['Dashboard', 'Charts', 'Data Pipeline', 'Export Module'],
      },
      techStack: ['React', 'Node.js', 'MongoDB', 'WebSockets', 'Recharts'],
    },
    {
      user: user._id, client: clients[0]._id, name: 'TechFlow API v2',
      description: 'REST API rebuild with GraphQL layer and improved authentication.',
      status: 'Planning', priority: 'Medium', budget: 10000,
      deadline: new Date(Date.now() + 60 * 86400000),
      techStack: ['Node.js', 'GraphQL', 'PostgreSQL'],
    },
    {
      user: user._id, client: clients[3]._id, name: 'Law Firm Website',
      description: 'Modern website with contact forms, case studies, and appointment booking.',
      status: 'Completed', priority: 'Medium', budget: 8000,
      deadline: new Date(Date.now() - 10 * 86400000),
      completedDate: new Date(Date.now() - 10 * 86400000),
    },
  ]);

  // Create tasks
  await Task.insertMany([
    { user: user._id, project: projects[0]._id, title: 'Setup React + Vite project structure', status: 'Done', priority: 'High', estimatedHours: 3, actualHours: 2.5, position: 0, isAiGenerated: false },
    { user: user._id, project: projects[0]._id, title: 'Implement authentication with JWT', status: 'Done', priority: 'High', estimatedHours: 6, actualHours: 7, position: 1 },
    { user: user._id, project: projects[0]._id, title: 'Build dashboard layout and navigation', status: 'Done', priority: 'High', estimatedHours: 5, actualHours: 4.5, position: 2 },
    { user: user._id, project: projects[0]._id, title: 'Integrate Recharts for analytics visualization', status: 'In Progress', priority: 'High', estimatedHours: 8, position: 0, deadline: new Date(Date.now() + 3 * 86400000) },
    { user: user._id, project: projects[0]._id, title: 'WebSocket real-time data pipeline', status: 'In Progress', priority: 'High', estimatedHours: 12, position: 1, deadline: new Date(Date.now() + 5 * 86400000) },
    { user: user._id, project: projects[0]._id, title: 'Mobile responsive CSS breakpoints', status: 'Todo', priority: 'Medium', estimatedHours: 4, position: 0 },
    { user: user._id, project: projects[0]._id, title: 'Dark mode implementation', status: 'Todo', priority: 'Medium', estimatedHours: 3, position: 1 },
    { user: user._id, project: projects[0]._id, title: 'CSV export functionality', status: 'Todo', priority: 'Low', estimatedHours: 4, position: 2 },
    { user: user._id, project: projects[0]._id, title: 'Performance optimization and code review', status: 'Review', priority: 'Medium', estimatedHours: 5, position: 0 },
    { user: user._id, project: projects[0]._id, title: 'End-to-end testing', status: 'Todo', priority: 'High', estimatedHours: 6, position: 3, deadline: new Date(Date.now() + 2 * 86400000) },
  ]);

  // Create invoices
  await Invoice.insertMany([
    {
      user: user._id, client: clients[0]._id, project: projects[0]._id,
      invoiceNumber: 'INV-0001', status: 'Paid',
      lineItems: [{ description: 'UI/UX Design & Prototyping', quantity: 1, unitPrice: 4500, amount: 4500 }, { description: 'Frontend Development (Phase 1)', quantity: 40, unitPrice: 120, amount: 4800 }],
      subtotal: 9300, taxRate: 0, taxAmount: 0, discount: 0, total: 9300,
      issueDate: new Date(Date.now() - 45 * 86400000), dueDate: new Date(Date.now() - 30 * 86400000),
      paidDate: new Date(Date.now() - 28 * 86400000), notes: 'Thank you for your business!',
    },
    {
      user: user._id, client: clients[0]._id, project: projects[0]._id,
      invoiceNumber: 'INV-0002', status: 'Pending',
      lineItems: [{ description: 'Frontend Development (Phase 2)', quantity: 42, unitPrice: 120, amount: 5040 }, { description: 'WebSocket Integration', quantity: 1, unitPrice: 1500, amount: 1500 }],
      subtotal: 6540, taxRate: 0, taxAmount: 0, discount: 300, total: 6240,
      issueDate: new Date(Date.now() - 5 * 86400000), dueDate: new Date(Date.now() + 25 * 86400000),
    },
    {
      user: user._id, client: clients[3]._id, project: projects[2]._id,
      invoiceNumber: 'INV-0003', status: 'Paid',
      lineItems: [{ description: 'Law Firm Website - Full Project', quantity: 1, unitPrice: 8000, amount: 8000 }],
      subtotal: 8000, taxRate: 0, taxAmount: 0, discount: 0, total: 8000,
      issueDate: new Date(Date.now() - 15 * 86400000), dueDate: new Date(Date.now() - 10 * 86400000),
      paidDate: new Date(Date.now() - 10 * 86400000),
    },
    {
      user: user._id, client: clients[1]._id,
      invoiceNumber: 'INV-0004', status: 'Overdue',
      lineItems: [{ description: 'Brand Strategy Consultation', quantity: 4, unitPrice: 400, amount: 1600 }],
      subtotal: 1600, taxRate: 0, taxAmount: 0, discount: 0, total: 1600,
      issueDate: new Date(Date.now() - 20 * 86400000), dueDate: new Date(Date.now() - 5 * 86400000),
    },
  ]);

  console.log('✅ Demo data seeded successfully!');
  console.log('\n📋 Demo Login Credentials:');
  console.log('   Email:    demo@freelanceos.com');
  console.log('   Password: password123\n');
  process.exit(0);
};

seed().catch((err) => { console.error('❌ Seeding failed:', err); process.exit(1); });
