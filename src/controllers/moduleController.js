import Module from "../models/Module.js";
import Question from "../models/QuizQuestions.js";

// Create a module
export const createModule = async (req, res, next) => {
  try {
    const { name, collectionId, order } = req.body;

    const existing = await Module.findOne({ 
      name: name.trim().toLowerCase(), 
      collectionId 
    });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: `Module "${name}" already exists in this collection` 
      });
    }

    const module = await Module.create({
      name: name.trim().toLowerCase(),
      collectionId,
      order: order ?? 0,
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, message: "Module created", data: module });
  } catch (err) {
    next(err);
  }
};

// Get all modules for a collection
export const getModulesByCollection = async (req, res, next) => {
  try {
    const { collectionId } = req.params;

    const modules = await Module.find({ collectionId }).sort({ order: 1 });

    res.status(200).json({ success: true, total: modules.length, data: modules });
  } catch (err) {
    next(err);
  }
};

// Add bulk questions to a module
export const addQuestionsToModule = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const { questions } = req.body;

    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ success: false, message: "Module not found" });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: "Questions array required" });
    }

    // ── Max 3 questions per module check ──
    const currentCount = await Question.countDocuments({ moduleId: module._id });
    const incoming = questions.length;

   if (currentCount >= 3) {
  return res.status(400).json({ 
    success: false, 
    message: `Each module allows only 3 questions. "${module.name}" already has all 3 questions added.`,
  });
}

if (currentCount + incoming > 3) {
  return res.status(400).json({ 
    success: false, 
    message: `Each module allows only 3 questions. "${module.name}" currently has ${currentCount}/3 — you can only add ${3 - currentCount} more question${3 - currentCount > 1 ? "s" : ""}.`,
  });
}

    const docs = questions.map((q) => ({
      ...q,
      moduleId: module._id,
      moduleName: module.name,
      collectionId: module.collectionId,
      createdBy: req.user.id,
    }));

    const created = await Question.insertMany(docs);

    const count = await Question.countDocuments({ moduleId: module._id });
    await Module.findByIdAndUpdate(moduleId, { totalQues: count });

    res.status(201).json({
      success: true,
      message: `${created.length} questions added to "${module.name}"`,
      data: created,
    });
  } catch (err) {
    next(err);
  }
};

// Update module
export const updateModule = async (req, res, next) => {
  try {
    const updated = await Module.findByIdAndUpdate(
      req.params.moduleId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Module not found" });
    }

    res.status(200).json({ success: true, message: "Module updated", data: updated });
  } catch (err) {
    next(err);
  }
};

// Delete module + its questions
export const deleteModule = async (req, res, next) => {
  try {
    const module = await Module.findByIdAndDelete(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ success: false, message: "Module not found" });
    }

    await Question.deleteMany({ moduleId: module._id });

    res.status(200).json({ success: true, message: "Module and questions deleted" });
  } catch (err) {
    next(err);
  }
};

export const getAllModules = async (req, res, next) => {
  try {
    const modules = await Module.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, total: modules.length, data: modules });
  } catch (err) {
    next(err);
  }
};
