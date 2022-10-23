import { resolve } from 'path';
import { config } from 'dotenv';
import { EnvironmentConfig } from './environment';
import { LOCATION, OWNER, SERVICE, STACK_NAME, STAGE } from './constants';

config({ path: resolve(__dirname, '../.env') });

export function TagsProp(serviceName: string, envConf: EnvironmentConfig) {
  const tags: any = {
    [STACK_NAME]: `${envConf.pattern}-vc-${envConf.stage}-${serviceName}`,
    [SERVICE]: serviceName,
    [LOCATION]: envConf.pattern,
    [OWNER]: envConf.owner,
    [STAGE]: envConf.stage,
  };

  return tags;
}
