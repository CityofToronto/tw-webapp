import gql from 'graphql-tag';
import { createClient } from '@/apollo/vue-apollo';


// GraphQL does not take in a object, therefore it needs to be
// Changed from key: value to key: "value"
// JSON.stringify does not work, creates "value":"key"
// And GraphQL wants a name not a string for 'value'


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

const parse = type => {
  const filterValue = filterType => {
    const modifiedValue = {
      contains: value => `%${value}%`,
      notContains: value => `%${value}%`,
      startsWith: value => `${value}%`,
      endsWith: value => `%${value}`,
      default: value => value,

    };
    return modifiedValue[filterType] || modifiedValue.default;
  };
  const parseSingular = (key, condition) => `${key}: {${mapping.get(condition.type)}: "${filterValue(condition.type)(condition.filter)}"}`;
  const parseMultiple = (key, value) => {
    const { condition1, condition2, operator } = value;
    return `${mapping.get(operator)}: [{${parseSingular(key, condition1)}}, {${parseSingular(key, condition2)}}]`;
  };

  const parseSet = (key, value) => `${key}: {_in: [${value.values.map(x => `"${x}"`).join(',')}]}`;

  const filterFunctions = {
    text: type.operator ? parseMultiple : parseSingular,
    number: type.operator ? parseMultiple : parseSingular,
    set: parseSet,
  };
  return filterFunctions[type.filterType];
};

// This filter constructs a GraphQL with all the different
// types of relationships such as contains, equals, and, or
const constructFilter = sortModel => {
  if (typeof sortModel === 'undefined' || sortModel === null) {
    return '{}';
  }
  const columnFilters = Object.entries(sortModel).map(([key, value]) => parse(value)(key, value));
  const joinedFilters = `{_and: {${columnFilters.join(', ')}}}`;
  return joinedFilters;
};

// This simple filter just maps key:value to key: {_eq: "value"} and joins
const constructSimpleFilter = sortModel => {
  const columnFilters = Object.entries(sortModel).map(([key, value]) => `${key}: {_eq: "${value}"}`).join();
  return columnFilters;
};

export default class GridRequest {
  constructor() {
    this.apollo = createClient();
  }

  // Delete an entire entry
  delete({
    tableName,
    id,
  }) {
    this.apollo.mutate({
      mutation: gql`
      mutation {
        delete_${tableName}(
        where: {
          id: {_eq: ${id}}
        }) {
        affected_rows
      }
    }`,
    })
      .then(() => {

      })
      .catch(error => dispatchError(error));
  }

  getIdFromData({
    tableName,
    filterModel,
  }) {
    console.log(constructSimpleFilter(filterModel));
    return this.apollo.query({
      query: gql`
        query getId {
          ${tableName} (
            where: {
              ${constructSimpleFilter(filterModel)}
            }
          ) {
            id
          }
        }
      `,
    }).then(response => response.data[tableName][0].id);
  }



  // Update an entry and then trigger callback (that refreshes grid)
  

  // TODO This works except that it does not return the tablename
  
