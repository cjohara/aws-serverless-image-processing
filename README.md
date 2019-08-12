# Resizing Images with Amazon CloudFront and Lambda@Edge

Resize images on the fly with an AWS S3 CDN.

Based on a blog post by: [Amazon Web Services](https://aws.amazon.com/blogs/networking-and-content-delivery/resizing-images-with-amazon-cloudfront-lambdaedge-aws-cdn-blog/)

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
