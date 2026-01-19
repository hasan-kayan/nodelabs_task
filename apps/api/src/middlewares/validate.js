import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ 
  allErrors: true,
  removeAdditional: false,
  useDefaults: true,
});
addFormats(ajv);

export function validate(schema) {
  const validateFn = ajv.compile(schema);

  return (req, res, next) => {
    // Log original request body for debugging
    console.log('📥 Original request body:', req.body);
    
    // Remove undefined and empty string values from body
    const cleanBody = Object.fromEntries(
      Object.entries(req.body).filter(([_, v]) => v !== undefined && v !== '')
    );
    
    console.log('🧹 Cleaned body:', cleanBody);
    
    // Set default mode if not provided (only for auth schemas)
    // Don't add mode to non-auth requests
    const isAuthSchema = schema.properties?.email && schema.properties?.phone;
    if (isAuthSchema && !cleanBody.mode) {
      cleanBody.mode = 'login';
    }
    
    // Remove mode from non-auth requests (like projects)
    if (!isAuthSchema && cleanBody.mode) {
      delete cleanBody.mode;
    }
    
    // Custom validation: at least email or phone must be provided
    // Check if schema has email and phone properties (auth schemas)
    if (schema.properties?.email && schema.properties?.phone) {
      if (!cleanBody.email && !cleanBody.phone) {
        console.log('❌ Validation failed: Neither email nor phone provided');
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Either email or phone must be provided',
        });
      }
    }
    
    // Custom validation: name is required for register mode
    // But only check AFTER we've cleaned the body and set mode
    if (cleanBody.mode === 'register') {
      if (!cleanBody.name || (typeof cleanBody.name === 'string' && cleanBody.name.trim().length === 0)) {
        console.log('❌ Validation failed: Name is required for registration');
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Name is required for registration',
          received: cleanBody,
        });
      }
      // Trim name if it's a string
      if (typeof cleanBody.name === 'string') {
        cleanBody.name = cleanBody.name.trim();
      }
      
      // For register mode, both email and phone are required
      if (!cleanBody.email || !cleanBody.phone) {
        console.log('❌ Validation failed: Both email and phone are required for registration');
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Both email and phone number are required for registration',
          received: cleanBody,
        });
      }
    }
    
    console.log('✅ Final body before AJV validation:', cleanBody);
    
    const valid = validateFn(cleanBody);

    if (!valid) {
      const firstError = validateFn.errors?.[0];
      console.log('❌ AJV Validation errors:', validateFn.errors);
      console.log('📦 Request body that failed:', cleanBody);
      return res.status(400).json({
        error: 'Validation failed',
        message: firstError?.message || 'Invalid request data',
        details: validateFn.errors,
        received: cleanBody, // For debugging
      });
    }

    // Replace req.body with cleaned body
    req.body = cleanBody;
    next();
  };
}
