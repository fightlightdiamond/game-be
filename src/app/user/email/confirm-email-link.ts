import { v4 } from 'uuid';

export const confirmEmailLink = (userId: number) => {
  const id = v4() + userId;
  return `${process.env.BE_HOST}/user/confirm/${id}`;
};
