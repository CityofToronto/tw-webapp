const fetch = require('node-fetch');
const { introspectionQuery } = require('graphql');
const ProxyAgent = require('proxy-agent');
const fs = require('fs');

const fun = async () => {
  const response = await fetch(
    'https://tw-datamodel.herokuapp.com/v1/graphql',
    {
      method: 'POST',
      agent: new ProxyAgent('http://abrashe:e2yT87641@proxy.toronto.ca:8080'),
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: introspectionQuery }),
    },
  );

  const text = await response.text();
  fs.writeFileSync('schema.graphql', text);
};
fun();

/*
 * .then(res => res.json())
 * .then(res => fs.writeFileSync('result.json', JSON.stringify(res.data, null, 2)));
 */
