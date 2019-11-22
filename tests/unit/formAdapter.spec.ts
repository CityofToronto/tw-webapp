import apolloClient from '../../src/apollo';

// jest.setTimeout(30000);

test('equals ProjectDetailsType', async () => {
  await expect(apolloClient.getTypename('project_details')).resolves.toBe(
    'ProjectDetailsType',
  );
}, 20000);
