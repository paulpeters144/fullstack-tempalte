import * as cdk from "aws-cdk-lib";
import type { Construct } from "constructs";

interface CloudfrontDistProps {
   construct: Construct;
   appName: string;
   stage: string;
   webAppBucket: cdk.aws_s3.Bucket;
}

export class CloudfrontDist {
   resource: cdk.aws_cloudfront.Distribution;

   constructor(props: CloudfrontDistProps) {
      const { construct, appName, stage, webAppBucket } = props;
      const distName = `${appName}-${stage}-cloudfront-dist`;

      const { S3BucketOrigin } = cdk.aws_cloudfront_origins;
      const cf = cdk.aws_cloudfront;
      const origin = S3BucketOrigin.withOriginAccessControl(webAppBucket);

      this.resource = new cdk.aws_cloudfront.Distribution(construct, distName, {
         defaultBehavior: {
            origin: origin,
            viewerProtocolPolicy: cf.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            compress: true,
            cachePolicy: cf.CachePolicy.CACHING_DISABLED,
         },
         defaultRootObject: "index.html",
         errorResponses: [
            {
               httpStatus: 404,
               responseHttpStatus: 200,
               responsePagePath: "/index.html",
            },
         ],
         priceClass: cf.PriceClass.PRICE_CLASS_100,
         enabled: true,
         comment: `CloudFront distribution for ${appName} ${stage}`,
      });

      new cdk.CfnOutput(construct, "CloudfrontDistDomainName", {
         value: this.resource.domainName,
         description: "Cloudfront Dist Domain Name",
      });
   }
}
