import Question from "../models/Quiz.js";

/* ─────────────────────────────────────────────────────────────
   GET /api/mentor/quiz
───────────────────────────────────────────────────────────── */
export const getAllQuestions = async (req, res, next) => {
  try {
    const { title } = req.query;
    const filter = { createdBy: req.user.id };  

    if (title) {
      filter.title = { $regex: new RegExp(`^${title.trim()}$`, "i") };
    }

    const questions = await Question.find(filter).sort({ createdAt: 1 });

    const availableTitles = await Question.distinct("title", { createdBy: req.user.id }); 

    res.status(200).json({
      success: true,
      total: questions.length,
      availableTitles,
      data: questions,
    });
  } catch (err) {
    next(err);
  }
};
/* ─────────────────────────────────────────────────────────────
   GET /api/mentor/quiz/:id
───────────────────────────────────────────────────────────── */
export const getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findOne({ 
  _id: req.params.id, 
  createdBy: req.user.id 
});
    if (!question) {
      return res.status(404).json({
        success: false,
        message: `Question "${req.params.id}" not found.`,
      });
    }
    res.status(200).json({ success: true, data: question });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────
   POST /api/mentor/quiz
   Body: { title, question, options, correct, tip }
───────────────────────────────────────────────────────────── */
export const createQuestion = async (req, res, next) => {
  try {
     
    const { title, question, options, correct, tip } = req.body;

    const created = await Question.create({
      title:     title.trim(),
      question:  question.trim(),

      options:   options.map((o) => ({ id: o.id, text: o.text.trim() })),
      correct,
      tip:       tip.trim(),
      createdBy: req.user.id,  
    });

    res.status(201).json({
      success: true,
      message: `Question added to "${title}" quiz successfully.`,
      data: created,
    });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────
   PUT /api/mentor/quiz/:id
───────────────────────────────────────────────────────────── */
export const updateQuestion = async (req, res, next) => {
  try {
    const { title, question, options, correct, tip } = req.body;

    const updated = await Question.findByIdAndUpdate(
       { _id: req.params.id, createdBy: req.user.id },
      {
        title:    title.trim(),
        question: question.trim(),
        options:  options.map((o) => ({ id: o.id, text: o.text.trim() })),
        correct,
        tip:      tip.trim(),
      },
      {  returnDocument: "after", runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Question "${req.params.id}" not found.`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Question updated successfully.",
      data:    updated,
    });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────
   DELETE /api/mentor/quiz/:id
───────────────────────────────────────────────────────────── */
export const deleteQuestion = async (req, res, next) => {
  try {
    const deleted = await Question.findByIdAndDelete( {_id: req.params.id,
      createdBy: req.user.id, 
    });
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Question "${req.params.id}" not found.`,
      });
    }
    res.status(200).json({
      success: true,
      message: `Question deleted from "${deleted.title}" quiz successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

/* POST /api/mentor/quiz/bulk */
export const createBulkQuestions = async (req, res, next) => {
  try {
    const { title, questions } = req.body;
    // questions = array of { question, options, correct, tip }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Questions array is required.",
      });
    }

    if (questions.length > 10) {
      return res.status(400).json({
        success: false,
        message: "Maximum 10 questions allowed per bulk insert.",
      });
    }

    // Existing count check
    const existingCount = await Question.countDocuments({
      title: { $regex: new RegExp(`^${title.trim()}$`, "i") },
      createdBy: req.user.id,
    });

    if (existingCount + questions.length > 10) {
      return res.status(400).json({
        success: false,
        message: `"${title}" already has ${existingCount} questions. You can add only ${10 - existingCount} more.`,
      });
    }

    // All questions
    const docs = questions.map((q) => ({
      title:     title.trim(),
      question:  q.question.trim(),
      options:   q.options.map((o) => ({ id: o.id, text: o.text.trim() })),
      correct:   q.correct,
      tip:       q.tip.trim(),
      createdBy: req.user.id,
    }));

    const created = await Question.insertMany(docs);

    res.status(201).json({
      success: true,
      message: `${created.length} questions added to "${title}" successfully.`,
      data: created,
    });
  } catch (err) {
    next(err);
  }
};