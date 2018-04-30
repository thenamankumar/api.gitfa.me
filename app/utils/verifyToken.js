import jwt from 'jsonwebtoken';
import Raven from 'raven';

const verifyToken = token => {
  if (!token) {
    // no token present
    return null;
  }
  try {
    return jwt.verify(token.replace('Bearer ', ''), process.env.API_SECRET); // return user payload
  } catch (err) {
    // token not verified
    Raven.captureException(err); // send error to sentry
    return null;
  }
};

export default verifyToken;
