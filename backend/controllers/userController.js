exports.getProfile = async (req, res) => {
  res.json(req.user);
};

exports.updateProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();
    res.json({ name: user.name, email: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating profile" });
  }
};
