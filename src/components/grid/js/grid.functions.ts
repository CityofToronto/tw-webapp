import { CellValueChangedEvent, ColDef } from 'ag-grid-community';
import { getColumns, update } from '../apollo';
import * as FIELDS from './grid.columns';
import * as GRID_CONFIG from './grid.config';

export const setColumnParser = (inputValue: string | boolean | number): string => {
  switch (typeof inputValue) {
    case 'string':
      return 'textColumn';
    case 'boolean':
      return 'booleanColumn';
    case 'number':
      return 'numberColumn';
    default:
      throw new Error(
        `ERROR: ${typeof inputValue} is not a valid column type.`,
      );
  }
};

export type ColumnTypes = 'booleanColumn' | 'numberColumn' | 'textColumn';

export const getColumnType = (inputType: string): ColumnTypes => {
  const columnTypes = {
    boolean: 'booleanColumn',
    numeric: 'numberColumn',
    Int: 'numberColumn',
    String: 'textColumn',
  };

  return columnTypes[inputType] || columnTypes.String;
};
// TODO Define columns you want to see
export const defineColumn = (
  column: {name: string; type: object}, editable: boolean,
): ColDef => {
  const columnData = {
    headerName: FIELDS.HEADERS.get(column.name),
    field: column.name,
    resizable: true,
    editable: column.name !== 'id' && editable,
    hide: column.name.includes('_id'),
    sort: column.name === 'id' ? 'asc' : null,
    sortable: true,
    type: getColumnType(
      column.type.ofType ? column.type.ofType.name : column.type.name,
    ),
  };
  return <ColDef>columnData;
};

export const getColumnDefs = async (
  { tableName, editable }: {tableName: string; editable: boolean},
): Promise<ColDef[]> => {
  // debugger;
  const columns = await getColumns({
    tableName,
  });


  // Filter out non-scalar quantities to be left with strings, ints and booleans
  const columnDefs = columns.map(column => defineColumn(column, editable));

  columnDefs.unshift(GRID_CONFIG.editColumn);
  return columnDefs;
};

export const updateCell = async (
  { event, tableName }: {event: CellValueChangedEvent; tableName: string},
) => {
  const callBack = () => {
    event.node.setData(event.data);
  };

  const unsucessfulCallBack = () => {
    event.node.setDataValue(event.column.getColId(), event.oldValue);
  };

  await update({
    tableName,
    data: event.data,
    id: event.data.id,
    callBack,
    unsucessfulCallBack,
  });

  // const queryFields = Object.keys(event.data);
  // const dataFields = Object.entries(event.data)
  //   .map(([key, value]): string => `${key}: "${value}"`)
  //   .join();
  //   // TODO Refactor this to use the grid.apollo.js update function
  // return apollo
  //   .mutate({
  //     mutation: gql`
  //   mutation updateField {
  //     update_${tableName} (
  //       where: {
  //         id: { _eq: ${event.data.id} }
  //       },
  //       _set: {
  //         ${dataFields}
  //       }
  //     ) {
  //       returning {
  //         ${queryFields}
  //       }
  //     }
  //   }`,
  //   })
  //   .then((response: object): object => {
  //     event.node.setData(event.data);
  //     return response;
  //   })
  //   .catch((error: string): never => {
  //     event.node.setDataValue(event.column.colId, event.oldValue);
  //     throw new Error(error);
  //   });
};
