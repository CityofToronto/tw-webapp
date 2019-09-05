/* eslint-disable @typescript-eslint/no-explicit-any */
import { IServerSideGetRowsRequest } from 'ag-grid-community';
import apolloClient from '@/apollo';
import { GridFilterModel } from '@/types/grid';
import { TableTypes } from '@/types/api';

// This adapts Ag-Grid into graphql query
// I suggest you turn back

const mapping = new Map([
  ['equals', '_eq'],
  ['notEqual', '_neq'],
  ['lessThan', '_lt'],
  ['lessThanOrEqual', '_lte'],
  ['greaterThanOrEqual', '_gte'],
  ['greaterThan', '_gt'],
  ['OR', '_or'],
  ['AND', '_and'],
  ['contains', '_ilike'],
  ['notContains', '_inlike'],
  ['startsWith', '_similar'],
  ['endsWith', '_similar'],
]);

enum GridFilterType {
  contains,
  notContains,
  startsWith,
  endsWith,
  default,
}

const getFilterFunction = (type: object): ((value: string) => string) => {
  // This returns how the value should be formatted for Hasura to like us
  const filterValue = (
    filterType: GridFilterType,
  ): ((value: string) => string) => {
    const modifiedValue = {
      [GridFilterType.contains]: (value: string): string => `%${value}%`,
      [GridFilterType.notContains]: (value: string): string => `%${value}%`,
      [GridFilterType.startsWith]: (value: string): string => `${value}%`,
      [GridFilterType.endsWith]: (value: string): string => `%${value}`,
      [GridFilterType.default]: (value: string): string => value,
    };
    return modifiedValue[filterType] || modifiedValue[GridFilterType.default];
  };

  const parseSingular: (
    key: string,
    condition: { type: string; filterType: string },
  ) => string = (
    key: string,
    condition: { type: string; filterType: string },
  ) =>
    `${key}: {${mapping.get(condition.type)}: "${filterValue(condition.type)(
      condition.filter,
    )}"}`;

  const parseMultiple: (key: string, value: any) => string = (key, value) => {
    const { condition1, condition2, operator } = value;
    return `${mapping.get(operator)}: [{${parseSingular(
      key,
      condition1,
    )}}, {${parseSingular(key, condition2)}}]`;
  };

  const parseArray = (key: string, value): string =>
    `${key}: {_in: [${value.values.map((x): string => `"${x}"`).join(',')}]}`;

  const filterFunctions = {
    text: type.operator ? parseMultiple : parseSingular,
    number: type.operator ? parseMultiple : parseSingular,
    array: parseArray,
  };
  return filterFunctions[type.filterType];
};

// Maps an object to array of 'colId: sort' pairs
const constructSortModel = (
  sortModel: { colId: string; sort: string }[],
): string => {
  return sortModel
    .map(
      (element: { colId: string; sort: string }): string =>
        `${element.colId}: ${element.sort}`,
    )
    .join(',');
};

const isTreeData = (columnNames: string[]): boolean => {
  return columnNames.includes('parent');
};

// TODO move evaluation into a config file?
// This checks if there is a column called parent, if so query for children with same columns
// We need to check for children to then determine if it is a group column
const constructColumnModel = async (
  columnNames: string[],
): Promise<string[]> => {
  if (isTreeData(columnNames)) {
    columnNames.push(`children {${columnNames}}`);
    return columnNames;
  }
  return columnNames;
};

const isSubTreeQuery = (groupKeys: number[] | string[]): boolean => {
  if (
    typeof groupKeys === 'undefined' ||
    groupKeys === null ||
    !groupKeys.length
  ) {
    return true;
  }
  return false;
};

export default class GridAdapter {
  private tableName: string;

  public async getColumnNames(): Promise<string[]> {
    const tableColumns = await apolloClient.getColumns(this.tableName);
    return tableColumns.map((col): string => col.name);
  }

  public constructor(tableName: string) {
    this.tableName = tableName;
  }

  public async constructFilterModel(
    filterModel: GridFilterModel,
    groupKeys: string[] | number[],
  ): Promise<string> {
    if (typeof filterModel === 'undefined' || filterModel === null) {
      return '';
    }

    const columnFilters = Object.entries(filterModel).map(
      ([key, value]): string => getFilterFunction(value)(key, value),
    );
    let groupFilters: string;
    if (!isTreeData(await this.getColumnNames())) {
      groupFilters = '';
    } else if (isSubTreeQuery(groupKeys)) {
      groupFilters = 'parent: {_is_null: true}';
    } else {
      groupFilters = `parent: {_in: [${groupKeys[groupKeys.length - 1]}]}`;
    }
    const joinedFilters = `{_and: {${columnFilters.join(
      ', ',
    )},${groupFilters}}}`;
    return joinedFilters;
  }

  public async buildQuery({
    startRow,
    endRow,
    filterModel,
    groupKeys,
    sortModel,
  }: IServerSideGetRowsRequest): Promise<string> {
    const constructedFilterModel = await this.constructFilterModel(
      filterModel,
      groupKeys,
    );
    const constructedSortModel = constructSortModel(sortModel);
    const constructedColumnModel = await constructColumnModel(
      await this.getColumnNames(),
    );
    return `
      ${this.tableName} (
        offset: ${startRow},
        limit: ${endRow},
        order_by: {
          ${constructedSortModel}
        },
        where: ${constructedFilterModel}
      ) {
        ${constructedColumnModel}
      }
    `;
  }
}
