import { validationResult } from "express-validator";
import sendResponse from "../utils/sendResponse.js";

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return sendResponse(res, 400, false, "Validation errors", errors.array());
  }

  next();
};

export default validate;
