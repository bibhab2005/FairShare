

export const validateBody = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      const messages = error.issues.map((e) => e.message);
      return res.status(400).json({ message: messages.join(', '), errors: error.issues });
    }
    next(error);
  }
};
