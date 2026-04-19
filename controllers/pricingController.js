const db = require('../db');

// GET all pricing
const getPricing = (req, res) => {
  const query = 'SELECT * FROM pricing';

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ ok: false, message: 'DB error' });
    }

    res.json({ ok: true, pricing: results });
  });
};

// UPDATE pricing
const updatePricing = (req, res) => {
  const updates = req.body; // array of { pricing_key, price }

  if (!Array.isArray(updates)) {
    return res.status(400).json({ ok: false, message: 'Invalid data' });
  }

  const promises = updates.map(item => {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE pricing SET price = ? WHERE pricing_key = ?';
      db.query(query, [item.price, item.pricing_key], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  Promise.all(promises)
    .then(() => {
      res.json({ ok: true, message: 'Pricing updated' });
    })
    .catch(() => {
      res.status(500).json({ ok: false, message: 'Update failed' });
    });
};

module.exports = {
  getPricing,
  updatePricing
};