const prisma = require('../config/prisma');

const findAll = () => prisma.user.findMany({
    select: { id: true, username: true, role: true, phone: true, createdAt: true, updatedAt: true},
    orderBy: { createdAt: 'desc'},
});

const findById = (id) => prisma.user.findUnique({
    where: { id },
});

const findByUsername = (username) => prisma.user.findUnique({ 
    where: { username }
});

const create = (data) => prisma.user.create({
    data,
    select: { id: true, username: true, role: true, phone: true, createdAt: true},
});

const update = (id, data) => prisma.user.update({
    where: { id },
    data,
    select: { id: true, username: true, role: true, phone: true, updatedAt: true},
});

const remove = (id) => prisma.user.delete({
    where: { id },
});

module.exports = { findAll, findById, findByUsername, create, update, remove };