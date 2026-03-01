//Temporary in-memory storage for bookings (replace with a database later)
const bookings = [];

// Temporary in-memory storage for classes (replace with a database later)
const classes = [
    {id: 1, name: 'Yoga', trainer: 'John' },
    {id: 2, name: 'Strength Training', trainer: 'Jane' },
];

const Max_Capacity = 20; // Maximum capacity for each class

function bookClass(req, res) {
    const { classId, userId } = req.body;
    //check if class exists 
    const selectedClass = classes.find(c => c.id === classId);
    if (!selectedClass) {
        return res.status(404).json({message: 'class not found'});
    }

    //Count current bookings for the class
    const currentBookings = bookings.filter(b => b.classId === classId).length;
    if (currentBookings >= Max_Capacity) {
        return res.status(400).json({message: 'class is fully booked'});
    }

    const alreadyBooked = bookings.find(b => b.userId === userId && b.classId === classId);
    if (alreadyBooked) {
        return res.status(400).json({message: 'user has already booked this class'})
    }

    bookings.push({ userId, classId });

    // Here you would normally save the booking to a database
    console.log(`User ${userId} booked class ${classId}`);

    res.json({ message: 'Class booked successfully!' });
}
module.exports = { bookClass };