
const applyOptions = (query, select = "", options = {}) => {
  if (select) query.select(select);

  if (options.populate) query.populate(options.populate);

  if (options.sort) query.sort(options.sort);

  if (options.limit !== undefined) query.limit(options.limit);

  if (options.skip !== undefined) query.skip(options.skip);

  if (options.lean) query.lean();

  return query;
};

// findOne
export const findOne = (model, filter = {}, select = "", options = {}) => {
  return applyOptions(model.findOne(filter), select, options).exec();
};

// find
export const find = (model, filter = {}, select = "", options = {}) => {
  return applyOptions(model.find(filter), select, options).exec();
};

// findById
export const findById = (model, id, select = "", options = {}) => {
  return applyOptions(model.findById(id), select, options).exec();
};

// create
export const create = async (model, data, options = {}) => {
  const [doc] = await model.create([data], options);
  return doc;
};

// insertMany
export const insertMany = (model, data = [], options = {}) => {
  return model.insertMany(data, options);
};

// updateOne
export const updateOne = (model, filter = {}, update = {}, options = {}) => {
  return model
    .updateOne(filter, update, {
      runValidators: true,
      ...options,
    })
    .exec();
};

// updateMany
export const updateMany = (model, filter = {}, update = {}, options = {}) => {
  return model
    .updateMany(filter, update, {
      runValidators: true,
      ...options,
    })
    .exec();
};

// findOneAndUpdate
export const findOneAndUpdate = (
  model,
  filter = {},
  update = {},
  select = "",
  options = {},
) => {
  const query = model.findOneAndUpdate(filter, update, {
    runValidators: true,
    new: true,
    ...options,
  });

  return applyOptions(query, select, options).exec();
};

// findByIdAndUpdate
export const findByIdAndUpdate = (
  model,
  id,
  update = {},
  select = "",
  options = {},
) => {
  const query = model.findByIdAndUpdate(id, update, {
    runValidators: true,
    new: true,
    ...options,
  });

  return applyOptions(query, select, options).exec();
};

// deleteOne
export const deleteOne = (model, filter = {}, options = {}) => {
  return model.deleteOne(filter, options).exec();
};

// deleteMany
export const deleteMany = (model, filter = {}, options = {}) => {
  return model.deleteMany(filter, options).exec();
};

// findOneAndDelete
export const findOneAndDelete = (
  model,
  filter = {},
  select = "",
  options = {},
) => {
  const query = model.findOneAndDelete(filter, options);

  return applyOptions(query, select, options).exec();
};

// findByIdAndDelete
export const findByIdAndDelete = (
  model,
  id,
  select = "",
  options = {},
) => {
  const query = model.findByIdAndDelete(id, options);

  return applyOptions(query, select, options).exec();
};
