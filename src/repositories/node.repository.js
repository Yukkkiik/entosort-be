// src/repositories/node.repository.js
const prisma = require('../config/prisma');

const findAll = () => prisma.node.findMany({ 
    orderBy: { createdAt: 'desc' } 
});

const findById = (id) => prisma.node.findUnique({ 
    where: { id } 
});

const findByNodeId = (nodeId) => prisma.node.findUnique({ 
    where: { nodeId } 
});

const create = (data) => prisma.node.create({ 
    data 
});

const update = (id, data) => prisma.node.update({ 
    where: { id }, data 
});

const updateByNodeId = (nodeId, data) =>
  prisma.node.update({ 
    where: { nodeId }, data 
});

const upsertByNodeId = (nodeId, data) =>
  prisma.node.upsert({
    where: { nodeId },
    update: data,
    create: { nodeId, ...data },
  });

const remove = (id) => prisma.node.delete({ 
    where: { id } 
});

module.exports = { findAll, findById, findByNodeId, create, update, updateByNodeId, upsertByNodeId, remove };