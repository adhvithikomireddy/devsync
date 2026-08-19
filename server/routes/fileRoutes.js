const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getProjectFiles,
  getFileById,
  createFile,
  updateFileContent,
  renameFile,
  deleteFile,
} = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');
const { requireProjectRole } = require('../middleware/permissionMiddleware');

router.use(protect);

router
  .route('/')
  .get(requireProjectRole(['owner', 'admin', 'editor', 'viewer']), getProjectFiles)
  .post(requireProjectRole(['owner', 'admin', 'editor']), createFile);

router
  .route('/:fileId')
  .get(requireProjectRole(['owner', 'admin', 'editor', 'viewer']), getFileById)
  .put(requireProjectRole(['owner', 'admin', 'editor']), updateFileContent)
  .delete(requireProjectRole(['owner', 'admin', 'editor']), deleteFile);

router.put(
  '/:fileId/rename',
  requireProjectRole(['owner', 'admin', 'editor']),
  renameFile
);

module.exports = router;
