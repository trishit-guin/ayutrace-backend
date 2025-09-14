const validate = (schema, target = 'body') => (req, res, next) => {
  try {
    // Determine what data to validate based on target
    let dataToValidate;
    switch (target) {
      case 'query':
        dataToValidate = req.query;
        break;
      case 'params':
        dataToValidate = req.params;
        break;
      case 'body':
      default:
        dataToValidate = req.body;
        break;
    }

    // Check if it's a Joi schema (has validate method) or Zod schema (has parse method)
    if (typeof schema.validate === 'function') {
      // Handle Joi validation
      const { error, value } = schema.validate(dataToValidate, { abortEarly: false });
      
      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path ? detail.path.join('.') : 'unknown',
          message: detail.message || 'Validation error',
          code: 'validation_error',
        }));
        
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors,
          timestamp: new Date().toISOString(),
        });
      }
      
      // Update the request with validated data
      if (target === 'query') {
        req.query = value;
      } else if (target === 'params') {
        req.params = value;
      } else {
        req.body = value;
      }
      
    } else if (typeof schema.parse === 'function') {
      // Handle Zod validation
      const validationData = {
        body: req.body,
        query: req.query,
        params: req.params,
      };
      
      schema.parse(validationData);
    } else {
      throw new Error('Invalid schema type. Expected Joi or Zod schema.');
    }
    
    next();
  } catch (e) {
    // Extensive logging for error detection
    console.error('--- VALIDATION ERROR LOG ---');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Request Method:', req.method);
    console.error('Request URL:', req.originalUrl);
    console.error('Request Headers:', req.headers);
    console.error('Request Body:', JSON.stringify(req.body, null, 2));
    console.error('Request Query:', JSON.stringify(req.query, null, 2));
    console.error('Request Params:', JSON.stringify(req.params, null, 2));
    console.error('Error Name:', e.name);
    console.error('Error Message:', e.message);
    console.error('Error Stack:', e.stack);
    if (e.errors) console.error('Error .errors:', JSON.stringify(e.errors, null, 2));
    if (e.issues) console.error('Error .issues:', JSON.stringify(e.issues, null, 2));
    
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