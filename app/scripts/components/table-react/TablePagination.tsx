import * as React from 'react';
import * as Pagination from 'react-bootstrap/lib/Pagination';

import { TranslateProps } from '@waldur/i18n/types';

import { Pagination as PaginationProps } from './types';

interface TablePaginationProps extends TranslateProps, PaginationProps {
  gotoPage: (page: any) => void;
}

const TablePagination = (props: TablePaginationProps) => (
  <div className="text-right">
    <Pagination
      prev={props.translate('Previous')}
      next={props.translate('Next')}
      items={Math.ceil(props.resultCount / props.pageSize)}
      activePage={props.currentPage}
      onSelect={props.gotoPage}
      maxButtons={3}
      boundaryLinks={true}
    />
  </div>
);

export default TablePagination;
