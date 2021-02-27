import cdk = require('@aws-cdk/core');
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import { Bucket } from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as route53 from '@aws-cdk/aws-route53';
import * as targets from '@aws-cdk/aws-route53-targets';

const websiteDistSourcePath = './app';
/*
To Do
 - Add wildcard DNS for zone
 - Add Certificate
 - Atatched certificate to CF
 - Attach Alternaemcname to CF
*/

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const primaryDomain = 'randomsite.site'
    const subDomain = `*.${primaryDomain}`

    const sourceBucket = new Bucket(this, 'cdk-mypoc-website-s3', {
      websiteIndexDocument: 'index.html',
      bucketName: 'cdk-mypoc-usa'
    });

    const OriginAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OIA', {
      comment: "Setup Access from CF to the bucket ( read )"
    });
    sourceBucket.grantRead(OriginAccessIdentity);

    new BucketDeployment(this, 'DeployWebsite', {
      sources: [Source.asset(websiteDistSourcePath)],
      destinationBucket: sourceBucket
    });

    const zone = route53.HostedZone.fromLookup(this, 'baseZone', {
      domainName: primaryDomain
    });

    const myCertificate = new acm.DnsValidatedCertificate(this, 'mySiteCert', {
      domainName: subDomain,
      hostedZone: zone,
    });

    const cfDist = new cloudfront.CloudFrontWebDistribution(this, 'myDist', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: sourceBucket,
            originAccessIdentity: OriginAccessIdentity
          },
          behaviors: [
            { isDefaultBehavior: true }
          ]
        }
      ],
      aliasConfiguration: {
        acmCertRef: myCertificate.certificateArn,
        names: [subDomain],
      }
    });
  
    new route53.ARecord(this, 'AliasRecord', {
      zone,
      recordName: subDomain,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(cfDist)),
    });
  }
}