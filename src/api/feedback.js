import request from './request';

export const submitFeedback = (data) => {
  return request({
    url: '/api/feedback',
    method: 'POST',
    data,
  });
};
