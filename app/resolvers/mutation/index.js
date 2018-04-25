module.exports = {
  createUser: (root, args, context, info) => {
    const {name} = args;
    return context.db.mutation.createUser({
      data: {
        name
      },
    }, info);
  },
};
