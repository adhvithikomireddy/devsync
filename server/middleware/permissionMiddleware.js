const Project = require('../models/Project');

/**
 * Middleware to check project membership and role permissions
 * @param {Array<string>} allowedRoles e.g. ['owner', 'admin', 'editor'] or ['owner']
 */
const requireProjectRole = (allowedRoles = ['owner', 'admin', 'editor']) => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.id || req.params.projectId || req.body.projectId;

      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: 'Project ID is required',
        });
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }

      const userRole = project.getUserRole(req.user._id);

      if (!userRole) {
        // If public project and read-only role requested
        if (project.visibility === 'public' && allowedRoles.includes('viewer') && req.method === 'GET') {
          req.project = project;
          req.userRole = 'viewer';
          return next();
        }

        return res.status(403).json({
          success: false,
          message: 'You are not a member of this project',
        });
      }

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: Action requires role [${allowedRoles.join(', ')}]. Your role is: ${userRole}`,
        });
      }

      req.project = project;
      req.userRole = userRole;
      return next();
    } catch (err) {
      console.error('[PermissionMiddleware Error]:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error checking permissions',
      });
    }
  };
};

module.exports = { requireProjectRole };
