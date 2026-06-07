const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert(require('../config/service_key.json')),
});
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    req.user = { uid };
    console.log("Reequesting userin the frontend is ",req.user)
    next();
  } catch (error) {
    console.error('Error verifying token:', error.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
 
module.exports= verifyToken