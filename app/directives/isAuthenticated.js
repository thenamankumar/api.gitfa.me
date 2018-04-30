/*
  If user present in the context, which means it is already verified
  return the data otherwise return null
*/
const isAuthenticated = (next, source, args, { user }) => (user ? next() : null);

export default isAuthenticated;
