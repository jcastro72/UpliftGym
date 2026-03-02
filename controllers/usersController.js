//Temporary in-memory storage for users (replace with a database later)
const users = [];

function getAllUsers(req, res) {
    res.json(users);
}

function createUser(req, res) {
    //Accept user name and email from frontend 
    const { name, email } = req.body;

    if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
}

    //Check if user with the same email already exists
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists." });
    }

    // Mock database ID generation (replace with actual database ID generation later)
    const userId = users.length + 1;

    const createdUser = { userId, name, email };
    users.push(createdUser);

    console.log(`User created: ${name} (${email})`);

    res.json(createdUser);  
}

module.exports = { getAllUsers, createUser };