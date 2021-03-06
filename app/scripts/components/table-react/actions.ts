export const FETCH_LIST_START = 'waldur/table/FETCH_START';
export const FETCH_LIST_DONE = 'waldur/table/FETCH_DONE';
export const FETCH_LIST_ERROR = 'waldur/table/FETCH_ERROR';
export const FETCH_LIST_GOTO_PAGE = 'waldur/table/GOTO_PAGE';
export const SET_FILTER_QUERY = 'waldur/table/SET_QUERY';
export const EXPORT_TABLE_AS = 'waldur/table/EXPORT';
export const RESET_PAGINATION = 'waldur/table/RESET_PAGINATION';

export const fetchListStart = (table: string, extraFilter?: any) => ({
  type: FETCH_LIST_START,
  payload: {
    table,
    extraFilter,
  },
});

export const fetchListDone = (table: string, rows: any[], resultCount: number) => ({
  type: FETCH_LIST_DONE,
  payload: {
    table,
    rows,
    resultCount,
  },
});

export const fetchListError = (table: string, error: any) => ({
  type: FETCH_LIST_ERROR,
  payload: {
    table,
    error,
  },
});

export const fetchListGotoPage = (table: string, page: number) => ({
  type: FETCH_LIST_GOTO_PAGE,
  payload: {
    table,
    page,
  },
});

export const exportTableAs = (table: string, format: string) => ({
  type: EXPORT_TABLE_AS,
  payload: {
    table,
    format,
  },
});

export const setFilterQuery = (table: string, query: string) => ({
  type: SET_FILTER_QUERY,
  payload: {
    table,
    query,
  },
});

export const resetPagination = (table: string) => ({
  type: RESET_PAGINATION,
  payload: {
    table,
  },
});
