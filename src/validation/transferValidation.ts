import Joi from "@hapi/joi";

interface transferData {
  reference: string;
  amount: number;
  receiverAccountNumber: number;
  senderAccountNumber: number;
  transferDescription: string;
}

export const transferValidationInput = (data: transferData) => {
  const schema = Joi.object({
    reference: Joi.string().min(6),
    senderAccountNumber: Joi.number().required(),
    amount: Joi.number().required(),
    receiverAccountNumber: Joi.number().required(),
    transferDescription: Joi.string().required(),
  });

  return schema.validate(data);
};
