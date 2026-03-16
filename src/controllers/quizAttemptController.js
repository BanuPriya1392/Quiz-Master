import Question from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";

/* ─────────────────────────────────────────────────────────────
   GET /api/user/quiz
   Frontend: fetches questions to render quiz screen
   correct field hidden — student cannot see answers
───────────────────────────────────────────────────────────── */
export const getQuizQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find()
      .select("-correct -tip -createdAt -updatedAt")
      .sort({ createdAt: 1 });

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No questions found. Please contact your mentor.",
      });
    }

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

/* ─────────────────────────────────────────────────────────────
   POST /api/user/quiz/submit
   Frontend sends: { answers, timeTaken }
   Server auto-generates: score, percentage, status, isCorrect
───────────────────────────────────────────────────────────── */
export const submitQuiz = async (req, res, next) => {
  try {
    const { answers, timeTaken } = req.body; // ✅ only answers & timeTaken needed
    const userId = req.user.id;

    // Already attempted today check
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

    // Verify all questionIds exist in DB
    const questionIds = answers.map((a) => a.questionId);
    const dbQuestions = await Question.find({ _id: { $in: questionIds } });

    if (dbQuestions.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Invalid question IDs in answers.",
      });
    }

    // Server-side score calculation — tamper proof
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
        isCorrect: isCorrect || false, // ✅ auto-calculated
      };
    });

    // ✅ score, percentage, status all auto-generated — no frontend values trusted
    const attempt = await QuizAttempt.create({
      userId,
      answers: verifiedAnswers,
      score: serverScore, // ✅ auto
      percentage: Math.round((serverScore / 10) * 100), // ✅ auto
      timeTaken,
      status: serverScore / 10 >= 0.7 ? "Passed" : "Failed", // ✅ auto
    });

    res.status(201).json({
      success: true,
      message: "Quiz submitted successfully.",
      data: {
        score: attempt.score,
        percentage: attempt.percentage,
        timeTaken: attempt.timeTaken,
        status: attempt.status,
        attemptId: attempt._id,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /api/user/quiz/my-attempts
   Frontend: attempts history screen
───────────────────────────────────────────────────────────── */
export const getMyAttempts = async (req, res, next) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.user.id })
      .select("-answers") // summary only
      .sort({ createdAt: -1 }); // latest first

    res.status(200).json({
      success: true,
      total: attempts.length,
      data: attempts,
    });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /api/user/quiz/my-attempts/:attemptId
   Frontend: result screen — shows correct answers & tips
───────────────────────────────────────────────────────────── */
export const getAttemptById = async (req, res, next) => {
  try {
    const attempt = await QuizAttempt.findOne({
      _id: req.params.attemptId,
      userId: req.user.id, // own attempt only
    }).populate("answers.questionId", "question options tip correct");

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found.",
      });
    }

    res.status(200).json({ success: true, data: attempt });
  } catch (err) {
    next(err);
  }
};
