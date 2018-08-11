import pool from '../db/pool';

const badRequest = { status: 400, message: 'Bad Request' };

const isEditable = (req) => {
  pool.query('SELECT EXTRACT (day FROM time_created) as day, EXTRACT (month FROM time_created) as month, EXTRACT (isoyear FROM time_created) as year FROM entries WHERE id = $1', [req.params.id], (error, response) => {
    if (response.rows[0] !== undefined) {
      const date = new Date();
      const currentDay = date.getDate();
      const currentMonth = date.getMonth() + 1;
      const currentYear = date.getFullYear();

      const createdDay = response.rows[0].day;
      const createdMonth = response.rows[0].month;
      const createdYear = response.rows[0].year;

      const dayDiff = createdDay - currentDay;
      const monthDiff = currentMonth - createdMonth;
      const yearDiff = createdYear - currentYear;


      if (dayDiff === 0 && monthDiff === 0 && yearDiff === 0) {
        return true;
      }
      return false;
    }
    return false;
  });
};

const getEntry = (req, res) => {
  pool.query('SELECT * FROM entries WHERE (id, user_id) = ($1, $2)', [req.params.id, req.userData.userId], (err, dbRes) => {
    if (err) {
      const reply = { status: '500', message: 'Internal Server Error', description: 'Could not retrieve entry' };
      res.status(500).send(reply);
    } else {
      // console.log(dbRes.rows[0]);
      const reply = {
        status: '404', message: 'Entry Not Found',
      };
      if (dbRes.rows[0] === undefined) {
        res.status(404).send(reply);
      } else {
        const goodReply = { status: '200', message: 'Entry returned successfully', entry: dbRes.rows[0] };
        res.status(200).send(goodReply);
      }
    }
  });
};

const getEntries = (req, res) => {
  pool.query('SELECT * FROM entries WHERE user_id = ($1) ORDER BY id DESC', [req.userData.userId], (err, dbRes) => {
    if (err) {
      // console.log(err.stack);
      const reply = { status: '500', message: 'Internal Server Error', description: 'Could not retrieve entry' };
      res.status(500).send(reply);
    } else {
      const db = { entries: dbRes.rows, size: dbRes.rows.length };
      const reply = {
        status: '404', message: 'Entry Not Found',
      };
      if (dbRes.rows === undefined) {
        res.status(404).send(reply);
      } else {
        const goodReply = { status: '200', message: 'Entries returned successfully', data: db };
        res.status(200).send(goodReply);
      }
    }
  });
};

const createEntry = (req, res) => {
  if (req.body.text == null || req.body.title == null) {
    badRequest.description = 'Body or title cannot be empty';
    res.status(400).send(badRequest);
  } else {
    pool.query('INSERT INTO entries(title, description, user_id) values($1, $2, $3)',
      [req.body.title, req.body.text, req.userData.userId], (error) => {
        if (error) {
          const replyServer = { status: '500', message: 'Internal Server Error', description: 'Could not post entry' };
          res.status(500).send(replyServer);
        } else {
          pool.query('SELECT * FROM entries WHERE user_id = ($1) ORDER BY id DESC', [req.userData.userId], (err, dbRes) => {
            if (err) {
              const reply = { status: '500', message: 'Internal Server Error', description: 'Could not retrieve entry' };
              res.status(500).send(reply);
            } else {
              const db = { entries: dbRes.rows, size: dbRes.rows.length };
              const reply = { status: '404', message: 'Entry Not Found' };
              if (dbRes.rows === undefined) {
                res.status(404).send(reply);
              } else {
                const goodReply = { status: '201', message: 'Entry Created successfully', data: db };
                res.status(201).send(goodReply);
              }
            }
          });
        }
      });
  }
};

const updateEntry = (req, res) => {
  if (!isEditable(req)) {
    pool.query('UPDATE entries SET title = ($1), description = ($2) WHERE (id, user_id) = ($3, $4)',
      [req.body.title, req.body.text, req.params.id, req.userData.userId], (error) => {
        if (error) {
          const replyServer = { status: '500', message: 'Internal Server Error', description: 'Could not update entry' };
          res.status(500).send(replyServer);
        } else {
          pool.query('SELECT * FROM entries WHERE user_id = ($1) ORDER BY id DESC', [req.userData.userId], (err, dbRes) => {
            if (err) {
              const reply = { status: '500', message: 'Internal Server Error', description: 'Could not retrieve entry' };
              res.status(500).send(reply);
            } else {
              const db = { entries: dbRes.rows, size: dbRes.rows.length };
              const reply = { status: '404', message: 'Entry Not Found' };
              if (dbRes.rows === undefined) {
                res.status(404).send(reply);
              } else {
                const goodReply = { status: '200', message: 'Entry Modified successfully', entry: db };
                res.status(200).send(goodReply);
              }
            }
          });
        }
      });
  } else {
    const Reply = { status: '200', message: 'Entry can not be modified' };
    res.status(200).send(Reply);
  }
};

const deleteEntry = (req, res) => {
  let reply = {};
  pool.query('DELETE FROM entries WHERE (id, user_id) = ($1, $2)', [req.params.id, req.userData.userId], (err, result) => {
    if (err) {
      reply = { status: '500', message: 'Internal Server Error', description: 'Could not delete Entry' };
      res.status(500).send(reply);
    } else {
      pool.query('SELECT * FROM entries WHERE user_id = ($1) ORDER BY id DESC', [req.userData.userId], (error, dbRes) => {
        if (error) {
          res.status(500).send(reply);
        } else {
          const db = { entries: dbRes.rows, size: dbRes.rows.length };
          const badReply = { status: '404', message: 'Entry Not Found' };
          if (dbRes.rows === undefined) {
            res.status(404).send(badReply);
          } else {
            const goodReply = { status: '200', message: 'Entry Deleted successfully', entry: db };
            if (result.rowCount === 0) {
              const badDeleteReply = { status: '404', message: 'Entry does not exist' };
              res.status(200).send(badDeleteReply);
            } else {
              res.status(200).send(goodReply);
            }
          }
        }
      });
    }
  });
};

export {
  getEntry, getEntries, createEntry, updateEntry, deleteEntry,
};
