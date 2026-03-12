import { validationResult } from "express-validator";
import sendResponse from "../utils/sendResponse.js";

const validateRequest = (req, res, next) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array()[0].msg;
    return sendResponse(
      res,
      400,
      false,
      firstError,
      errors.array()
    );
  }

  next();
};

export default validateRequest;