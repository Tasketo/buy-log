import { Certificate, DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';
import { CloudFrontWebDistribution, OriginAccessIdentity, SecurityPolicyProtocol, ViewerCertificate } from '@aws-cdk/aws-cloudfront';
import { Bucket } from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import * as cdk from '@aws-cdk/core';
import { HostedZone, CnameRecord } from '@aws-cdk/aws-route53'

import { prefix, domain } from '../../env.json';


export class FrontendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, `${prefix}-frontend`, {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      websiteIndexDocument: "index.html"
    });

    const cloudFrontOAI = new OriginAccessIdentity(this, `${prefix}-oai`);
    bucket.grantRead(cloudFrontOAI.grantPrincipal);

    const zone = HostedZone.fromLookup(this, `${prefix}-hosted-zone`, {
      domainName: domain.substring(domain.indexOf('.') + 1)
    });

    const certificate = new DnsValidatedCertificate(this, `${prefix}-certificate`, {
      domainName: domain,
      hostedZone: zone,
      region: 'us-east-1'
    });

    // Using exiting cert: needs to be us-east-1
    // const certificate = Certificate.fromCertificateArn(this, `${prefix}`,
    //   "arn:aws:acm:us-east-1:791755369473:certificate/3c2e16a0-94b2-4968-ab03-efb90d426876")

    const distribution = new CloudFrontWebDistribution(this, `${prefix}-cf-distribution`, {
      originConfigs: [{
        s3OriginSource: {
          s3BucketSource: bucket,
          originAccessIdentity: cloudFrontOAI,
        },
        behaviors: [{ isDefaultBehavior: true }]
      }],
      viewerCertificate: ViewerCertificate.fromAcmCertificate(
        certificate,
        {
          aliases: [domain],
          securityPolicy: SecurityPolicyProtocol.TLS_V1_2_2019,
        },
      )
    })

    new BucketDeployment(this, `${prefix}-deployment`, {
      retainOnDelete: false,
      sources: [Source.asset("../frontend/dist")],
      destinationBucket: bucket,
      distributionPaths: ['/index.html'], // invalid only index.html. Other files are versioned
      distribution,
    });
    new cdk.CfnOutput(this, 'cloudfront', { value: distribution.distributionDomainName, exportName: `${prefix}-distribution-domain` });

    new CnameRecord(this, `${prefix}-c-record`, {
      zone: zone,
      recordName: domain.substring(0, domain.indexOf(".")),
      domainName: distribution.distributionDomainName
    });
  }
}
