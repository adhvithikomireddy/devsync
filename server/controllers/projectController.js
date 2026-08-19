const Project = require('../models/Project');
const File = require('../models/File');
const Activity = require('../models/Activity');
const CodeChange = require('../models/CodeChange');
const ChatMessage = require('../models/ChatMessage');
const Meeting = require('../models/Meeting');
const { getTemplateFiles } = require('../utils/templateGenerator');

// @desc    Create a new project with starter templates
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const { name, description, visibility = 'private', template = 'javascript' } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required',
      });
    }

    // 1. Create project
    const project = await Project.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      visibility,
      template,
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: 'owner',
          joinedAt: new Date(),
        },
      ],
    });

    // 2. Generate and insert starter template files
    const starterFiles = getTemplateFiles(template, project.name);
    for (const f of starterFiles) {
      await File.create({
        project: project._id,
        name: f.name,
        path: f.path,
        language: f.language,
        content: f.content,
        isDirectory: false,
        createdBy: req.user._id,
        updatedBy: req.user._id,
      });
    }

    // 3. Create initial activity
    await Activity.create({
      project: project._id,
      user: req.user._id,
      action: 'PROJECT_CREATED',
      metadata: {
        projectName: project.name,
        template,
      },
    });

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatar color title')
      .populate('members.user', 'name email avatar color title');

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: populatedProject,
    });
  } catch (err) {
    console.error('[Create Project Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error creating project',
    });
  }
};

// @desc    Get all user projects (owned and member)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const userId = req.user._id;

    const projects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
    })
      .populate('owner', 'name email avatar color title')
      .populate('members.user', 'name email avatar color title')
      .populate('activeMeeting')
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving projects',
    });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar color title')
      .populate('members.user', 'name email avatar color title')
      .populate('activeMeeting');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const userRole = project.getUserRole(req.user._id);
    if (!userRole && project.visibility !== 'public') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this project',
      });
    }

    return res.status(200).json({
      success: true,
      project,
      userRole: userRole || 'viewer',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving project',
    });
  }
};

// @desc    Update project details
// @route   PUT /api/projects/:id
// @access  Private (Owner/Admin)
const updateProject = async (req, res) => {
  try {
    const { name, description, visibility } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const userRole = project.getUserRole(req.user._id);
    if (!['owner', 'admin'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only owners and admins can edit project settings',
      });
    }

    if (name) project.name = name.trim();
    if (description !== undefined) project.description = description.trim();
    if (visibility) project.visibility = visibility;

    await project.save();

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error updating project',
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Owner Only)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the project owner can delete this project',
      });
    }

    // Clean up project files, code changes, activities, chat messages, meetings
    await File.deleteMany({ project: project._id });
    await CodeChange.deleteMany({ project: project._id });
    await Activity.deleteMany({ project: project._id });
    await ChatMessage.deleteMany({ project: project._id });
    await Meeting.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(project._id);

    return res.status(200).json({
      success: true,
      message: 'Project and all associated resources deleted successfully',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error deleting project',
    });
  }
};

// @desc    Get dashboard statistics for current user
// @route   GET /api/projects/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const allProjects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
    });

    const ownedCount = allProjects.filter((p) => p.owner.toString() === userId.toString()).length;
    const sharedCount = allProjects.length - ownedCount;
    const activeCollaborations = allProjects.filter((p) => p.members.length > 1).length;

    const recentActivities = await Activity.find({
      project: { $in: allProjects.map((p) => p._id) },
    })
      .populate('user', 'name avatar color title')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      stats: {
        totalProjects: allProjects.length,
        ownedProjects: ownedCount,
        sharedProjects: sharedCount,
        activeCollaborations,
      },
      recentActivities,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving dashboard stats',
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getDashboardStats,
};
