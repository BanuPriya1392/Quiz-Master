// Success Response
function sendResponse(
  res,
  status,
  response = {
    success: false,
    message: "Internal server issue.",
    data: {}
  }
) {
  return res.status(status).json({
    success: response.success,
    message: response.message,
    data: response.data,
  });
}

module.exports = { sendResponse };