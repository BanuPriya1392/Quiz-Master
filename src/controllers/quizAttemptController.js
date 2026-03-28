import Question from "../models/QuizQuestions.js";
import QuizAttempt from "../models/QuizAttempt.js";

// get quiz questions for user (without correct answers)
export const getQuizQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find()
      .select("-correct -tip -createdAt -updatedAt")
      .sort({ createdAt: 1 });

    //  No questions available
    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No questions found. Please contact your mentor.",
      });
    }

    // Not enough questions
    if (questions.length < 10) {
      return res.status(400).json({
        success: false,
        message: `Quiz is not ready yet. Only ${questions.length}/10 questions available.`,
      });
    }

    res.status(200).json({
      success: true,
      total: questions.length,
      data: questions,
    });
  } catch (err) {
    next(err);
  }
};

// submit quiz attempt
export const submitQuiz = async (req, res, next) => {
  try {
    const { answers, timeTaken } = req.body;
    const userId = req.user.id;

    //  Validate time (0–600 seconds)
    if (!QuizAttempt.isValidTimeTaken(timeTaken)) {
      return res.status(400).json({
        success: false,
        message: "Invalid time taken. Must be between 0 and 600 seconds.",
      });
    }

    //  Restrict one attempt per day
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const alreadyAttempted = await QuizAttempt.findOne({
      userId,
      createdAt: { $gte: todayStart },
    });

    if (alreadyAttempted) {
      return res.status(400).json({
        success: false,
        message:
          "You have already submitted the quiz today. Try again tomorrow.",
      });
    }

    //  Validate question IDs
    const questionIds = answers.map((a) => a.questionId);

    const dbQuestions = await Question.find({
      _id: { $in: questionIds },
    });

    if (dbQuestions.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Invalid question IDs in answers.",
      });
    }

    //  Calculate score securely (server-side)
    let serverScore = 0;

    const verifiedAnswers = answers.map((ans) => {
      const question = dbQuestions.find(
        (q) => q._id.toString() === ans.questionId.toString(),
      );

      const isCorrect = question && ans.selected === question.correct;

      if (isCorrect) serverScore++;

      return {
        questionId: ans.questionId,
        selected: ans.selected || null,
        isCorrect: isCorrect || false,
      };
    });

    //  Save attempt in DB (time stored as seconds)
    const attempt = await QuizAttempt.create({
      userId,
      answers: verifiedAnswers,
      score: serverScore,
      percentage: Math.round((serverScore / 10) * 100),
      timeTaken,
      status: serverScore >= 7 ? "Passed" : "Failed",
    });

   //  Format time as MM:SS for response
    const formattedTime = attempt.getFormattedTimeTaken();

    res.status(201).json({
      success: true,
      message: "Quiz submitted successfully.",
      data: {
        score: attempt.score,
        percentage: attempt.percentage,
        timeTaken: formattedTime, 
        status: attempt.status,
        attemptId: attempt._id,
      },
    });
  } catch (err) {
    next(err);
  }
};

// get user's quiz attempts
export const getMyAttempts = async (req, res, next) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.user.id })
      .select("-answers") // exclude detailed answers
      .sort({ createdAt: -1 });

    //  Format time for each attempt
    const formattedAttempts = attempts.map((attempt) => ({
      ...attempt.toObject(),
      timeTaken: attempt.getFormattedTimeTaken(), // overwrite
    }));

    res.status(200).json({
      success: true,
      total: attempts.length,
      data: formattedAttempts,
    });
  } catch (err) {
    next(err);
  }
};

// get specific attempt by ID (with answers)
export const getAttemptById = async (req, res, next) => {
  try {
    const attempt = await QuizAttempt.findOne({
      _id: req.params.attemptId,
      userId: req.user.id,
    }).populate("answers.questionId", "question options tip correct");

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...attempt.toObject(),
        timeTaken: attempt.getFormattedTimeTaken(), //  overwrite
      },
    });
  } catch (err) {
    next(err);
  }
};
