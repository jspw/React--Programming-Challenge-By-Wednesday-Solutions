import { create } from 'apisauce';
import snakeCase from 'lodash/snakeCase';
import camelCase from 'lodash/camelCase';
import { mapKeysDeep } from './index';

// const { ITUNES_URL } = process.env;

const ITUNES_URL = 'https://itunes.apple.com/';

const apiClients = {
  itunes: null,
  default: null
};
export const getApiClient = (type = 'itunes') => apiClients[type];
export const generateApiClient = (type = 'itunes') => {
  console.log('Base url', ITUNES_URL);
  switch (type) {
    case 'itunes':
      apiClients[type] = createApiClientWithTransForm(ITUNES_URL);
      return apiClients[type];
    default:
      apiClients.default = createApiClientWithTransForm(ITUNES_URL);
      return apiClients.default;
  }
};

export const createApiClientWithTransForm = baseURL => {
  const api = create({
    baseURL,
    headers: { 'Content-Type': 'application/json' }
  });
  api.addResponseTransform(response => {
    const { ok, data } = response;
    if (ok && data) {
      console.log(data);
      response.data = mapKeysDeep(data, keys => camelCase(keys));
      console.log(response.data);
    }
    return response;
  });

  api.addRequestTransform(request => {
    const { data } = request;
    if (data) {
      console.log(data);
      request.data = mapKeysDeep(data, keys => snakeCase(keys));
    }
    return request;
  });
  return api;
};
