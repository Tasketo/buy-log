<template>
  <el-page-header @back="goBack" content="About" />
  <div class="about">
    <h1>Buy log</h1>

    <el-row>
      <p>
        This project is for education purpose only. Don't use it in production.
      </p>
    </el-row>

    <el-row>
      <span>Boosted by:</span>
      <ul>
        <li>AWS Amplify</li>
        <li>AWS Cognito</li>
        <li>AWS API Gateway</li>
        <li>AWS Lambda</li>
        <li>AWS DynamoDB</li>
        <li>AWS S3</li>
      </ul>
    </el-row>
  </div>
</template>

<script lang="ts">
import router from '@/router';

export default {
  setup() {
    const goBack = () => {
      if (window.history.length) {
        router.back();
      } else {
        router.push({ path: '/' });
      }
    };
    return { goBack };
  }
};
</script>
