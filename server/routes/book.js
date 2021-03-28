const Book = require('../models').Book;
const Rating = require('../models').Rating;
const Comment = require('../models').Comment;
const Chapter = require('../models').Chapter;
const User = require('../models').User;
const express = require('express');
const { Op } = require("sequelize");
const router = express.Router();

router.post('/createBook', async (req, res) => {
  if (req.user) {
    Book.create({
      title: req.body.title,
      author: req.body.author,
      authorId: req.body.authorId,
      tags: req.body.tags,
      description: req.body.desc,
      genre: req.body.genre.label,
      Chapters: req.body.chapters
    },
      {
        include: [Chapter],
      }
    )
      .then((dataChapters) => {
        res.send(dataChapters);
      })
      .catch((err) => {
        res.status(500).send({
          message:
            "Some error occurred while saving chapters."
        });
        console.log(err);
      });
  } else {
    return res.status(401).send({
      'message': 'You are not authenticated.',
    });
  }
})

router.post('/updateBook', async (req, res) => {
  if (req.user) {
    Book.update({
      title: req.body.title,
      author: req.body.author,
      authorId: req.body.authorId,
      tags: req.body.tags,
      description: req.body.desc,
      genre: req.body.genre.label,
    }, {
      where: {
        id: req.body.bookId,
      }
    }
    )
      .then((dataChapters) => {
        //res.send(dataChapters);
        req.body.chapters.map((obj) => {
          Chapter.upsert({
            id: obj.id,
            chapterId: obj.chapterId,
            text: obj.text,
            BookId: obj.BookId,
          }).then(data => {
          })
        })
      }
      )
      .catch((err) => {
        res.status(500).send({
          message:
            "Some error occurred while saving chapters."
        });
        console.log(err);
      });
  } else {
    return res.status(401).send({
      'message': 'You are not authenticated.',
    });
  }
})

router.get('/isRated', async (req, res) => {
  Rating.findOne({
    where: {
      BookId: req.query.bookId,
      UserId: req.query.authorId
    },
  }).then((data) => {
    if (data) {
      res.send({
        message: "User has already rated this book."
      })
    }
    else {
      res.send(null);
    }
  })
})

router.post('/addReply', async (req, res) => {
  Comment.create({
    author: req.body.author,
    UserId: req.body.authorId,
    BookId: req.body.bookId,
    text: req.body.text
  }).then((data) => {
    if (data) {
      res.send({
        message: "Comment created."
      })
    }
    else {
      res.send({
        message: "Comment not created."
      });
    }
  })
})

router.post('/setRating', async (req, res) => {
  Rating.findOne({
    where: {
      [Op.and]: [
        { BookId: req.body.bookId },
        { UserId: req.body.authorId }
      ]
    },
  })
    .then((data) => {
      if (data) {
        Rating.update({
          rating: req.body.rating,
        },
          {
            where: {
              UserId: req.body.authorId,
            }
          }).then(() => {
            Book.update({
              rating: req.body.rating,
              ratingCount: req.body.ratingCount
            },
              {
                where: {
                  id: req.body.bookId,
                }
              }).then(() => {
                res.send(data);
              })
          })
      } else {
        Rating.create({
          author: req.body.author,
          rating: req.body.rating,
          BookId: req.body.bookId,
          UserId: req.body.authorId,
        })
          .then(() => {
            Book.update({
              rating: req.body.rating,
              ratingCount: req.body.ratingCount
            },
              {
                where: {
                  id: req.body.bookId,
                }
              })
              .then((data) => {
                res.send(data);
              })
              .catch((err) => {
                res.status(500).send({
                  message:
                    "Error occured while updating rating of a book."
                });
                console.log(err);
              });
          })
          .catch((err) => {
            res.status(500).send({
              message:
                "Error occurred while setting rating."
            });
            console.log(err);
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: err.message
      })
    })
})

router.get('/allBooks', async (req, res) => {
  await Book.findAll()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message:
          "Some error occurred while retrieving books."
      });
    });
})

router.get('/allComments', async (req, res) => {
  await Comment.findAll()
  .then((data) => {
    res.send(data);
  })
  .catch((err) => {
    console.log(err);
    res.status(500).send({
      message:
        "An error occurred while retrieving comments."
    });
  });
})

router.get('/allChapters', async (req, res) => {
  await Chapter.findAll()
  .then((data) => {
    res.send(data);
  })
  .catch((err) => {
    console.log(err);
    res.status(500).send({
      message:
        "An error occurred while retrieving chapters."
    });
  });
})

router.get('/userBooks', async (req, res) => {
  await Book.findAll({
    where: {
      author: req.query.username
    }
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          "Some error occurred while retrieving books of a user."
      });
    });
})

router.get('/openBook', async (req, res) => {
  await Book.findOne({
    where: {
      title: req.query.title
    },
    include: [Chapter]
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          "Some error occurred while retrieving book."
      });
    });
})

router.post("/deleteChapter", async (req, res) => {
  await Chapter.destroy({
    where: {
      chapterId: req.body.chapterId,
      BookId: req.body.bookId,
    }
  })
  try {
    res.status(200).json({ message: 'Success' })
  } catch {
    res.status(500).json({ message: 'Deleting data failed.' });
  }
})

router.post("/deleteBook", async (req, res) => {
  await Book.destroy({
    where: {
      id: req.body.ID,
    }
  })
  try {
    res.status(200).json({ message: 'Success' })
  } catch {
    res.status(500).json({ message: 'Deleting data failed.' });
  }
})

router.get('/getTags', async (req, res) => {
  await Book.findAll({
    nest: true,
    attributes: ['tags']
  })
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          "Error" + err
      });
    });
})


module.exports = router;