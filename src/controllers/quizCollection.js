import QuizCollection from "../models/QuizCollection.js";

//  Create Quiz Collection
export const createCollection = async (req, res) => {
  try {
    const { title, description } = req.body;

    const collection = await QuizCollection.create({
      title,
      description,
      createdBy: req.user.id, 
    });

    res.status(201).json({
      success: true,
      data: collection,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//  Get All Collections
export const getAllCollections = async (req, res) => {
  try {
    const collections = await QuizCollection.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: collections.length,
      data: collections,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//  Get Single Collection
export const getCollectionById = async (req, res) => {
  try {
    const { id } = req.params;

    const collection = await QuizCollection.findById(id);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    res.status(200).json({
      success: true,
      data: collection,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//  Delete Collection
export const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;

    await QuizCollection.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Collection deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};