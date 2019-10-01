enum Position {
  Left,
  Center,
  Right,
}

export interface ToolbarItem {
  icon?: string;
  text: string;
  tooltip: string;
  position: Position;
}

const toolbarItems: { [key: string]: ToolbarItem } = {
  add: {
    icon: 'add_circle',
    text: 'Add',
    tooltip: 'Add a New Row to Grid',
    position: Position.Center,
  },
};

export default toolbarOperations;
