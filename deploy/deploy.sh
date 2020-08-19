#!/bin/bash -e

buildid=$GITHUB_RUN_ID
artifactbucket=$BUCKET_NAME
branch=${GITHUB_REF##8/} # GITHUB_REF formatted like refs/head/branch-name.
accountid=$ACCOUNT_ID
capacity=3
regions="us-east-1\nus-east-2"
regionarray=()

while read -r line;
do
    regionarray+=("$line")
done < <(echo -e $regions)

echo "found regions"
printf '%s\n' "${regionarray[@]}"

echo "creating lambda zip"
rm lambda.zip
zip lambda.zip src/* -j
s3destinationkey="$branch/$buildid.zip"
s3destination="s3://$artifactbucket/$s3destinationkey"
# aws --profile name s3 cp lambda.zip $s3destination
aws s3 cp lambda.zip $s3destination

if [ "$branch" == "master" ]
then
  capacity=5
fi

alwaysreport="0"
if [ "$branch" == "dev" ]
then
  alwaysreport="1"
fi

prefix="$branch-aws-eks-ami"
eventpattern="arn:aws:events:us-east-1:$accountid:rule/$prefix-*"


echo "creating main cloudformation stack"
# aws --profile name \
aws cloudformation deploy \
    --stack-name $branch \
    --template-file "deploy/core.template" \
    --parameter-overrides \
        resourceNamePrefix=$prefix \
        dynamoReadCapacity=$capacity \
        dynamoWriteCapacity=$capacity \
        lambdaCodeBucket=$artifactbucket \
        lambdaCodeKey=$s3destinationkey \
        eventRulePattern=$eventpattern \
        accountId=$accountid \
        environment=$branch \
        alwaysreport=$alwaysreport

c=0
echo "checking to see if stack is deployed..."
while [ $c -lt 12 ]
do
    if [ $c -ne 0 ]; then sleep 10; fi
    c+=1
    s=$(aws cloudformation describe-stacks --stack-name=$branch --output json | grep StackStatus | sed 's/^.*: //;s/[",]//g')
    # s=$(aws --profile name cloudformation describe-stacks --stack-name=$branch --output json | grep StackStatus | sed 's/^.*: //;s/[",]//g')
    echo "found status $s"
    if [[ $s == *"COMPLETE"* ]]
    then
        echo "stack deployed"
        break
    fi
done

echo "sleeping 5s..."
sleep 5

# deploy triggers and sns topics for each region
for r in "${regionarray[@]}"
do
    echo ""
    echo "creating triggers and topics for region $r"
    triggerstackname="$branch-$r-trigger"
    lambdaname="$branch-aws-eks-ami-checker"
    lambdaarn="arn:aws:lambda:us-east-1:$accountid:function:$lambdaname"
    # aws --profile name \
    aws cloudformation deploy \
        --stack-name $triggerstackname \
        --template-file "deploy/triggers.template" \
        --parameter-overrides \
            eventName=$triggerstackname \
            lambdaTargetArn=$lambdaarn \
            lambdaName=$lambdaname \
            targetRegion=$r \
            schedule="cron(0 * * * ? *)"

    c=0
    echo "checking to see if stack $triggerstackname is deployed..."
    while [ $c -lt 12 ]
    do
        if [ $c -ne 0 ]; then sleep 10; fi
        c+=1
        # s=$(aws --profile name cloudformation describe-stacks --stack-name=$triggerstackname --output json | grep StackStatus | sed 's/^.*: //;s/[",]//g')
        s=$(aws cloudformation describe-stacks --stack-name=$triggerstackname --output json | grep StackStatus | sed 's/^.*: //;s/[",]//g')
        echo "found status $s"
        if [[ $s == *"COMPLETE"* ]]
        then
            echo "stack $triggerstackname deployed"
            break
        fi
    done
    
    snsstackname="$branch-$r-sns"
    # aws --profile name \
    aws --region $r \
        cloudformation deploy \
        --stack-name $snsstackname \
        --template-file "deploy/regionalsns.template" \
        --parameter-overrides \
            topicName="$branch-aws-eks-ami" \
            accountId=$accountid \
            environment=$branch

    c=0
    echo "checking to see if stack $snsstackname is deployed..."
    while [ $c -lt 12 ]
    do
        if [ $c -ne 0 ]; then sleep 10; fi
        c+=1
        # s=$(aws --profile name --region $r cloudformation describe-stacks --stack-name=$snsstackname --output json | grep StackStatus | sed 's/^.*: //;s/[",]//g')
        s=$(aws --region $r cloudformation describe-stacks --stack-name=$snsstackname --output json | grep StackStatus | sed 's/^.*: //;s/[",]//g')
        echo "found status $s"
        if [[ $s == *"COMPLETE"* ]]
        then
            echo "stack $snsstackname deployed"
            break
        fi
    done

    echo ""
    echo "sleeping 1s..."
    sleep 1
    echo "complete creating resources for region $r"
done

echo "end"
