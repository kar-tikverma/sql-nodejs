const express = require("express");
const mysql2 = require("mysql2");
const path = require("path");
const methodOverride = require("method-override");

const app = express();

app.set("view engine", "ejs");
const viewsDir = process.env.VIEWS_DIR
  ? path.resolve(process.env.VIEWS_DIR)
  : path.join(__dirname, "views");
app.set("views", viewsDir);

const publicDir = process.env.STATIC_DIR
  ? path.resolve(process.env.STATIC_DIR)
  : path.join(__dirname, "public");
app.use(express.static(publicDir));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

const conn = mysql2.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD
});

conn.connect()

app.get("/", (req, res) => {
    const q = "SELECT COUNT(*) AS userCount FROM user";
    conn.query(q, (err, result) => {
        if (err) throw err;
        const userCount = result[0]['userCount'];
        res.render("index.ejs", { userCount });
    });
});

app.get("/users", (req, res) => {
    const q = "SELECT * FROM user";
    conn.query(q, (err, result) => {
        if (err) throw err;
        res.render("users.ejs", { result, port });
    });
});

app.get("/users/:id/auth", (req, res) => {
    const { id } = req.params;
    const { action } = req.query;
    const incorrectPass = false;
    res.render("password.ejs", { port, id, action, incorrectPass });
});

app.post("/users/:id/authenticate", (req, res) => {
    const { id } = req.params;
    const { action } = req.query;
    const { password } = req.body;

    const q = "SELECT * FROM user WHERE id = ?";
    conn.query(q, id, (err, result) => {
        if (err) throw err;
        if (password !== result[0].password) {
            const incorrectPass = true;
            res.render("password.ejs", { port, id, action, incorrectPass });
        } else if (action == 1) {
            const q2 = "DELETE FROM user WHERE id = ?";
            conn.query(q2, id, (err2, result2) => {
                if (err2) throw err2;
                res.redirect("/users");
            });
        } else {
            const user = result[0];
            const duplicateEmail = false;
            res.render("edit.ejs", { port, user, duplicateEmail });
        }
    });
});

app.get("/check-username", (req, res) => {
    const { username } = req.query;
    const q = "SELECT * FROM user WHERE username = ?";
    conn.query(q, username, (err, result) => {
        if (err) throw err;
        if (result.length != 0) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    });
});

app.patch("/users/:id", (req, res) => {
    const { id } = req.params;
    const { username, email } = req.body;

    const q = "SELECT * FROM user WHERE id = ?";
    conn.query(q, id, (err, result) => {
        if (err) throw err;
        if (email !== result[0].email) {
            const checkEmail = "SELECT * FROM user WHERE email = ?";
            conn.query(checkEmail, email, (err2, result2) => {
                if (err2) throw err2;
                if (result2.length != 0) {
                    const user = {
                        id,
                        username,
                        email
                    };
                    const duplicateEmail = true;
                    res.render("edit.ejs", { port, user, duplicateEmail });
                } else if (username !== result[0].username) {
                    const q3 = "UPDATE user SET username = ?, email = ? WHERE id = ?";
                    conn.query(q3, [username, email, id], (err3, result3) => {
                        if (err3) throw err3;
                    });
                    res.redirect("/users");
                } else {
                    if (username !== result[0].username) {
                        const q3 = "UPDATE user SET username = ?, email = ? WHERE id = ?";
                        conn.query(q3, [username, email, id], (err3, result3) => {
                            if (err3) throw err3;
                            res.redirect("/users");
                        });
                    } else {
                        const q3 = "UPDATE user SET email = ? WHERE id = ?";
                        conn.query(q3, [email, id], (err3, result3) => {
                            if (err3) throw err3;
                            res.redirect("/users");
                        });
                    }
                }
            });
        } else if (username !== result[0].username) {
            const q2 = "UPDATE user SET username = ? WHERE id = ?";
            conn.query(q2, [username, id], (err2, result2) => {
                if (err2) throw err2;
                res.redirect("/users");
            });
        }
    });
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

process.on('SIGINT', () => {
    console.log('Received SIGINT. Closing MySQL connection...');
    conn.end((err) => {
        if (err) {
            console.error('Error while closing MySQL connection:', err);
        } else {
            console.log('MySQL connection closed.');
        }
        server.close(() => {
            console.log('Server closed. Exiting process...');
            process.exit(0);
        });
    });
});