import apolloClient from '../../src/apollo';

it('equals ProjectDetailsType', () => {
  expect.assertions(1);
  return expect(apolloClient.getTypename('project_details')).resolves.toEqual(
    'ProjectDetailsType',
  );
});
