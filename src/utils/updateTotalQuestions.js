import Question from "../models/Questions.js";
import QuizCollection from "../models/QuizCollection.js";

export const updateTotalQuestions = async (quizId) => {
  try {
    const count = await Question.countDocuments({ quizId });

    await QuizCollection.findByIdAndUpdate(quizId, {
      totalQues: count,
    });
  } catch (err) {
    console.error("Error updating total questions:", err.message);
  }
};