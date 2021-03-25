const User = require('../models').User;
const express = require('express');
const router = express.Router();

router.post("/block", async (req, res) => {
  selectedRows = req.body.selectedRows;
  for (let id of selectedRows) {
    await User.update({
      status: 'Blocked',
    }, {
      where: {
        id: id,
      }
    })
  } try {
    res.status(200).json({ message: 'Success' })
  } catch {
    res.status(500).json({ message: 'Blocking users failed.' });
  }
})

router.post("/unblock", async (req, res) => {
  selectedRows = req.body.selectedRows;
  for (let id of selectedRows) {
    await User.update({
      status: 'Unblocked',
    }, {
      where: {
        id: id,
      }
    })
  } try {
    res.status(200).json({ message: 'Success' })
  } catch {
    res.status(500).json({ message: 'Unblocking users failed.' });
  }
})

router.post("/delete", async (req, res) => {
  selectedRows = req.body.selectedRows;
  for (let id of selectedRows) {
    await User.destroy({
      where: {
        id: id,
      }
    })
  } try {
    res.status(200).json({ message: 'Success' })
  } catch {
    res.status(500).json({ message: 'Deleting data failed.' });
  }
})

module.exports = router;