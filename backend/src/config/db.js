const { PrismaClient } = require('@prisma/client');

// Single shared Prisma instance. Swapping the underlying database
// (SQLite -> PostgreSQL/MySQL) only requires editing schema.prisma + .env;
// this file and every controller stay unchanged.
const prisma = new PrismaClient();

module.exports = prisma;
