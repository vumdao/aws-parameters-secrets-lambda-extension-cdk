""" Lambda function send message to slack """
import json
import requests
import os
from datetime import datetime


def get_ssm_parameter_store():
    SSM_SLACK_WEBHOOK_PRAMETER_NAME = os.getenv(
        'SSM_SLACK_WEBHOOK_PRAMETER_NAME')
    url = 'http://localhost:2773'
    header = {'X-Aws-Parameters-Secrets-Token': os.getenv('AWS_SESSION_TOKEN')}
    parameter_encode = requests.utils.quote(SSM_SLACK_WEBHOOK_PRAMETER_NAME)
    path = f'systemsmanager/parameters/get?name={parameter_encode}&withDecryption=true'
    res = requests.get(f'{url}/{path}', headers=header)
    if res.status_code == 200:
        data = res.json()
        return data['Parameter']['Value']
    else:
        print(
            f"Failed to get SSM parameter store {SSM_SLACK_WEBHOOK_PRAMETER_NAME}")
        return None


def send_slack(text):
    """ Send message to slack """
    level = ':white_check_mark: INFO :white_check_mark:'
    footer_icon = 'https://cdkworkshop.com/images/new-cdk-logo.png'
    color = '#36C5F0'

    curr_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    webhook_url = get_ssm_parameter_store()
    if webhook_url is None:
        return 400
    slack_payload = {"username": "aws-eks-cdk-blueprints-pull-request",
                     "attachments": [{"fallback": "Required plain-text summary of the attachment.",
                                      "pretext": level,
                                      "color": color,
                                      "title": f'{text}\n',
                                      "footer": curr_time,
                                      "footer_icon": footer_icon}]}
    requests.post(webhook_url, data=json.dumps(slack_payload),
                  headers={'Content-Type': 'application/json'})


def handler(event, context):
    """Lambda handler function"""
    send_slack(event['queryStringParameters']['message'])
