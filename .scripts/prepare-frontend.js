const { CloudFormationClient, ListExportsCommand } = require('@aws-sdk/client-cloudformation');
const path = require('path');
const fs = require('fs');

console.log('make sure you already deployed the backend!');

Promise.resolve()
  .then(async () => {
    const client = new CloudFormationClient({});

    const response = await client.send(new ListExportsCommand({}));
    if (!response.Exports.length) {
      return console.error('Failed! Deploy the backend first');
    }
    const outputs = response.Exports.reduce(
      (prev, current) => {
        prev[current.Name] = current.Value;
        return prev;
      },
      { region: await client.config.region() }
    );

    const resourceJsonPath = path.resolve(
      __dirname,
      '..',
      'frontend',
      'src',
      'aws-references.json'
    );
    if (fs.existsSync(resourceJsonPath)) {
      console.log('going to delete the old resource json. Dumping content to stdout...');
      console.log(fs.readFileSync(resourceJsonPath, 'utf-8'));
      fs.unlinkSync(resourceJsonPath);
    }

    console.log('Write to file', resourceJsonPath);
    fs.writeFileSync(resourceJsonPath, JSON.stringify(outputs, null, 4));
    console.log('Successfully finished!');
  })
  .catch((err) => {
    console.error('Failed', err);
  });
