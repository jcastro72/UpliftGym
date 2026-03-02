function getAllClasses(req, res) {
    // Hardcoded list of classes for demonstration purposes
    const classes = [
        {id: 1, name: 'Yoga', trainer: 'John' },
        {id: 2, name: 'Strength Training', trainer: 'Jane' },
    ];
    res.json(classes);
}

module.exports = { getAllClasses };