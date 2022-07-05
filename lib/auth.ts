import { OpenstackProvider } from '../.gen/providers/openstack';
import { Construct } from 'constructs';

export function getOpenstackProvider(scope: Construct){
  const provider = new OpenstackProvider(scope, "openstack-provider", {
    userName: process.env.OS_USERNAME,
    password: process.env.OS_PASSWORD,
    tenantName: process.env.OS_PROJECT_NAME,
    userDomainName: process.env.OS_USER_DOMAIN_NAME,
    projectDomainName: process.env.OS_PROJECT_DOMAIN_NAME,
    authUrl: process.env.OS_AUTH_URL,
    cacertFile: process.env.OS_CACERT
  });
  return provider;
}
