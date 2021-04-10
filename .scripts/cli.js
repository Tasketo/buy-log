#!/usr/bin/env node

const commander = require('commander');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.resolve(__dirname, '..', 'env.json');

let defaultValues = {};

if (fs.existsSync(CONFIG_FILE)) {
  const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
  defaultValues = JSON.parse(content);
}

commander
  .version('1.0.0')
  .command('setup')
  .action(() => {
    const questions = [
      {
        type: 'input',
        name: 'domain',
        message: 'domain (e.g. buy-log.example.com)',
        default: defaultValues.domain || '',
      },
      {
        type: 'input',
        name: 'adminEmail',
        message: 'admin email (e.g. admin@example.com)',
        default: defaultValues.adminEmail || '',
      },
      {
        type: 'input',
        name: 'prefix',
        message: 'prefix for aws resources',
        default: defaultValues.prefix || 'buy-log',
      },
    ];

    inquirer
      .prompt(questions)
      .then((data) => {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 4));
        console.log('Setup finished!');
        process.exit(0);
      })
      .catch((err) => {
        console.error(err);
        process.exit(1);
      });
  });

commander.parse(process.argv);
