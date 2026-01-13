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
    // Remove undefined and empty string values from body
    const cleanBody = Object.fromEntries(
      Object.entries(req.body).filter(([_, v]) => v !== undefined && v !== '')
    );
    
    // Set default mode if not provided
    if (!cleanBody.mode) {
      cleanBody.mode = 'login';
    }
    
    // Custom validation: at least email or phone must be provided
    // Check if schema has email and phone properties (auth schemas)
    if (schema.properties?.email && schema.properties?.phone && !schema.required?.includes('otp')) {
      if (!cleanBody.email && !cleanBody.phone) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Either email or phone must be provided',
        });
      }
    }
    
    // For verifyOTP, also check email/phone
    if (schema.properties?.email && schema.properties?.phone && schema.required?.includes('otp')) {
      if (!cleanBody.email && !cleanBody.phone) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Either email or phone must be provided',
        });
      }
    }
    
    const valid = validateFn(cleanBody);

    if (!valid) {
      const firstError = validateFn.errors?.[0];
      return res.status(400).json({
        error: 'Validation failed',
        message: firstError?.message || 'Invalid request data',
        details: validateFn.errors,
      });
    }

    // Replace req.body with cleaned body
    req.body = cleanBody;
    next();
  };
}
