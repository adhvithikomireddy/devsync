const File = require('../models/File');
const Activity = require('../models/Activity');
const { recordCodeChange } = require('../services/changeTrackingService');

// Helper to detect Monaco language by file extension
function getLanguageFromFileName(fileName = '') {
  const ext = fileName.split('.').pop().toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'py':
      return 'python';
    case 'java':
      return 'java';
    case 'c':
    case 'h':
      return 'c';
    case 'cpp':
    case 'hpp':
    case 'cc':
    case 'cxx':
      return 'cpp';
    case 'html':
    case 'htm':
      return 'html';
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return 'css';
    case 'json':
      return 'json';
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'sql':
      return 'sql';
    case 'sh':
    case 'bash':
      return 'shell';
    case 'xml':
    case 'svg':
      return 'xml';
    case 'yaml':
    case 'yml':
      return 'yaml';
    default:
      return 'plaintext';
  }
}

// @desc    Get all files for a project
// @route   GET /api/projects/:projectId/files
// @access  Private
const getProjectFiles = async (req, res) => {
  try {
    const { projectId } = req.params;
    const files = await File.find({ project: projectId })
      .populate('createdBy', 'name avatar')
      .populate('updatedBy', 'name avatar')
      .sort({ isDirectory: -1, path: 1 });

    return res.status(200).json({
      success: true,
      count: files.length,
      files,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving files',
    });
  }
};

// @desc    Get single file by ID
// @route   GET /api/projects/:projectId/files/:fileId
// @access  Private
const getFileById = async (req, res) => {
  try {
    const { projectId, fileId } = req.params;
    const file = await File.findOne({ _id: fileId, project: projectId })
      .populate('createdBy', 'name avatar')
      .populate('updatedBy', 'name avatar');

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    return res.status(200).json({ success: true, file });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving file',
    });
  }
};

// @desc    Create a new file or directory
// @route   POST /api/projects/:projectId/files
// @access  Private (Editor/Admin/Owner)
const createFile = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, path: filePath, isDirectory = false, content = '', parentId = null } = req.body;

    if (!name?.trim() || !filePath?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'File name and path are required',
      });
    }

    const cleanPath = filePath.trim().replace(/^[/\\]+/, '');
    const cleanName = name.trim();

    // Check duplicate path in project
    const existing = await File.findOne({ project: projectId, path: cleanPath });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A file or folder with path "${cleanPath}" already exists`,
      });
    }

    const language = isDirectory ? 'directory' : getLanguageFromFileName(cleanName);

    const file = await File.create({
      project: projectId,
      name: cleanName,
      path: cleanPath,
      language,
      content: isDirectory ? '' : content,
      isDirectory,
      parentId: parentId || null,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    // Record activity
    await Activity.create({
      project: projectId,
      user: req.user._id,
      action: 'FILE_CREATED',
      metadata: {
        fileId: file._id,
        fileName: file.name,
        filePath: file.path,
        isDirectory,
      },
    });

    const populatedFile = await File.findById(file._id)
      .populate('createdBy', 'name avatar')
      .populate('updatedBy', 'name avatar');

    // Notify via Socket.IO if app is running
    const io = req.app.get('io');
    if (io) {
      io.to(`project:${projectId}`).emit('file-tree-updated', {
        action: 'created',
        file: populatedFile,
      });
    }

    return res.status(201).json({
      success: true,
      message: `${isDirectory ? 'Folder' : 'File'} created successfully`,
      file: populatedFile,
    });
  } catch (err) {
    console.error('[Create File Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error creating file',
    });
  }
};

// @desc    Update file content & record diff attribution
// @route   PUT /api/projects/:projectId/files/:fileId
// @access  Private (Editor/Admin/Owner)
const updateFileContent = async (req, res) => {
  try {
    const { projectId, fileId } = req.params;
    const { content } = req.body;

    const file = await File.findOne({ _id: fileId, project: projectId });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (file.isDirectory) {
      return res.status(400).json({ success: false, message: 'Cannot edit directory content' });
    }

    const previousContent = file.content || '';
    const newContent = content !== undefined ? content : previousContent;

    // Update file
    file.content = newContent;
    file.updatedBy = req.user._id;
    await file.save();

    // Record code change with attribution & diff
    const io = req.app.get('io');
    const recordedChange = await recordCodeChange({
      projectId,
      fileId: file._id,
      userId: req.user._id,
      previousContent,
      newContent,
      io,
    });

    return res.status(200).json({
      success: true,
      message: 'File saved successfully',
      file,
      codeChange: recordedChange,
    });
  } catch (err) {
    console.error('[Update File Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error saving file',
    });
  }
};

// @desc    Rename a file or folder
// @route   PUT /api/projects/:projectId/files/:fileId/rename
// @access  Private (Editor/Admin/Owner)
const renameFile = async (req, res) => {
  try {
    const { projectId, fileId } = req.params;
    const { newName } = req.body;

    if (!newName?.trim()) {
      return res.status(400).json({ success: false, message: 'New name is required' });
    }

    const file = await File.findOne({ _id: fileId, project: projectId });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const oldPath = file.path;
    const pathParts = oldPath.split('/');
    pathParts[pathParts.length - 1] = newName.trim();
    const newPath = pathParts.join('/');

    // Check duplicate
    const existing = await File.findOne({ project: projectId, path: newPath, _id: { $ne: file._id } });
    if (existing) {
      return res.status(400).json({ success: false, message: `Path "${newPath}" already exists` });
    }

    file.name = newName.trim();
    file.path = newPath;
    if (!file.isDirectory) {
      file.language = getLanguageFromFileName(file.name);
    }
    file.updatedBy = req.user._id;
    await file.save();

    // If it was a directory, update all child files' paths
    if (file.isDirectory) {
      const children = await File.find({ project: projectId, path: new RegExp(`^${oldPath}/`) });
      for (const child of children) {
        child.path = child.path.replace(oldPath, newPath);
        await child.save();
      }
    }

    await Activity.create({
      project: projectId,
      user: req.user._id,
      action: 'FILE_RENAMED',
      metadata: { fileId: file._id, oldPath, newPath, newName: file.name },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`project:${projectId}`).emit('file-tree-updated', {
        action: 'renamed',
        file,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'File renamed successfully',
      file,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error renaming file',
    });
  }
};

// @desc    Delete a file or folder
// @route   DELETE /api/projects/:projectId/files/:fileId
// @access  Private (Editor/Admin/Owner)
const deleteFile = async (req, res) => {
  try {
    const { projectId, fileId } = req.params;

    const file = await File.findOne({ _id: fileId, project: projectId });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const filePath = file.path;

    if (file.isDirectory) {
      // Delete directory and any nested children
      await File.deleteMany({ project: projectId, path: new RegExp(`^${filePath}(/|$)`) });
    } else {
      await File.findByIdAndDelete(file._id);
    }

    await Activity.create({
      project: projectId,
      user: req.user._id,
      action: 'FILE_DELETED',
      metadata: { fileId: file._id, fileName: file.name, filePath },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`project:${projectId}`).emit('file-tree-updated', {
        action: 'deleted',
        fileId: file._id,
        filePath,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error deleting file',
    });
  }
};

module.exports = {
  getProjectFiles,
  getFileById,
  createFile,
  updateFileContent,
  renameFile,
  deleteFile,
};
