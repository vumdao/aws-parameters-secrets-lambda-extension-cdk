import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";
import { App, CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Key } from "aws-cdk-lib/aws-kms";
import {
  FunctionUrlAuthType,
  LayerVersion,
  Runtime,
} from "aws-cdk-lib/aws-lambda";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
import { join } from "path";
import {
  AWS_PARAMETERS_SECRETS_LAMBDA_EXTENSION_LAYER,
  SSM_SLACK_WEBHOOK_PRAMETER_NAME,
} from "./shared/constants";
import { devEnv, EnvironmentConfig } from "./shared/environment";
import { TagsProp } from "./shared/tagging";

export class ParameterSecretLambdaExtensionStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    reg: EnvironmentConfig,
    props: StackProps
  ) {
    super(scope, id, props);

    const prefix = `${reg.pattern}-${reg.stage}`;

    /**
     * CMK to encrypt the SSM parameter store
     * Note:
     *  CDK does not support to create SSM parameter store with SecureString type,
     *  so we need to create manually based on this CMK
     */
    const lambdaOpsKey = new Key(this, `${prefix}-lambda-kms-key`, {
      description:
        "Lambda KMS key for lambda function to get SSM key parameter store",
      alias: `${prefix}-lambda-kms-key`,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const lambdaRole = new Role(
      this,
      `${prefix}-parameters-secret-lambda-extension-role`,
      {
        roleName: `${prefix}-parameters-secret-lambda-extension-role`,
        assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          {
            managedPolicyArn:
              "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
          },
        ],
      }
    );

    const ssmSTS = new PolicyStatement({
      sid: "GetParameterStore",
      actions: ["ssm:GetParameter"],
      resources: ["*"],
    });

    const kmsSTS = new PolicyStatement({
      sid: "KMSLambdaOps",
      actions: ["kms:Decrypt"],
      resources: [lambdaOpsKey.keyArn],
    });

    [ssmSTS, kmsSTS].forEach((sts) => {
      lambdaRole.addToPolicy(sts);
    });

    const lambdaFn = new PythonFunction(
      this,
      `${prefix}-parameters-secrets-extension-test`,
      {
        functionName: `${prefix}-parameters-secrets-extension-test`,
        runtime: Runtime.PYTHON_3_9,
        role: lambdaRole,
        entry: join(__dirname, "lambda-handler"),
        logRetention: RetentionDays.ONE_DAY,
        layers: [
          LayerVersion.fromLayerVersionArn(
            this,
            `AWS-Parameters-and-Secrets-Lambda-Extension-layer-2`,
            AWS_PARAMETERS_SECRETS_LAMBDA_EXTENSION_LAYER
          ),
        ],
        environment: {
          SSM_SLACK_WEBHOOK_PRAMETER_NAME: SSM_SLACK_WEBHOOK_PRAMETER_NAME,
        },
      }
    );
    const lambdaUrl = lambdaFn.addFunctionUrl({
      authType: FunctionUrlAuthType.AWS_IAM,
    });

    new CfnOutput(this, `${prefix}-parameters-secrets-extension-test-url`, {
      value: lambdaUrl.url,
    });
  }
}

const app = new App();

new ParameterSecretLambdaExtensionStack(
  app,
  "aws-parameters-secrets-lambda-extension-cdk-dev",
  devEnv,
  { env: devEnv, tags: TagsProp("parameters-secrets-extension-test", devEnv) }
);

app.synth();
