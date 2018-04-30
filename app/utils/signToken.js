import jwt from 'jsonwebtoken';

const generateToken = user => jwt.sign(user, process.env.API_SECRET);

export default generateToken;
