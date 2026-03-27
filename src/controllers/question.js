import Question from "../models/QuizQuestions.js";
import QuizCollection from "../models/QuizCollection.js";

//  Create Question
export const createQuestion = async (req, res) => {
  try {
    const { collectionId, question, options, correct, tip } = req.body;

    // check collection exists
    const collection = await QuizCollection.findById(collectionId);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const newQuestion = await Question.create({
      collectionId,
      question,
      options,
      correct,
      tip,
      createdBy: req.user._id,
    });

    // increment total questions
    await QuizCollection.findByIdAndUpdate(collectionId, {
      $inc: { totalQues: 1 },
    });

    res.status(201).json({
      success: true,
      data: newQuestion,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//  Get Questions by Collection (IMPORTANT API)
export const getQuestionsByCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;

    const questions = await Question.find({ collectionId });

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//  Get Single Question
export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//  Delete Question
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findByIdAndDelete(id);

    if (question) {
      await QuizCollection.findByIdAndUpdate(question.collectionId, {
        $inc: { totalQues: -1 },
      });
    }

    res.status(200).json({
      success: true,
      message: "Question deleted",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createBulkQuestions = async (req, res) => {
  try {
    const { questions } = req.body;

   const updatedQuestions = questions.map((q) => ({
  ...q,
  createdBy: req.user.id,
}));

const createdQuestions = await Question.insertMany(updatedQuestions);

    res.status(201).json({
      success: true,
      count: createdQuestions.length,
      data: createdQuestions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find();

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, options, correct, tip } = req.body;

    // find existing question
    const existingQuestion = await Question.findById(id);

    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // update fields (only if provided)
    if (question) existingQuestion.question = question;
    if (options) existingQuestion.options = options;
    if (correct) existingQuestion.correct = correct;
    if (tip) existingQuestion.tip = tip;

    const updatedQuestion = await existingQuestion.save();

    res.status(200).json({
      success: true,
      data: updatedQuestion,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};