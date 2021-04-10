mkdir -p frontend/dist &&

cd lambda &&
npm run build &&

cd ../cdk &&
cdk deploy backend --require-approval never &&

cd .. &&
npm run frontend:prepare &&

cd frontend &&
npm run build &&

cd ../cdk &&
cdk deploy frontend --require-approval never &&

echo 'Done, have fun!'