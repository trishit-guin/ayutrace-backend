const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (e) {
    console.error('Validation error details:', {
      name: e.name,
      message: e.message,
      errors: e.errors,
      issues: e.issues,
    });
    
    // Check if it's a Zod validation error (ZodError has issues property)
    if (e.issues && Array.isArray(e.issues)) {
      // Transform Zod errors into a more user-friendly format
      const errors = e.issues.map(issue => ({
        field: issue.path ? issue.path.join('.') : 'unknown',
        message: issue.message || 'Validation error',
        code: issue.code || 'validation_error',
        received: issue.received || undefined,
      }));

      return res.status(400).json({
        message: 'Validation failed',
        errors: errors,
        timestamp: new Date().toISOString(),
      });
    } 
    // Fallback for legacy Zod error format
    else if (e.errors && Array.isArray(e.errors)) {
      const errors = e.errors.map(error => ({
        field: error.path ? error.path.join('.') : 'unknown',
        message: error.message || 'Validation error',
        code: error.code || 'validation_error',
      }));

      return res.status(400).json({
        message: 'Validation failed',
        errors: errors,
        timestamp: new Date().toISOString(),
      });
    } 
    // Handle other types of errors
    else {
      return res.status(400).json({
        message: 'Validation failed',
        errors: [{
          field: 'unknown',
          message: e.message || 'Invalid request data',
          code: 'validation_error',
        }],
        timestamp: new Date().toISOString(),
      });
    }
  }
};

module.exports = { validate };