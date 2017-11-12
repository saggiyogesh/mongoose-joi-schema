const Joi = require('joi');
const { Schema } = require('mongoose');
const isPlainObject = require('is-plain-object');

const toJoiSchema = (obj, mongooseSchema, parentKey) => {
  if (obj instanceof Schema) {
    parentKey = mongooseSchema;
    mongooseSchema = obj;
    obj = mongooseSchema.tree;
  }
  const joiValidation = {};
  mongooseSchema = mongooseSchema || new Schema(obj);
  console.log('schemaObj--------', obj);
  console.log('monschema', Object.keys(mongooseSchema.paths));
  for (const [key, value] of Object.entries(obj)) {
    let pathKey = key;
    console.log('key--value', key, value);
    if (isPlainObject(value)) {
      joiValidation[key] = toJoiSchema(value, mongooseSchema, key);
    }
    if (parentKey) {
      pathKey = `${parentKey}.${key}`;
      console.log('in parent key', key);
    }
    if (mongooseSchema.paths[pathKey]) {
      console.log('mongooseSchema.paths[key]', key, pathKey, mongooseSchema.paths[pathKey]);
      const mongooseSchemaClass = mongooseSchema.paths[pathKey];
      const { instance } = mongooseSchemaClass;
      if (instance !== 'ObjectID') { // ignoring ObjectID joi validation
        let fn = Joi[instance.toLowerCase()]();
        if (instance === 'String') {
          // allow empty
          fn = fn.allow('');
        }
        joiValidation[key] = fn;
      }
    }
  }
  // console.log('joivali', joiValidation);
  return Joi.object().keys(joiValidation);
};

module.exports = toJoiSchema;