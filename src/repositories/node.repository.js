// src/repositories/node.repository.js
const prisma = require('../config/prisma');

const userSelect = { 
    select: { 
        id:true, 
        username: true, 
        role: true
    },
};

const findAll = () => prisma.node.findMany({ 
    orderBy: { createdAt: 'desc' },
    include: {user: userSelect} 
});

const findById = (id) => prisma.node.findUnique({ 
    where: { id },
    include: {user: userSelect},
});

const findByNodeId = (nodeId) => prisma.node.findUnique({ 
    where: { nodeId },
    include:{user: userSelect}, 
});

const findByUserId = (userId) => prisma.node.findMany({
    where: { userId: Number(userId) },
    orderBy: { createdAt: 'desc'},
    include: {user: userSelect}
})

const create = (data) => prisma.node.create({ 
    data,
    include:{user: userSelect},  
});

const update = (id, data) => prisma.node.update({ 
    where: { id }, data 
});

const updateByNodeId = (nodeId, data) => prisma.node.update({ 
    where: { nodeId }, 
    data,
    include:{user: userSelect},  
});

const upsertByNodeId = (nodeId, data) => prisma.node.upsert({
    where: { nodeId },
    update: data,
    create: { nodeId, ...data },
    include:{user: userSelect}, 
});

const assignUser = (nodeId, userId) => prisma.node.update({
        where: { nodeId },
        data: { userId: Number(userId) },
        include:{user: userSelect}, 
});

const removeUser = (nodeId) => prisma.node.update({
    where: { nodeId },
    data: {userId: null}
})

const remove = (id) => prisma.node.delete({ 
    where: { id },
    include:{user: userSelect}, 
});

module.exports = { findAll, findById, findByNodeId,findByUserId, create, update, updateByNodeId, upsertByNodeId,assignUser,removeUser, remove };