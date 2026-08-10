const prisma = require('../config/db');

// GET /api/announcements - any authenticated user, latest first
async function listAnnouncements(req, res) {
  const announcements = await prisma.announcement.findMany({
    include: { createdBy: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { publishedAt: 'desc' },
    take: 20,
  });
  res.json({ announcements });
}

// POST /api/announcements (admin only)
async function createAnnouncement(req, res) {
  const { title, htmlContent, publishedAt } = req.body;
  if (!title || !htmlContent) {
    return res.status(400).json({ error: 'title and htmlContent are required' });
  }
  const announcement = await prisma.announcement.create({
    data: {
      title,
      htmlContent,
      publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      createdById: req.user.id,
    },
  });
  res.status(201).json({ announcement });
}

async function updateAnnouncement(req, res) {
  const { title, htmlContent, publishedAt } = req.body;
  const data = {};
  if (title !== undefined) data.title = title;
  if (htmlContent !== undefined) data.htmlContent = htmlContent;
  if (publishedAt !== undefined) data.publishedAt = new Date(publishedAt);

  try {
    const announcement = await prisma.announcement.update({ where: { id: req.params.id }, data });
    res.json({ announcement });
  } catch (err) {
    res.status(404).json({ error: 'Announcement not found' });
  }
}

async function deleteAnnouncement(req, res) {
  try {
    await prisma.announcement.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: 'Announcement not found' });
  }
}

module.exports = { listAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement };
