import Question from "../models/QuizQuestions.js";
import QuizCollection from "../models/QuizCollection.js";

//  START QUIZ
export const startQuiz = async (req, res) => {
  try {
    const { collectionId } = req.params;

    const quiz = await QuizCollection.findById(collectionId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const questions = await Question.find({ collectionId }).select(
      "-correct -__v"
    );

    res.status(200).json({
      success: true,
      quiz,
      questions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//  SUBMIT QUIZ
export const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    // answers = [{ questionId, selectedOption }]

    if (!answers || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Answers are required",
      });
    }

    let score = 0;

    for (let ans of answers) {
      const question = await Question.findById(ans.questionId);

      if (!question) continue;

      if (question.correct === ans.selectedOption) {
        score++;
      }
    }

    const total = answers.length;
    const percentage = ((score / total) * 100).toFixed(2);

    res.status(200).json({
      success: true,
      total,
      score,
      percentage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};