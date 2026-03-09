// Import validationResult to collect validation errors
import { validationResult } from "express-validator";

// Import common response function
import sendResponse from "../utils/sendResponse.js";


// Middleware to check validation result
const validateRequest = (req, res, next) => {

  // Get validation errors
  const errors = validationResult(req);

  // If validation fails
  if (!errors.isEmpty()) {

    // Send first error message
    return sendResponse(
      res,
      400,
      false,
      errors.array()[0].msg,
      null
    );
  }

  // If validation passes move to controller
  next();
};

// Export middleware
export default validateRequest;