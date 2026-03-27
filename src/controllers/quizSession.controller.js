import QuizSession from "../models/quizSession.model.js";
import Question from "../models/QuizQuestions.js";

/* ─────────────────────────────────────────────────────────────
   POST /api/quiz/start
   - Random 10 questions fetch for session creation
───────────────────────────────────────────────────────────── */
export const startQuizSession = async (req, res, next) => {
  try {
    const { title } = req.body;

    // Random 10 questions fetch
    const questions = await Question.aggregate([
      { $match: { title: new RegExp(`^${title.trim()}$`, "i") } },
      { $sample: { size: 10 } },
    ]);

    if (questions.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Not enough questions available.",
      });
    }

    // Session create
    const session = await QuizSession.create({
      user: req.user.id,
      questions: questions.map((q) => q._id),
      totalQuestions: 10,
      timeLimit: "10 Min:00 Sec", 
      startedAt: Date.now(),
    });

    res.status(201).json({
      success: true,
      message: "Quiz session started.",
      data: {
        sessionId: session._id,
        timeLimit: session.timeLimit,
        questions: questions,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────
   PUT /api/quiz/complete/:sessionId
───────────────────────────────────────────────────────────── */
export const completeQuizSession = async (req, res, next) => {
  try {
    const { score } = req.body;

    const session = await QuizSession.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found.",
      });
    }

    const completedAt = Date.now();
    const timeTaken = completedAt - session.startedAt;

    // After 10 minutes shows error
    const TEN_MINUTES = 10 * 60 * 1000; // milliseconds
    if (timeTaken > TEN_MINUTES) {
      return res.status(400).json({
        success: false,
        message: "Time limit exceeded. Quiz session expired.",
      });
    }

    // Format time
    const totalSeconds = Math.floor(timeTaken / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formattedTime = `${String(minutes).padStart(2, "0")} Min:${String(seconds).padStart(2, "0")} Sec`;

    await QuizSession.findByIdAndUpdate(
      req.params.sessionId,
      { score, isCompleted: true, completedAt },
      { returnDocument: "after" }
    );

    res.status(200).json({
      success: true,
      message: "Quiz completed.",
      data: {
        score,
        totalQuestions: session.totalQuestions,
        timeTaken: formattedTime,
        completedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};