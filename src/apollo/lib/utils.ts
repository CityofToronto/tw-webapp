import { QueryError, RowData } from '@/apollo/types';
import { storeInstance } from '@/store';
import { NotificationPosition } from '@/store/modules/notification';
import { GridFilterModel } from '@/types/grid';

// This the mappings from AgGrid to GraphQL Query
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

enum FilterType {
  Text,
  Number,
  Array,
}

// TODO Type this file

export const stringify = (data: RowData): string => Object.entries(data)
  .filter(([, value]): boolean => value !== '') // Remove blank values (usually just id on new row)
  .map(([key, value]): string => `${key}: "${value}"`)
  .join();

/**
 * Takes in an error object
 * Then an error bar is displayed
 * Through a Vuetify snackbar
 */
export const dispatchError = (error: QueryError): never => {
  storeInstance.notification.pushNotification({
    message: error.message,
    color: 'error',
    position: [NotificationPosition.Top],
  });
  throw Error(error.message);
};

const getFilterFunction = (type: object): string => {
  // This returns how the value should be formatted for Hasura to like us
  const filterValue = (filterType: GridFilterType): (value: string) => string => {
    const modifiedValue = {
      [GridFilterType.contains]: (value: string): string => `%${value}%`,
      [GridFilterType.notContains]: (value: string): string => `%${value}%`,
      [GridFilterType.startsWith]: (value: string): string => `${value}%`,
      [GridFilterType.endsWith]: (value: string): string => `%${value}`,
      [GridFilterType.default]: (value: string): string => value,

    };
    return modifiedValue[filterType] || modifiedValue[GridFilterType.default];
  };

  const parseSingular: string = (key: string, condition: {type: string; filterType: string}) => `${key}: {${mapping.get(condition.type)}: "${filterValue(condition.type)(condition.filter)}"}`;
  const parseMultiple: string = (key, value) => {
    const { condition1, condition2, operator } = value;
    return `${mapping.get(operator)}: [{${parseSingular(key, condition1)}}, {${parseSingular(key, condition2)}}]`;
  };

  const parseArray = (key, value) => `${key}: {_in: [${value.values.map((x) => `"${x}"`).join(',')}]}`;

  const filterFunctions = {
    text: type.operator ? parseMultiple : parseSingular,
    number: type.operator ? parseMultiple : parseSingular,
    array: parseArray,
  };
  return filterFunctions[type.filterType];
};

/**
 * This filter constructs a GraphQL with all the different
 * types of relationships such as contains, equals, and, or
 */
export const constructFilter = (filterModel: GridFilterModel): string | undefined => {
  if (typeof filterModel === 'undefined' || filterModel === null) {
    return '';
  }
  const columnFilters = Object.entries(filterModel).map(([key, value]) => getFilterFunction(value)(key, value));
  const joinedFilters = `{_and: {${columnFilters.join(', ')}}}`;
  return joinedFilters;
};
