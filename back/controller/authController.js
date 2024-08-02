const jwt = require('jsonwebtoken');

const users = {
  user1: 'password1', 
};

const secretKey = 'your_secret_key'; 

let blacklistedTokens = [];


module.exports = {

 login(req, res){
  const { username, password } = req.body;

  if (users[username] && users[username] === password) {
    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).send('Invalid credentials');
  }
},

logout (req, res) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  blacklistedTokens.push(token);
  res.sendStatus(204);
},

 authenticateToken (req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);
  if (blacklistedTokens.includes(token)) return res.sendStatus(403);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
},

protectedRoute (req, res) {
  res.send('This is a protected route');
}

}