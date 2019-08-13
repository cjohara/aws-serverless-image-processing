# Resizing Images with Amazon CloudFront and Lambda@Edge

Resize images on the fly with an AWS S3 CDN.

View or download a copy of the [Presentation PDF](https://github.com/cjohara/aws-serverless-image-processing/blob/master/Serverless%20Image%20Processing%20with%20Amazon%20AWS.pdf)

Solution 1: [AWS Serverless Image Handler](https://aws.amazon.com/solutions/serverless-image-handler/)

Solution 2: This code and [AWS Blog](https://aws.amazon.com/blogs/networking-and-content-delivery/resizing-images-with-amazon-cloudfront-lambdaedge-aws-cdn-blog/)

## Build deployment packages

1. Install npm packages

```
$. npm install
```

2. Build docker container

```
$. npm run docker:build
```

3. Generate deployment packages (repeat after code changes)

```
$. npm run build
```
