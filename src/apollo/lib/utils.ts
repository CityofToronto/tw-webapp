import { QueryError, RowData } from '@/apollo/types';
import { storeInstance } from '@/store';
import { NotificationPosition } from "@/store/modules/notification";

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

const parse = (type: object): string => {
  const filterValue = (filterType: string) => {
    const modifiedValue = {
      contains: (value: string) => `%${value}%`,
      notContains: (value: string) => `%${value}%`,
      startsWith: (value: string) => `${value}%`,
      endsWith: (value: string) => `%${value}`,
      default: (value: string) => value,

    };
    return modifiedValue[filterType] || modifiedValue.default;
  };

  const parseSingular = (key: string, condition: {type: string; filterType: string}) => `${key}: {${mapping.get(condition.type)}: "${filterValue(condition.type)(condition.filter)}"}`;
  const parseMultiple = (key, value) => {
    const { condition1, condition2, operator } = value;
    return `${mapping.get(operator)}: [{${parseSingular(key, condition1)}}, {${parseSingular(key, condition2)}}]`;
  };

  const parseSet = (key, value) => `${key}: {_in: [${value.values.map((x) => `"${x}"`).join(',')}]}`;

  const filterFunctions = {
    text: type.operator ? parseMultiple : parseSingular,
    number: type.operator ? parseMultiple : parseSingular,
    set: parseSet,
  };
  return filterFunctions[type.filterType];
};

// This filter constructs a GraphQL with all the different
// types of relationships such as contains, equals, and, or
export const constructFilter = (sortModel) => {
  if (typeof sortModel === 'undefined' || sortModel === null) {
    return '{}';
  }
  const columnFilters = Object.entries(sortModel).map(([key, value]) => parse(value)(key, value));
  const joinedFilters = `{_and: {${columnFilters.join(', ')}}}`;
  return joinedFilters;
};

// This simple filter just maps key:value to key: {_eq: "value"} and joins
export const constructSimpleFilter = (sortModel) => {
  const columnFilters = Object.entries(sortModel).map(([key, value]) => `${key}: {_eq: "${value}"}`).join();
  return columnFilters;
};