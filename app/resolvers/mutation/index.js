module.exports = {
  createUser: (root, args, context, info) => {
    const {name} = args;
    console.log(name);
    return context.db.mutation.createUser({
      data: {
        name
      },
    }, info);
  },
};
