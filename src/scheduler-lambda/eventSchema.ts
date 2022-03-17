import Joi from "joi";

const eventSchema = Joi.object({
  id: Joi.string().required(),
  timestamp: Joi.number().required(),
});

export default eventSchema;
