import { Environment } from 'aws-cdk-lib';
import { CDK_DEFAULT_ACCOUNT, CDK_DEFAULT_REGION } from './configs';
import * as constant from './constants';


export interface EnvironmentConfig extends Environment {
  pattern: string;
  envTag: string;
  stage: string;
  owner: string;
};

export const devEnv: EnvironmentConfig = {
  pattern: 'sin',
  envTag: constant.DEV_ENV_TAG,
  stage: constant.DEV_ENV_STAGE,
  account: CDK_DEFAULT_ACCOUNT,
  region: CDK_DEFAULT_REGION,
  owner: 'development',
};
