import { ENV, $http } from '@waldur/core/services';

import { Fetcher } from './types';

export function createFetcher(endpoint: string): Fetcher {
  return request => {
    const url = `${ENV.apiEndpoint}api/${endpoint}/`;
    const params = {
      page: request.currentPage,
      page_size: request.pageSize,
      ...request.filter,
    };
    return $http({
      method: 'GET',
      url,
      params,
    }).then(response => {
      const resultCount = parseInt(response.headers()['x-result-count'], 10);
      return {
        rows: Array.isArray(response.data) ? response.data : [],
        resultCount,
      };
    });
  };
}
