import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';
import { getOpenstackProvider } from '../lib';
import { ComputeInstanceV2 } from '../.gen/providers/openstack';

export class CodeServerStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);


    // define resources here
    getOpenstackProvider(this);

    const userData = `#!/bin/sh
      export DEBIAN_FRONTEND=noninteractive

      # os update
      apt -y update && apt -y upgrade

      # install docker
      apt-get -y install ca-certificates curl gnupg lsb-release
      mkdir -p /etc/apt/keyrings
      curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
      echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
      apt-get -y update && apt-get -y install docker-ce docker-ce-cli containerd.io docker-compose-plugin

      # install kubectl
      curl -LO "https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl"
      chmod +x ./kubectl
      mv ./kubectl /usr/local/bin/kubectl

      # install terraform
      curl -fsSL https://apt.releases.hashicorp.com/gpg | apt-key add -
      apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
      apt-get -y update && apt-get -y install terraform

      # install code server
      curl -fOL https://github.com/coder/code-server/releases/download/v4.5.0/code-server_4.5.0_amd64.deb
      dpkg -i code-server_4.5.0_amd64.deb
      systemctl enable --now code-server@root

      # dependencies for pyenv
      apt-get -y install make build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev

      # mount volume
      echo '/dev/vdb /root ext4 defaults 0 0' >> /etc/fstab
      mount -a

      # restart code server
      systemctl restart code-server@root
    `;

    new ComputeInstanceV2(this, 'CodeServer', {
      name: 'code-server',
      imageName: 'ubuntu-2204',
      flavorName: 's1.large',
      keyPair: 'bbrfkr',
      securityGroups: ['allow-all'],
      network: [{ name: 'public' }],
      userData: userData,
      blockDevice: [
        {
          uuid: "a51939c7-256f-44e1-9ce6-e67f3d9b3d71",
          sourceType: "image",
          destinationType: "local",
          bootIndex: 0,
          deleteOnTermination: true,
        },
        {
          uuid: "21f06215-6dc4-41fe-9144-af7b4cde8173",
          sourceType: "volume",
          destinationType: "volume",
          bootIndex: 1,
          deleteOnTermination: false,
        }
      ]
    });
  }
}
