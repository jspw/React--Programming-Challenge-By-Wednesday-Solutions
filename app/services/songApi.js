import { generateApiClient } from '@utils/apiUtils';
const songApi = generateApiClient('itunes');

export const getSongs = artistName => songApi.get(`search?term=${artistName}`);
