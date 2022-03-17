import Joi from "joi";

const bodyschema = Joi.object({
  id: Joi.string().required(),
  timestamp: Joi.number().required(),
});

export default bodyschema;
