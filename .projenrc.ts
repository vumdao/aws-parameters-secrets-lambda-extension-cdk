import { awscdk } from 'projen';
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.47.0',
  defaultReleaseBranch: 'main',
  name: 'aws-parameters-secrets-lambda-extension-cdk',
  projenrcTs: true,
  deps: [
    'env-var', 'dotenv',
    '@aws-cdk/aws-lambda-python-alpha',
  ],

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});

project.gitignore.addPatterns('node_modules')
project.gitignore.addPatterns('.env');
project.gitignore.addPatterns('*.yaml');

project.synth();