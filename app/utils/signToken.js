import jwt from 'jsonwebtoken';

const signToken = async user => jwt.sign(user, process.env.API_SECRET);

export default signToken;
